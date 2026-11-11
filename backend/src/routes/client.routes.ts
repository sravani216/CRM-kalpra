import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { Role } from '@prisma/client';
import { logAudit } from '../utils/audit.js';

const router = Router();

const clientSchema = z.object({
  name: z.string().min(2, 'Client name must be at least 2 characters'),
  organization: z.string().min(2, 'Organization name is required'),
  contactPerson: z.string().min(2, 'Contact person name is required'),
  phone: z.string().min(8, 'Valid phone number is required'),
  email: z.string().email('Valid email address is required'),
  location: z.string().min(2, 'Location is required'),
  industry: z.string().min(2, 'Industry is required'),
  requirement: z.string().min(5, 'Requirement description is required'),
  source: z.string().default('Direct'),
  notes: z.string().optional().nullable(),
  status: z.string().default('Active'),
});

// Check duplicate client
router.post('/check-duplicate', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { phone, email, organization, clientIdToExclude } = req.body;
    const orConditions: any[] = [];
    if (phone && phone.trim()) {
      orConditions.push({ phone: { contains: phone.trim() } });
    }
    if (email && email.trim()) {
      orConditions.push({ email: { equals: email.trim().toLowerCase() } });
    }
    if (organization && organization.trim()) {
      orConditions.push({ organization: { contains: organization.trim(), mode: 'insensitive' } });
    }

    if (orConditions.length === 0) {
      res.json({ success: true, hasDuplicate: false, duplicates: [] });
      return;
    }

    const duplicates = await prisma.client.findMany({
      where: {
        isDeleted: false,
        id: clientIdToExclude ? { not: clientIdToExclude } : undefined,
        OR: orConditions,
      },
      select: {
        id: true,
        clientId: true,
        name: true,
        organization: true,
        phone: true,
        email: true,
      }
    });

    res.json({
      success: true,
      hasDuplicate: duplicates.length > 0,
      duplicates
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Duplicate check failed.' });
  }
});

// List clients with search, filters, pagination
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      search = '',
      industry = '',
      source = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '10'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * take;

    const where: any = {
      isDeleted: false,
    };

    if (search) {
      const s = (search as string).trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { organization: { contains: s, mode: 'insensitive' } },
        { contactPerson: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { phone: { contains: s } },
        { clientId: { contains: s, mode: 'insensitive' } },
        { location: { contains: s, mode: 'insensitive' } },
      ];
    }

    if (industry) where.industry = industry as string;
    if (source) where.source = source as string;
    if (status) where.status = status as string;

    const [total, clients] = await Promise.all([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy as string]: (sortOrder as string).toLowerCase() === 'asc' ? 'asc' : 'desc' },
        include: {
          createdBy: { select: { id: true, name: true, role: true } },
          leads: {
            where: { isDeleted: false },
            select: { id: true, leadId: true, title: true, status: true, expectedValue: true, assignedTo: { select: { name: true } } }
          },
          _count: {
            select: {
              leads: true,
              tasks: true,
              followups: true,
              deals: true
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: clients,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (err: any) {
    console.error('Fetch clients error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve clients.' });
  }
});

// Get client detailed profile
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findFirst({
      where: { id, isDeleted: false },
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        leads: {
          where: { isDeleted: false },
          include: {
            assignedTo: { select: { id: true, name: true, avatar: true, designation: true } },
            activities: {
              take: 5,
              orderBy: { createdAt: 'desc' },
              include: { user: { select: { name: true } } }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        tasks: {
          where: { isDeleted: false },
          include: { assignedTo: { select: { name: true, avatar: true } } },
          orderBy: { dueDate: 'asc' }
        },
        followups: {
          where: { isDeleted: false },
          include: { user: { select: { name: true } } },
          orderBy: { scheduledDate: 'desc' }
        },
        deals: {
          include: { closedBy: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        },
        fieldCheckins: {
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { checkinTime: 'desc' }
        }
      }
    });

    if (!client) {
      res.status(404).json({ success: false, message: 'Client not found.' });
      return;
    }

    res.json({ success: true, data: client });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch client details.' });
  }
});

// Create new client
router.post('/', authenticateToken, authorizeRoles(Role.ADMIN, Role.CEO, Role.MANAGER), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = clientSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
      return;
    }

    const data = parseResult.data;

    // Check duplicate
    const existing = await prisma.client.findFirst({
      where: {
        isDeleted: false,
        OR: [
          { email: data.email.toLowerCase().trim() },
          { phone: data.phone.trim() }
        ]
      }
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: `Client already exists with phone ${existing.phone} or email ${existing.email} (Org: ${existing.organization}).`,
        existingClient: { id: existing.id, clientId: existing.clientId, name: existing.name }
      });
      return;
    }

    // Generate unique Client ID like CLT-1007
    const count = await prisma.client.count();
    const clientId = `CLT-${1001 + count}`;

    const newClient = await prisma.client.create({
      data: {
        clientId,
        name: data.name.trim(),
        organization: data.organization.trim(),
        contactPerson: data.contactPerson.trim(),
        phone: data.phone.trim(),
        email: data.email.toLowerCase().trim(),
        location: data.location.trim(),
        industry: data.industry.trim(),
        requirement: data.requirement.trim(),
        source: data.source,
        notes: data.notes,
        status: data.status,
        createdById: req.user!.id,
      }
    });

    await logAudit({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'CLIENT_CREATED',
      entityType: 'CLIENT',
      entityId: newClient.id,
      details: { clientId: newClient.clientId, organization: newClient.organization },
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, message: 'Client registered successfully.', data: newClient });
  } catch (err: any) {
    console.error('Create client error:', err);
    res.status(500).json({ success: false, message: 'Failed to create client.' });
  }
});

// Update client
router.put('/:id', authenticateToken, authorizeRoles(Role.ADMIN, Role.CEO, Role.MANAGER), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client || client.isDeleted) {
      res.status(404).json({ success: false, message: 'Client not found.' });
      return;
    }

    const parseResult = clientSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
      return;
    }

    const updated = await prisma.client.update({
      where: { id },
      data: parseResult.data
    });

    await logAudit({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'CLIENT_UPDATED',
      entityType: 'CLIENT',
      entityId: id,
      details: parseResult.data,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Client updated successfully.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update client.' });
  }
});

// Delete client (soft delete)
router.delete('/:id', authenticateToken, authorizeRoles(Role.ADMIN, Role.CEO, Role.MANAGER), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.client.update({
      where: { id },
      data: { isDeleted: true }
    });

    await logAudit({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'CLIENT_DELETED',
      entityType: 'CLIENT',
      entityId: id,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Client deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete client.' });
  }
});

export default router;
