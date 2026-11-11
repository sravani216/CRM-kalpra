import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { Role, LeadStatus, ActivityType } from '@prisma/client';
import { logAudit } from '../utils/audit.js';

const router = Router();

const PIPELINE_STAGES: LeadStatus[] = [
  LeadStatus.NEW,
  LeadStatus.ASSIGNED,
  LeadStatus.CONTACTED,
  LeadStatus.INTERESTED,
  LeadStatus.DEMO_SCHEDULED,
  LeadStatus.PROPOSAL_SENT,
  LeadStatus.NEGOTIATION,
  LeadStatus.WON,
  LeadStatus.LOST,
  LeadStatus.ON_HOLD,
];

// Get pipeline board data
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { assignedToId = '', priority = '' } = req.query;

    const where: any = { isDeleted: false };

    // Employee isolation
    if (req.user!.role === Role.EMPLOYEE) {
      where.assignedToId = req.user!.id;
    } else if (assignedToId) {
      where.assignedToId = assignedToId === 'unassigned' ? null : (assignedToId as string);
    }

    if (priority) {
      where.priority = priority;
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            organization: true,
            phone: true,
            location: true,
            industry: true,
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            avatar: true,
            designation: true,
          }
        },
        _count: {
          select: {
            activities: true,
            tasks: true,
            followups: true,
          }
        }
      }
    });

    // Group by stages
    const columns = PIPELINE_STAGES.map((stage) => {
      const stageLeads = leads.filter(l => l.status === stage);
      const stageValue = stageLeads.reduce((sum, l) => sum + (l.expectedValue || 0), 0);

      return {
        stage,
        label: stage.replace(/_/g, ' '),
        count: stageLeads.length,
        totalValue: stageValue,
        leads: stageLeads,
      };
    });

    const totalPipelineValue = leads
      .filter(l => l.status !== LeadStatus.LOST)
      .reduce((sum, l) => sum + (l.expectedValue || 0), 0);

    res.json({
      success: true,
      data: {
        totalLeads: leads.length,
        totalPipelineValue,
        columns,
      }
    });
  } catch (err: any) {
    console.error('Pipeline error:', err);
    res.status(500).json({ success: false, message: 'Failed to load sales pipeline.' });
  }
});

// Move lead stage in pipeline
router.patch('/:id/stage', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newStatus, remarks, reason } = req.body;

    if (!newStatus || !PIPELINE_STAGES.includes(newStatus as LeadStatus)) {
      res.status(400).json({ success: false, message: 'Invalid pipeline stage provided.' });
      return;
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { client: true }
    });

    if (!lead || lead.isDeleted) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    // Role check: Employee can only move their own leads
    if (req.user!.role === Role.EMPLOYEE && lead.assignedToId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'Unauthorized. You can only move leads assigned to you.' });
      return;
    }

    // Reason mandatory for Lost and On Hold
    if (newStatus === LeadStatus.LOST && !reason && !remarks) {
      res.status(400).json({ success: false, message: 'A reason is required when marking a lead as Lost.' });
      return;
    }
    if (newStatus === LeadStatus.ON_HOLD && !reason && !remarks) {
      res.status(400).json({ success: false, message: 'A reason is required when moving a lead to On Hold.' });
      return;
    }

    const previousStatus = lead.status;
    const isContactedNow = lead.hasContacted || (newStatus !== LeadStatus.NEW && newStatus !== LeadStatus.ASSIGNED);

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: newStatus as LeadStatus,
        lostReason: newStatus === LeadStatus.LOST ? (reason || remarks) : lead.lostReason,
        holdReason: newStatus === LeadStatus.ON_HOLD ? (reason || remarks) : lead.holdReason,
        hasContacted: isContactedNow,
        contactedAt: !lead.hasContacted && isContactedNow ? new Date() : lead.contactedAt,
      },
      include: {
        client: true,
        assignedTo: true,
      }
    });

    // Handle Won stage
    if (newStatus === LeadStatus.WON) {
      const dealCount = await prisma.deal.count();
      const dealId = `DEL-${1001 + dealCount}`;
      await prisma.deal.create({
        data: {
          dealId,
          leadId: lead.id,
          clientId: lead.clientId,
          title: `${lead.title} - Closed Won`,
          amount: lead.expectedValue,
          currency: 'INR',
          stage: 'Won',
          closeDate: new Date(),
          closedById: req.user!.id,
          wonReason: remarks || 'Deal won and moved to Won stage in pipeline.',
        }
      });
    }

    // Activity log
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        userId: req.user!.id,
        type: ActivityType.STATUS_CHANGE,
        title: `Pipeline: Moved to ${newStatus.replace(/_/g, ' ')}`,
        previousStatus,
        newStatus,
        remarks: remarks || reason,
      }
    });

    await logAudit({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'PIPELINE_STAGE_MOVED',
      entityType: 'LEAD',
      entityId: id,
      details: { previousStatus, newStatus, remarks: remarks || reason },
      ipAddress: req.ip,
    });

    res.json({ success: true, message: `Lead moved to ${newStatus.replace(/_/g, ' ')}.`, data: updated });
  } catch (err: any) {
    console.error('Stage move error:', err);
    res.status(500).json({ success: false, message: 'Failed to update pipeline stage.' });
  }
});

export default router;

