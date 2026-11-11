import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { Role, LeadStatus, LeadPriority, ActivityType, NotificationType } from '@prisma/client';
import { logAudit } from '../utils/audit.js';

const router = Router();

const createLeadSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  title: z.string().min(3, 'Lead title is required'),
  source: z.string().min(1, 'Lead source is required'),
  priority: z.nativeEnum(LeadPriority).default(LeadPriority.MEDIUM),
  status: z.nativeEnum(LeadStatus).default(LeadStatus.NEW),
  requirement: z.string().min(5, 'Requirement is required'),
  expectedValue: z.number().nonnegative('Expected value must be a positive number').default(0),
  assignedToId: z.string().optional().nullable(),
  nextFollowUpDate: z.string().optional().nullable(),
});

const assignLeadSchema = z.object({
  assignedToId: z.string().min(1, 'Employee ID is required'),
  notes: z.string().optional(),
});

const statusUpdateSchema = z.object({
  status: z.nativeEnum(LeadStatus),
  remarks: z.string().optional(),
  lostReason: z.string().optional(),
  holdReason: z.string().optional(),
});

const recordActivitySchema = z.object({
  type: z.nativeEnum(ActivityType),
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  durationMinutes: z.number().int().positive().optional().nullable(),
  outcome: z.string().optional().nullable(),
});

// List leads with filters, search, and role isolation
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      search = '',
      status = '',
      priority = '',
      source = '',
      assignedToId = '',
      clientId = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '15',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 15));
    const skip = (pageNum - 1) * take;

    const where: any = {
      isDeleted: false,
    };

    // Strict role isolation: Employees only see their own assigned leads
    if (req.user!.role === Role.EMPLOYEE) {
      where.assignedToId = req.user!.id;
    } else if (assignedToId) {
      if (assignedToId === 'unassigned') {
        where.assignedToId = null;
      } else {
        where.assignedToId = assignedToId as string;
      }
    }

    if (clientId) where.clientId = clientId as string;
    if (status) where.status = status as LeadStatus;
    if (priority) where.priority = priority as LeadPriority;
    if (source) where.source = source as string;

    if (search) {
      const s = (search as string).trim();
      where.OR = [
        { title: { contains: s, mode: 'insensitive' } },
        { leadId: { contains: s, mode: 'insensitive' } },
        { requirement: { contains: s, mode: 'insensitive' } },
        { client: { name: { contains: s, mode: 'insensitive' } } },
        { client: { organization: { contains: s, mode: 'insensitive' } } },
      ];
    }

    const [total, leads] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy as string]: (sortOrder as string).toLowerCase() === 'asc' ? 'asc' : 'desc' },
        include: {
          client: {
            select: {
              id: true,
              clientId: true,
              name: true,
              organization: true,
              phone: true,
              email: true,
              location: true,
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
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true,
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
      })
    ]);

    res.json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (err: any) {
    console.error('Fetch leads error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve leads.' });
  }
});

// Get lead details
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lead = await prisma.lead.findFirst({
      where: { id, isDeleted: false },
      include: {
        client: true,
        assignedTo: { select: { id: true, name: true, email: true, avatar: true, phone: true, designation: true } },
        createdBy: { select: { id: true, name: true, role: true } },
        assignments: {
          orderBy: { createdAt: 'desc' },
          include: {
            assignedTo: { select: { name: true, avatar: true } },
            assignedBy: { select: { name: true, role: true } }
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true, avatar: true, role: true } } }
        },
        tasks: {
          where: { isDeleted: false },
          orderBy: { dueDate: 'asc' },
          include: { assignedTo: { select: { name: true, avatar: true } } }
        },
        followups: {
          where: { isDeleted: false },
          orderBy: { scheduledDate: 'desc' },
          include: { user: { select: { name: true } } }
        },
        deals: {
          include: { closedBy: { select: { name: true } } }
        }
      }
    });

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    // Role check: Employee can only see their own assigned lead
    if (req.user!.role === Role.EMPLOYEE && lead.assignedToId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'Unauthorized. You can only view leads assigned to you.' });
      return;
    }

    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch lead details.' });
  }
});

