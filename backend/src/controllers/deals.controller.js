const prisma = require('../config/db');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/deals
 * Filter by search, status, and employeeId.
 * Employees see only their owned deals; Marketing Head & CEO see all.
 */
const getDeals = asyncHandler(async (req, res) => {
  const { search, status, employeeId } = req.query;

  const where = {};

  if (req.user.role === 'EMPLOYEE') {
    where.ownerId = req.user.id;
  } else if (employeeId) {
    where.ownerId = employeeId;
  }

  if (status) {
    where.status = status;
  }

  if (search && search.trim() !== '') {
    const term = search.trim();
    where.lead = {
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { companyName: { contains: term, mode: 'insensitive' } },
        { contact: { contains: term, mode: 'insensitive' } },
      ],
    };
  }

  const deals = await prisma.deal.findMany({
    where,
    include: {
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
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    success: true,
    count: deals.length,
    deals,
  });
});

/**
 * PATCH /api/deals/:id
 * Update dealValue, status, nextFollowUpDate.
 * Automatically sets closedAt = now() when status is CLOSED_WON.
 */
const updateDeal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { dealValue, status, nextFollowUpDate } = req.body;

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: { lead: true },
  });

  if (!deal) {
    throw new AppError('Deal not found.', 404);
  }

  // Employee authorization: can only update their own deal
  if (req.user.role === 'EMPLOYEE' && deal.ownerId !== req.user.id) {
    throw new AppError('Access forbidden: You can only update deals assigned to you.', 403);
  }

  const updateData = {};
  if (dealValue !== undefined) updateData.dealValue = dealValue;
  if (nextFollowUpDate !== undefined) updateData.nextFollowUpDate = nextFollowUpDate;

  if (status) {
    updateData.status = status;
    if (status === 'CLOSED_WON') {
      updateData.closedAt = new Date();
      // Also update linked lead status to CONVERTED
      await prisma.lead.update({
        where: { id: deal.leadId },
        data: { status: 'CONVERTED' },
      });
    } else if (status === 'CLOSED_LOST') {
      // Mark lead as LOST if deal is closed lost
      await prisma.lead.update({
        where: { id: deal.leadId },
        data: { status: 'LOST' },
      });
    }
  }

  const updatedDeal = await prisma.deal.update({
    where: { id },
    data: updateData,
    include: {
      lead: true,
      owner: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });

  res.status(200).json({
    success: true,
    message: 'Deal updated successfully.',
    deal: updatedDeal,
  });
});

module.exports = {
  getDeals,
  updateDeal,
};

