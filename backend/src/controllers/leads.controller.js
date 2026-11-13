const prisma = require('../config/db');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/leads
 * Filter by search, area, status, and employeeId.
 * Employees automatically see only their assigned leads.
 */
const getLeads = asyncHandler(async (req, res) => {
  const { search, area, status, employeeId } = req.query;

  const where = {};

  // Role-based visibility enforcement
  if (req.user.role === 'EMPLOYEE') {
    where.assignedToId = req.user.id;
  } else if (employeeId) {
    where.assignedToId = employeeId;
  }

  // Filter by area
  if (area) {
    where.area = {
      equals: area,
      mode: 'insensitive',
    };
  }

  // Filter by status
  if (status) {
    where.status = status;
  }

  // Search by name, companyName, or contact
  if (search && search.trim() !== '') {
    const term = search.trim();
    where.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { companyName: { contains: term, mode: 'insensitive' } },
      { contact: { contains: term, mode: 'insensitive' } },
    ];
  }

  const leads = await prisma.lead.findMany({
    where,
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      deal: {
        select: {
          id: true,
          dealValue: true,
          status: true,
          nextFollowUpDate: true,
          closedAt: true,
        },
      },
      notes: {
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
      },
      _count: {
        select: {
          notes: true,
          tasks: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    success: true,
    count: leads.length,
    leads,
  });
});

/**
 * POST /api/leads
 * Create a new lead (+ New button)
 */
const createLead = asyncHandler(async (req, res) => {
  const {
    name,
    companyName,
    designation,
    area,
    contact,
    approachType,
    status = 'NEW',
    assignedToId,
  } = req.body;

  // Employees can only create leads assigned to themselves
  let targetAssigneeId = req.user.id;
  if (req.user.role === 'MARKETING_HEAD' && assignedToId) {
    targetAssigneeId = assignedToId;
  }

  const newLead = await prisma.lead.create({
    data: {
      name,
      companyName: companyName || null,
      designation: designation || null,
      area,
      contact,
      approachType,
      status,
      createdById: req.user.id,
      assignedToId: targetAssigneeId,
    },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // Auto-create Deal if lead is created directly in MEETING_SCHEDULED or CONVERTED
  if (status === 'MEETING_SCHEDULED' || status === 'CONVERTED') {
    await prisma.deal.create({
      data: {
        leadId: newLead.id,
        ownerId: targetAssigneeId,
        dealValue: 0.0,
        status: 'PROPOSAL',
      },
    });
  }

  res.status(201).json({
    success: true,
    message: 'Lead created successfully.',
    lead: newLead,
  });
});

/**
 * PATCH /api/leads/:id
 * Update lead details & status.
 * Auto-creates Deal in PROPOSAL status when status becomes MEETING_SCHEDULED or CONVERTED.
 */
const updateLead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lead = await prisma.lead.findUnique({
    where: { id },
  });

  if (!lead) {
    throw new AppError('Lead not found.', 404);
  }

  // Employee authorization check
  if (req.user.role === 'EMPLOYEE' && lead.assignedToId !== req.user.id) {
    throw new AppError('Access forbidden: You can only update leads assigned to you.', 403);
  }

  const updateData = { ...req.body };

  // Only Marketing Head can reassign a lead to another employee
  if (req.user.role === 'EMPLOYEE' && updateData.assignedToId) {
    delete updateData.assignedToId;
  }

  const updatedLead = await prisma.lead.update({
    where: { id },
    data: updateData,
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      deal: true,
    },
  });

  // Auto-create Deal record if moving to MEETING_SCHEDULED or CONVERTED and no deal exists yet
  if (
    updateData.status &&
    (updateData.status === 'MEETING_SCHEDULED' || updateData.status === 'CONVERTED')
  ) {
    const existingDeal = await prisma.deal.findUnique({
      where: { leadId: id },
    });

    if (!existingDeal) {
      const newDeal = await prisma.deal.create({
        data: {
          leadId: id,
          ownerId: updatedLead.assignedToId,
          dealValue: 0.0,
          status: 'PROPOSAL',
        },
      });
      updatedLead.deal = newDeal;
    }
  }

  res.status(200).json({
    success: true,
    message: 'Lead updated successfully.',
    lead: updatedLead,
  });
});

/**
 * POST /api/leads/:id/notes
 * Add a clickable threaded note to a specific lead
 */
const addLeadNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  const lead = await prisma.lead.findUnique({
    where: { id },
  });

  if (!lead) {
    throw new AppError('Lead not found.', 404);
  }

  // Employee authorization check
  if (req.user.role === 'EMPLOYEE' && lead.assignedToId !== req.user.id) {
    throw new AppError('Access forbidden: You can only add notes to leads assigned to you.', 403);
  }

  const note = await prisma.leadNote.create({
    data: {
      leadId: id,
      authorId: req.user.id,
      content,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Note added to lead.',
    note,
  });
});

module.exports = {
  getLeads,
  createLead,
  updateLead,
  addLeadNote,
};