// Create lead
router.post('/', authenticateToken, authorizeRoles(Role.ADMIN, Role.CEO, Role.MANAGER), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = createLeadSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
      return;
    }

    const data = parseResult.data;
    const count = await prisma.lead.count();
    const leadId = `LEAD-${1001 + count}`;

    const initialStatus = data.assignedToId ? LeadStatus.ASSIGNED : (data.status || LeadStatus.NEW);

    const lead = await prisma.lead.create({
      data: {
        leadId,
        clientId: data.clientId,
        title: data.title.trim(),
        source: data.source,
        priority: data.priority,
        status: initialStatus,
        requirement: data.requirement.trim(),
        expectedValue: data.expectedValue,
        assignedToId: data.assignedToId || null,
        createdById: req.user!.id,
        nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : null,
      },
      include: {
        client: true,
        assignedTo: true,
      }
    });

    // Record initial assignment if assigned
    if (data.assignedToId) {
      await prisma.leadAssignment.create({
        data: {
          leadId: lead.id,
          assignedToId: data.assignedToId,
          assignedById: req.user!.id,
          notes: 'Assigned upon lead creation.',
        }
      });

      // Notification to employee
      await prisma.notification.create({
        data: {
          userId: data.assignedToId,
          title: `New Lead Assigned: ${lead.leadId}`,
          message: `You have been assigned to ${lead.title} (${lead.client.organization}).`,
          type: NotificationType.LEAD_ASSIGNED,
          link: `/leads/${lead.id}`
        }
      });
    }

    // Activity log
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        userId: req.user!.id,
        type: ActivityType.NOTE,
        title: 'Lead Created',
        description: `Lead created by ${req.user!.name} (${req.user!.role}) for ${lead.client.name}.`,
      }
    });

    await logAudit({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'LEAD_CREATED',
      entityType: 'LEAD',
      entityId: lead.id,
      details: { leadId: lead.leadId, title: lead.title, assignedToId: lead.assignedToId },
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, message: 'Lead created successfully.', data: lead });
  } catch (err: any) {
    console.error('Create lead error:', err);
    res.status(500).json({ success: false, message: 'Failed to create lead.' });
  }
});

// Assign or Reassign Lead
router.post('/:id/assign', authenticateToken, authorizeRoles(Role.ADMIN, Role.CEO, Role.MANAGER), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parseResult = assignLeadSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
      return;
    }

    const { assignedToId, notes } = parseResult.data;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { client: true, assignedTo: true }
    });

    if (!lead || lead.isDeleted) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    const assignee = await prisma.user.findUnique({ where: { id: assignedToId } });
    if (!assignee) {
      res.status(404).json({ success: false, message: 'Target employee not found.' });
      return;
    }

    const previousAssigneeName = lead.assignedTo?.name || 'Unassigned';

    // Update lead
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        assignedToId,
        status: lead.status === LeadStatus.NEW ? LeadStatus.ASSIGNED : lead.status,
      },
      include: { client: true, assignedTo: true }
    });

    // Record assignment history
    await prisma.leadAssignment.create({
      data: {
        leadId: id,
        assignedToId,
        assignedById: req.user!.id,
        notes: notes || `Lead assigned from ${previousAssigneeName} to ${assignee.name} by ${req.user!.name}`,
      }
    });

    // Activity log
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        userId: req.user!.id,
        type: ActivityType.NOTE,
        title: 'Lead Reassigned',
        description: `Lead assigned to ${assignee.name}. Remarks: ${notes || 'No remarks provided.'}`,
      }
    });

    // Notification to assigned employee
    await prisma.notification.create({
      data: {
        userId: assignedToId,
        title: `Lead Assigned: ${lead.leadId}`,
        message: `${req.user!.name} assigned you to ${lead.title} (${lead.client.organization}).`,
        type: NotificationType.LEAD_ASSIGNED,
        link: `/leads/${lead.id}`
      }
    });

    await logAudit({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'LEAD_ASSIGNED',
      entityType: 'LEAD',
      entityId: id,
      details: { leadId: lead.leadId, assignedTo: assignee.name, assignedBy: req.user!.name },
      ipAddress: req.ip
    });

    res.json({ success: true, message: `Lead assigned to ${assignee.name} successfully.`, data: updatedLead });
  } catch (err: any) {
    console.error('Assign lead error:', err);
    res.status(500).json({ success: false, message: 'Failed to assign lead.' });
  }
});

