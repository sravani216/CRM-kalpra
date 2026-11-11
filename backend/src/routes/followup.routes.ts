import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { Role, FollowUpStatus, NotificationType } from '@prisma/client';
import { logAudit } from '../utils/audit.js';

const router = Router();

const scheduleFollowUpSchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
  clientId: z.string().min(1, 'Client ID is required'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  type: z.string().default('Call'), // Call, Meeting, Video Conference, Field Visit, Email
  discussionNotes: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
});

const completeFollowUpSchema = z.object({
  callOutcome: z.string().min(1, 'Call outcome is required'),
  clientResponse: z.string().min(2, 'Client response summary is required'),
  discussionNotes: z.string().optional().nullable(),
  nextFollowUpDate: z.string().optional().nullable(),
  nextFollowUpType: z.string().optional().nullable(),
});

// List follow-ups with role isolation and filters
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      filter = 'all', // all, today, upcoming, overdue, completed
      userId = '',
      clientId = '',
      leadId = '',
    } = req.query;

    const where: any = { isDeleted: false };

    // Employee isolation
    if (req.user!.role === Role.EMPLOYEE) {
      where.userId = req.user!.id;
    } else if (userId) {
      where.userId = userId as string;
    }

    if (clientId) where.clientId = clientId as string;
    if (leadId) where.leadId = leadId as string;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    if (filter === 'today') {
      where.scheduledDate = { gte: startOfToday, lte: endOfToday };
      where.status = FollowUpStatus.SCHEDULED;
    } else if (filter === 'upcoming') {
      where.scheduledDate = { gt: endOfToday };
      where.status = FollowUpStatus.SCHEDULED;
    } else if (filter === 'overdue') {
      where.OR = [
        { status: FollowUpStatus.MISSED },
        {
          status: FollowUpStatus.SCHEDULED,
          scheduledDate: { lt: startOfToday }
        }
      ];
    } else if (filter === 'completed') {
      where.status = FollowUpStatus.COMPLETED;
    }

    const followups = await prisma.followUp.findMany({
      where,
      orderBy: { scheduledDate: 'asc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            organization: true,
            phone: true,
            email: true,
            location: true,
          }
        },
        lead: {
          select: {
            id: true,
            leadId: true,
            title: true,
            status: true,
            priority: true,
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            designation: true,
          }
        }
      }
    });

    res.json({ success: true, data: followups });
  } catch (err: any) {
    console.error('Fetch followups error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve follow-ups.' });
  }
});

// Schedule follow-up
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = scheduleFollowUpSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
      return;
    }

    const data = parseResult.data;
    const count = await prisma.followUp.count();
    const followupId = `FOL-${1001 + count}`;

    const assignedUserId = (req.user!.role === Role.EMPLOYEE)
      ? req.user!.id
      : (data.userId || req.user!.id);

    const followUp = await prisma.followUp.create({
      data: {
        followupId,
        leadId: data.leadId,
        clientId: data.clientId,
        userId: assignedUserId,
        scheduledDate: new Date(data.scheduledDate),
        type: data.type,
        discussionNotes: data.discussionNotes,
        status: FollowUpStatus.SCHEDULED,
      },
      include: {
        client: true,
        lead: true,
        user: true,
      }
    });

    // Also update lead nextFollowUpDate
    await prisma.lead.update({
      where: { id: data.leadId },
      data: { nextFollowUpDate: new Date(data.scheduledDate) }
    });

    // Notification to assigned user if scheduled by another
    if (assignedUserId !== req.user!.id) {
      await prisma.notification.create({
        data: {
          userId: assignedUserId,
          title: `Follow-up Scheduled: ${followUp.client.organization}`,
          message: `${req.user!.name} scheduled a ${followUp.type} for ${new Date(followUp.scheduledDate).toLocaleString()}`,
          type: NotificationType.FOLLOWUP_UPCOMING,
          link: '/followups'
        }
      });
    }

    await logAudit({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'FOLLOWUP_SCHEDULED',
      entityType: 'FOLLOWUP',
      entityId: followUp.id,
      details: { followupId: followUp.followupId, scheduledDate: followUp.scheduledDate },
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, message: 'Follow-up scheduled successfully.', data: followUp });
  } catch (err: any) {
    console.error('Schedule follow-up error:', err);
    res.status(500).json({ success: false, message: 'Failed to schedule follow-up.' });
  }
});

// Complete follow-up and optionally schedule next one
router.put('/:id/complete', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parseResult = completeFollowUpSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
      return;
    }

    const followUp = await prisma.followUp.findUnique({
      where: { id },
      include: { lead: true }
    });

    if (!followUp || followUp.isDeleted) {
      res.status(404).json({ success: false, message: 'Follow-up not found.' });
      return;
    }

    if (req.user!.role === Role.EMPLOYEE && followUp.userId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { callOutcome, clientResponse, discussionNotes, nextFollowUpDate, nextFollowUpType } = parseResult.data;

    const updated = await prisma.followUp.update({
      where: { id },
      data: {
        status: FollowUpStatus.COMPLETED,
        completedAt: new Date(),
        callOutcome,
        clientResponse,
        discussionNotes,
        nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
      }
    });

    // Mark lead as contacted
    await prisma.lead.update({
      where: { id: followUp.leadId },
      data: {
        hasContacted: true,
        contactedAt: new Date(),
        nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
      }
    });

    // If next follow-up date was provided, create the subsequent follow-up record!
    if (nextFollowUpDate) {
      const count = await prisma.followUp.count();
      await prisma.followUp.create({
        data: {
          followupId: `FOL-${1001 + count}`,
          leadId: followUp.leadId,
          clientId: followUp.clientId,
          userId: followUp.userId,
          scheduledDate: new Date(nextFollowUpDate),
          type: nextFollowUpType || 'Call',
          status: FollowUpStatus.SCHEDULED,
          discussionNotes: `Follow-up to discussion on ${new Date().toLocaleDateString()}: ${clientResponse}`,
        }
      });
    }

    await logAudit({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'FOLLOWUP_COMPLETED',
      entityType: 'FOLLOWUP',
      entityId: id,
      details: { callOutcome, clientResponse },
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Follow-up completed successfully.', data: updated });
  } catch (err: any) {
    console.error('Complete follow-up error:', err);
    res.status(500).json({ success: false, message: 'Failed to complete follow-up.' });
  }
});

// Cancel follow-up
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.followUp.update({
      where: { id },
      data: { status: FollowUpStatus.CANCELLED, isDeleted: true }
    });
    res.json({ success: true, message: 'Follow-up cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to cancel follow-up.' });
  }
});

export default router;

