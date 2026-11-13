const prisma = require('../config/db');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/tasks
 * Filter by date, type, status, employeeId.
 * Employees automatically see only their assigned tasks.
 */
const getTasks = asyncHandler(async (req, res) => {
  const { date, type, status, employeeId } = req.query;

  const where = {};

  // Role visibility
  if (req.user.role === 'EMPLOYEE') {
    where.assignedToId = req.user.id;
  } else if (employeeId) {
    where.assignedToId = employeeId;
  }

  // Type filter
  if (type) {
    where.type = type;
  }

  // Status filter
  if (status) {
    where.status = status;
  }

  // Date filter (full day match)
  if (date) {
    const targetDate = new Date(date);
    if (!isNaN(targetDate.getTime())) {
      const startOfDay = new Date(targetDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      where.scheduledDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }
  }

  const tasks = await prisma.taskSchedule.findMany({
    where,
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      assignedBy: {
        select: { id: true, name: true, email: true },
      },
      lead: {
        select: {
          id: true,
          name: true,
          companyName: true,
          designation: true,
          area: true,
          contact: true,
          status: true,
        },
      },
    },
    orderBy: { scheduledDate: 'asc' },
  });

  res.status(200).json({
    success: true,
    count: tasks.length,
    tasks,
  });
});

/**
 * POST /api/tasks
 * Create task/meeting/follow-up/report
 */
const createTask = asyncHandler(async (req, res) => {
  const {
    title,
    type = 'GENERAL',
    companyName,
    personName,
    personDesignation,
    contact,
    scheduledDate,
    leadId,
    assignedToId,
    reportSummary,
  } = req.body;

  let targetAssigneeId = req.user.id;
  if (req.user.role === 'MARKETING_HEAD' && assignedToId) {
    targetAssigneeId = assignedToId;
  }

  // If leadId is provided and details are omitted, populate from lead
  let comp = companyName;
  let person = personName;
  let desig = personDesignation;
  let cont = contact;

  if (leadId) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });
    if (lead) {
      if (!comp) comp = lead.companyName;
      if (!person) person = lead.name;
      if (!desig) desig = lead.designation;
      if (!cont) cont = lead.contact;
    }
  }

  const task = await prisma.taskSchedule.create({
    data: {
      title,
      type,
      companyName: comp || null,
      personName: person || null,
      personDesignation: desig || null,
      contact: cont || null,
      scheduledDate: new Date(scheduledDate),
      leadId: leadId || null,
      assignedToId: targetAssigneeId,
      assignedById: req.user.id,
      reportSummary: reportSummary || null,
      status: 'PENDING',
    },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      assignedBy: {
        select: { id: true, name: true, email: true },
      },
      lead: true,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Task scheduled successfully.',
    task,
  });
});

/**
 * PATCH /api/tasks/:id/start
 * Start meeting/task timer
 */
const startTaskTimer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await prisma.taskSchedule.findUnique({
    where: { id },
  });

  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  if (req.user.role === 'EMPLOYEE' && task.assignedToId !== req.user.id) {
    throw new AppError('Access forbidden: You can only start timer on your assigned tasks.', 403);
  }

  const updatedTask = await prisma.taskSchedule.update({
    where: { id },
    data: {
      status: 'IN_PROGRESS',
      startTime: new Date(),
    },
  });

  res.status(200).json({
    success: true,
    message: 'Timer started.',
    task: updatedTask,
  });
});

/**
 * PATCH /api/tasks/:id/stop
 * Stop meeting/task timer, calculate duration and accumulate minutes
 */
const stopTaskTimer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reportSummary } = req.body;

  const task = await prisma.taskSchedule.findUnique({
    where: { id },
  });

  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  if (req.user.role === 'EMPLOYEE' && task.assignedToId !== req.user.id) {
    throw new AppError('Access forbidden: You can only stop timer on your assigned tasks.', 403);
  }

  const endTime = new Date();
  let addedMinutes = 0;

  if (task.startTime) {
    const elapsedMs = endTime.getTime() - new Date(task.startTime).getTime();
    addedMinutes = Math.max(1, Math.round(elapsedMs / (1000 * 60)));
  }

  const totalDurationMinutes = (task.durationMinutes || 0) + addedMinutes;

  const updateData = {
    endTime,
    durationMinutes: totalDurationMinutes,
    status: status || task.status,
  };

  if (reportSummary) {
    updateData.reportSummary = reportSummary;
  }

  const updatedTask = await prisma.taskSchedule.update({
    where: { id },
    data: updateData,
  });

  res.status(200).json({
    success: true,
    message: `Timer stopped. Logged ${addedMinutes} minutes (${totalDurationMinutes} minutes total).`,
    durationMinutes: totalDurationMinutes,
    task: updatedTask,
  });
});

/**
 * POST /api/tasks/:id/upload
 * Upload meeting proof photo and/or report file + reportSummary text.
 * Automatically marks task COMPLETED upon submission.
 */
const uploadTaskProof = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reportSummary } = req.body;

  const task = await prisma.taskSchedule.findUnique({
    where: { id },
  });

  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  if (req.user.role === 'EMPLOYEE' && task.assignedToId !== req.user.id) {
    throw new AppError('Access forbidden: You can only upload files to your assigned tasks.', 403);
  }

  const updateData = {
    status: 'COMPLETED',
  };

  if (reportSummary) {
    updateData.reportSummary = reportSummary;
  }

  if (req.files) {
    if (req.files.photo && req.files.photo[0]) {
      updateData.photoUrl = `/uploads/photos/${req.files.photo[0].filename}`;
    }
    if (req.files.report && req.files.report[0]) {
      updateData.reportUrl = `/uploads/reports/${req.files.report[0].filename}`;
    }
  }

  const updatedTask = await prisma.taskSchedule.update({
    where: { id },
    data: updateData,
  });

  res.status(200).json({
    success: true,
    message: 'Meeting proof and report submitted. Task marked as COMPLETED.',
    task: updatedTask,
  });
});

module.exports = {
  getTasks,
  createTask,
  startTaskTimer,
  stopTaskTimer,
  uploadTaskProof,
};

