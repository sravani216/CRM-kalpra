import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { Role, TaskStatus, TaskPriority, NotificationType } from '@prisma/client';
import { logAudit } from '../utils/audit.js';

const router = Router();

const createTaskSchema = z.object({
  title: z.string().min(3, 'Task title is required'),
  description: z.string().min(5, 'Description is required'),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  assignedToId: z.string().min(1, 'Assigned employee is required'),
  clientId: z.string().optional().nullable(),
  leadId: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  dueDate: z.string().min(1, 'Due date is required'),
});

const submitTaskSchema = z.object({
  completionEvidence: z.string().min(5, 'Completion evidence or summary is required'),
  evidenceAttachment: z.string().optional().nullable(),
});

const reviewTaskSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  remarks: z.string().min(2, 'Review remarks are required'),
});

// List tasks with filters and role isolation
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      status = '',
      priority = '',
      assignedToId = '',
      clientId = '',
      search = '',
    } = req.query;

    const where: any = { isDeleted: false };

    // Role check: Employee can only see their own tasks
    if (req.user!.role === Role.EMPLOYEE) {
      where.assignedToId = req.user!.id;
    } else if (assignedToId) {
      where.assignedToId = assignedToId as string;
    }

    if (clientId) where.clientId = clientId as string;
    if (status) where.status = status as TaskStatus;
    if (priority) where.priority = priority as TaskPriority;

    if (search) {
      const s = (search as string).trim();
      where.OR = [
        { taskId: { contains: s, mode: 'insensitive' } },
        { title: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' }
      ],
      include: {
        assignedTo: { select: { id: true, name: true, avatar: true, designation: true } },
        assignedBy: { select: { id: true, name: true, role: true } },
        reviewedBy: { select: { id: true, name: true, role: true } },
        client: { select: { id: true, name: true, organization: true } },
        lead: { select: { id: true, leadId: true, title: true } },
        updates: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true, role: true } } }
        }
      }
    });

    res.json({ success: true, data: tasks });
  } catch (err: any) {
    console.error('Fetch tasks error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve tasks.' });
  }
});

// Create task
router.post('/', authenticateToken, authorizeRoles(Role.MANAGER, Role.CEO, Role.ADMIN), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = createTaskSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
      return;
    }

    const data = parseResult.data;
    const taskCount = await prisma.task.count();
    const taskId = `TSK-${1001 + taskCount}`;

    const task = await prisma.task.create({
      data: {
        taskId,
        title: data.title.trim(),
        description: data.description.trim(),
        priority: data.priority,
        status: TaskStatus.NOT_STARTED,
        assignedToId: data.assignedToId,
        assignedById: req.user!.id,
        clientId: data.clientId || null,
        leadId: data.leadId || null,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        dueDate: new Date(data.dueDate),
      },
      include: {
        assignedTo: true,
        client: true,
      }
    });

    // Create initial update history
    await prisma.taskUpdate.create({
      data: {
        taskId: task.id,
        userId: req.user!.id,
        action: 'CREATED',
        remarks: `Task assigned by ${req.user!.name} (${req.user!.role}) with deadline ${new Date(data.dueDate).toLocaleDateString()}`,
      }
    });

    // Notification to assigned employee
    await prisma.notification.create({
      data: {
        userId: data.assignedToId,
        title: `New Task Assigned: ${task.taskId}`,
        message: `${task.title} (Due: ${new Date(task.dueDate).toLocaleDateString()})`,
        type: NotificationType.TASK_ASSIGNED,
        link: '/tasks'
      }
    });

    await logAudit({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'TASK_CREATED',
      entityType: 'TASK',
      entityId: task.id,
      details: { taskId: task.taskId, title: task.title, assignedToId: task.assignedToId },
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, message: 'Task assigned successfully.', data: task });
  } catch (err: any) {
    console.error('Create task error:', err);
    res.status(500).json({ success: false, message: 'Failed to assign task.' });
  }
});

