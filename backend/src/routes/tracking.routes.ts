import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { Role } from '@prisma/client';
import { logAudit } from '../utils/audit.js';

const router = Router();

const checkinSchema = z.object({
  locationName: z.string().min(2, 'Location name is required'),
  address: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  photoUrl: z.string().min(5, 'Field verification photo is required'),
  notes: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  leadId: z.string().optional().nullable(),
});

// Get checkins
router.get('/checkins', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { employeeId = '', clientId = '' } = req.query;

    const where: any = {};

    // Role check: Employees see only their own field visits
    if (req.user!.role === Role.EMPLOYEE) {
      where.userId = req.user!.id;
    } else if (employeeId) {
      where.userId = employeeId as string;
    }

    if (clientId) where.clientId = clientId as string;

    const checkins = await prisma.fieldCheckin.findMany({
      where,
      orderBy: { checkinTime: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true, designation: true } },
        client: { select: { id: true, name: true, organization: true } },
        lead: { select: { id: true, leadId: true, title: true } },
      }
    });

    res.json({ success: true, data: checkins });
  } catch (err: any) {
    console.error('Fetch checkins error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve check-ins.' });
  }
});

// Employee field photo check-in
router.post('/checkin', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = checkinSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
      return;
    }

    const data = parseResult.data;

    const checkin = await prisma.fieldCheckin.create({
      data: {
        userId: req.user!.id,
        locationName: data.locationName.trim(),
        address: data.address?.trim(),
        latitude: data.latitude,
        longitude: data.longitude,
        photoUrl: data.photoUrl,
        notes: data.notes?.trim(),
        clientId: data.clientId || null,
        leadId: data.leadId || null,
        checkinTime: new Date(),
      },
      include: {
        user: { select: { name: true, designation: true } },
        client: { select: { name: true, organization: true } }
      }
    });

    // If linked to lead, record an activity as well
    if (data.leadId) {
      await prisma.leadActivity.create({
        data: {
          leadId: data.leadId,
          userId: req.user!.id,
          type: 'FIELD_VISIT',
          title: `Field Visit Check-in: ${data.locationName}`,
          description: `Location: ${data.address || data.locationName}. Notes: ${data.notes || 'None'}`,
        }
      });
    }

    await logAudit({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'FIELD_CHECKIN_LOGGED',
      entityType: 'USER',
      entityId: req.user!.id,
      details: { locationName: data.locationName, address: data.address },
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, message: 'Field photo check-in submitted successfully.', data: checkin });
  } catch (err: any) {
    console.error('Check-in error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit check-in.' });
  }
});

export default router;