// Update Lead Status (e.g. Lost, Won, Negotiation, etc.)
router.post('/:id/status', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parseResult = statusUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
      return;
    }

    const { status, remarks, lostReason, holdReason } = parseResult.data;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { client: true }
    });

    if (!lead || lead.isDeleted) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    // Role check: Employee can only update status if lead is assigned to them
    if (req.user!.role === Role.EMPLOYEE && lead.assignedToId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'Unauthorized. You can only update leads assigned to you.' });
      return;
    }

    // Requirement: reason required when marked Lost or On Hold
    if (status === LeadStatus.LOST && !lostReason && !remarks) {
      res.status(400).json({ success: false, message: 'A reason is required when marking a lead as Lost.' });
      return;
    }
    if (status === LeadStatus.ON_HOLD && !holdReason && !remarks) {
      res.status(400).json({ success: false, message: 'A reason is required when placing a lead On Hold.' });
      return;
    }

    const previousStatus = lead.status;
    const isContactedNow = lead.hasContacted || status !== LeadStatus.NEW && status !== LeadStatus.ASSIGNED;

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status,
        lostReason: status === LeadStatus.LOST ? (lostReason || remarks) : lead.lostReason,
        holdReason: status === LeadStatus.ON_HOLD ? (holdReason || remarks) : lead.holdReason,
        hasContacted: isContactedNow,
        contactedAt: !lead.hasContacted && isContactedNow ? new Date() : lead.contactedAt,
      }
    });

    // If marked WON, create or update Deal record!
    if (status === LeadStatus.WON) {
      const dealCount = await prisma.deal.count();
      const dealId = `DEL-${1001 + dealCount}`;
      await prisma.deal.create({
        data: {
          dealId,
          leadId: lead.id,
          clientId: lead.clientId,
          title: `${lead.title} - Deal Closed`,
          amount: lead.expectedValue,
          currency: 'INR',
          stage: 'Won',
          closeDate: new Date(),
          closedById: req.user!.id,
          wonReason: remarks || 'Successfully converted lead into active client contract.',
        }
      });
    }

    // Log Activity
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        userId: req.user!.id,
        type: ActivityType.STATUS_CHANGE,
        title: `Status updated from ${previousStatus} to ${status}`,
        previousStatus,
        newStatus: status,
        remarks: remarks || lostReason || holdReason,
      }
    });

    await logAudit({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'LEAD_STATUS_CHANGED',
      entityType: 'LEAD',
      entityId: id,
      details: { previousStatus, newStatus: status, remarks },
      ipAddress: req.ip
    });

    res.json({ success: true, message: `Lead status updated to ${status}.`, data: updated });
  } catch (err: any) {
    console.error('Update lead status error:', err);
    res.status(500).json({ success: false, message: 'Failed to update lead status.' });
  }
});

// Record interaction activity (Call, Meeting, Discussion, Proposal, etc.)
router.post('/:id/activity', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parseResult = recordActivitySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
      return;
    }

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead || lead.isDeleted) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    // Role check
    if (req.user!.role === Role.EMPLOYEE && lead.assignedToId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'Unauthorized. You can only record activities for your assigned leads.' });
      return;
    }

    const { type, title, description, durationMinutes, outcome } = parseResult.data;

    const activity = await prisma.leadActivity.create({
      data: {
        leadId: id,
        userId: req.user!.id,
        type,
        title: title.trim(),
        description: description?.trim(),
        durationMinutes,
        outcome: outcome?.trim(),
      },
      include: { user: { select: { name: true, role: true } } }
    });

    // Automatically mark lead as contacted if not yet contacted
    if (!lead.hasContacted && (type === ActivityType.CALL || type === ActivityType.MEETING || type === ActivityType.DISCUSSION)) {
      await prisma.lead.update({
        where: { id },
        data: {
          hasContacted: true,
          contactedAt: new Date(),
          status: lead.status === LeadStatus.NEW || lead.status === LeadStatus.ASSIGNED ? LeadStatus.CONTACTED : lead.status
        }
      });
    }

    res.status(201).json({ success: true, message: 'Activity recorded successfully.', data: activity });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to record activity.' });
  }
});

// Update basic lead details
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead || lead.isDeleted) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    if (req.user!.role === Role.EMPLOYEE && lead.assignedToId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'Unauthorized to update this lead.' });
      return;
    }

    const parseResult = createLeadSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
      return;
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        ...parseResult.data,
        nextFollowUpDate: parseResult.data.nextFollowUpDate ? new Date(parseResult.data.nextFollowUpDate) : undefined
      }
    });

    res.json({ success: true, message: 'Lead updated successfully.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update lead.' });
  }
});

export default router;