// Employee submits task completion for review
router.post('/:id/submit', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parseResult = submitTaskSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
      return;
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: { assignedBy: true }
    });

    if (!task || task.isDeleted) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    if (req.user!.role === Role.EMPLOYEE && task.assignedToId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'You can only submit tasks assigned to you.' });
      return;
    }

    const { completionEvidence, evidenceAttachment } = parseResult.data;

    const updated = await prisma.task.update({
      where: { id },
      data: {
        status: TaskStatus.PENDING_REVIEW,
        completionEvidence,
        evidenceAttachment: evidenceAttachment || task.evidenceAttachment,
      }
    });

    await prisma.taskUpdate.create({
      data: {
        taskId: id,
        userId: req.user!.id,
        action: 'SUBMITTED_FOR_REVIEW',
        remarks: completionEvidence,
        attachment: evidenceAttachment,
      }
    });

    // Notify Manager / Creator
    await prisma.notification.create({
      data: {
        userId: task.assignedById,
        title: `Task Submitted for Review: ${task.taskId}`,
        message: `${req.user!.name} submitted completion evidence for review: "${task.title}".`,
        type: NotificationType.TASK_REVIEW,
        link: '/tasks'
      }
    });

    await logAudit({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'TASK_SUBMITTED_REVIEW',
      entityType: 'TASK',
      entityId: id,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Task submitted for manager review.', data: updated });
  } catch (err: any) {
    console.error('Submit task error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit task.' });
  }
});

// Manager reviews task completion (Approve or Reject)
router.post('/:id/review', authenticateToken, authorizeRoles(Role.MANAGER, Role.CEO), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parseResult = reviewTaskSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
      return;
    }

    const { action, remarks } = parseResult.data;
    const task = await prisma.task.findUnique({
      where: { id },
      include: { assignedTo: true }
    });

    if (!task || task.isDeleted) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    const isApproved = action === 'APPROVE';
    const newStatus = isApproved ? TaskStatus.COMPLETED : TaskStatus.IN_PROGRESS;

    const updated = await prisma.task.update({
      where: { id },
      data: {
        status: newStatus,
        completedAt: isApproved ? new Date() : null,
        managerReviewRemarks: remarks,
        reviewedById: req.user!.id,
        reviewedAt: new Date(),
      }
    });

    await prisma.taskUpdate.create({
      data: {
        taskId: id,
        userId: req.user!.id,
        action: isApproved ? 'APPROVED' : 'REJECTED',
        remarks: `Manager ${req.user!.name}: ${remarks}`,
      }
    });

    // Notify employee of approval or rejection
    await prisma.notification.create({
      data: {
        userId: task.assignedToId,
        title: isApproved ? `Task Approved: ${task.taskId}` : `Task Changes Requested: ${task.taskId}`,
        message: isApproved
          ? `Manager ${req.user!.name} approved task "${task.title}". Remarks: ${remarks}`
          : `Manager ${req.user!.name} requested rework on "${task.title}". Remarks: ${remarks}`,
        type: isApproved ? NotificationType.TASK_APPROVED : NotificationType.TASK_REJECTED,
        link: '/tasks'
      }
    });

    await logAudit({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: isApproved ? 'TASK_APPROVED' : 'TASK_REJECTED',
      entityType: 'TASK',
      entityId: id,
      details: { action, remarks },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: isApproved ? 'Task approved and marked as completed.' : 'Task rejected and returned to In Progress.',
      data: updated
    });
  } catch (err: any) {
    console.error('Review task error:', err);
    res.status(500).json({ success: false, message: 'Failed to review task.' });
  }
});

// Update status (e.g. In Progress, Blocked)
router.patch('/:id/status', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task || task.isDeleted) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    if (req.user!.role === Role.EMPLOYEE && task.assignedToId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { status }
    });

    await prisma.taskUpdate.create({
      data: {
        taskId: id,
        userId: req.user!.id,
        action: 'STATUS_UPDATED',
        remarks: remarks || `Status changed to ${status}`,
      }
    });

    res.json({ success: true, message: `Task status updated to ${status}.`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update task status.' });
  }
});

export default router;

