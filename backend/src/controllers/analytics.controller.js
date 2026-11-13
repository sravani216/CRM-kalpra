const prisma = require('../config/db');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/analytics/employee/:id
 * Individual performance metrics and 7-day/30-day activity trends.
 * Employee can view their own; Marketing Head and CEO can view any employee.
 */
const getEmployeeAnalytics = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const days = parseInt(req.query.days, 10) || 7;

  // Permissions check
  if (req.user.role === 'EMPLOYEE' && req.user.id !== id) {
    throw new AppError('Access forbidden: You can only view your own performance analytics.', 403);
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      designation: true,
      avatarUrl: true,
    },
  });

  if (!targetUser) {
    throw new AppError('Employee not found.', 404);
  }

  // 1. Leads counts
  const totalLeads = await prisma.lead.count({
    where: { assignedToId: id },
  });

  const totalApproached = await prisma.lead.count({
    where: {
      assignedToId: id,
      status: { not: 'NEW' },
    },
  });

  const convertedLeads = await prisma.lead.count({
    where: {
      assignedToId: id,
      status: 'CONVERTED',
    },
  });

  const conversionRate =
    totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 1000) / 10 : 0;

  // 2. Meetings & Duration
  const meetingsCompleted = await prisma.taskSchedule.count({
    where: {
      assignedToId: id,
      type: 'CLIENT_MEETING',
      status: 'COMPLETED',
    },
  });

  const durationAggregate = await prisma.taskSchedule.aggregate({
    where: {
      assignedToId: id,
      type: 'CLIENT_MEETING',
    },
    _sum: {
      durationMinutes: true,
    },
  });
  const totalMeetingDurationMinutes = durationAggregate._sum.durationMinutes || 0;
  const totalHoursInMeetings = Math.round((totalMeetingDurationMinutes / 60) * 10) / 10;

  // 3. Reports submitted
  const reportsSubmitted = await prisma.taskSchedule.count({
    where: {
      assignedToId: id,
      type: 'REPORT',
      status: 'COMPLETED',
    },
  });

  // 4. Revenue & Deals
  const wonDealsAggregate = await prisma.deal.aggregate({
    where: {
      ownerId: id,
      status: 'CLOSED_WON',
    },
    _sum: {
      dealValue: true,
    },
    _count: {
      id: true,
    },
  });
  const totalRevenue = Number(wonDealsAggregate._sum.dealValue || 0);
  const dealsWonCount = wonDealsAggregate._count.id || 0;

  const pipelineAggregate = await prisma.deal.aggregate({
    where: {
      ownerId: id,
      status: { in: ['PROPOSAL', 'NEGOTIATION'] },
    },
    _sum: {
      dealValue: true,
    },
  });
  const pipelineValue = Number(pipelineAggregate._sum.dealValue || 0);

  // Won deals list for display
  const wonDeals = await prisma.deal.findMany({
    where: {
      ownerId: id,
      status: 'CLOSED_WON',
    },
    include: {
      lead: {
        select: {
          id: true,
          name: true,
          companyName: true,
          area: true,
        },
      },
    },
    orderBy: { closedAt: 'desc' },
  });

  // 5. Activity Trend (Last N days: 7 or 30 days)
  const activityTrend = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setUTCHours(0, 0, 0, 0);

    const nextD = new Date(d);
    nextD.setUTCHours(23, 59, 59, 999);

    const dateKey = d.toISOString().split('T')[0];

    // Count tasks on this date
    const dayTasks = await prisma.taskSchedule.findMany({
      where: {
        assignedToId: id,
        scheduledDate: {
          gte: d,
          lte: nextD,
        },
      },
      select: {
        type: true,
        status: true,
        durationMinutes: true,
      },
    });

    const dayLeadsCount = await prisma.lead.count({
      where: {
        assignedToId: id,
        createdAt: {
          gte: d,
          lte: nextD,
        },
      },
    });

    const meetingsCount = dayTasks.filter(
      (t) => t.type === 'CLIENT_MEETING' && t.status === 'COMPLETED'
    ).length;
    const reportsCount = dayTasks.filter((t) => t.type === 'REPORT').length;
    const minutesLogged = dayTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);

    activityTrend.push({
      date: dateKey,
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      meetingsCount,
      reportsCount,
      leadsAdded: dayLeadsCount,
      minutesLogged,
    });
  }

  res.status(200).json({
    success: true,
    employee: targetUser,
    stats: {
      totalLeads,
      totalApproached,
      convertedLeads,
      conversionRate,
      meetingsCompleted,
      totalMeetingDurationMinutes,
      totalHoursInMeetings,
      reportsSubmitted,
      dealsWonCount,
      totalRevenue,
      pipelineValue,
    },
    wonDeals,
    activityTrend,
  });
});

/**
 * GET /api/analytics/executive
 * Real-time executive metrics for CEO and Marketing Head.
 */
const getExecutiveAnalytics = asyncHandler(async (req, res) => {
  // 1. Total leads and conversion metrics
  const totalLeads = await prisma.lead.count();

  const totalClients = await prisma.lead.count({
    where: { status: 'CONVERTED' },
  });

  const totalApproached = await prisma.lead.count({
    where: { status: { not: 'NEW' } },
  });

  const overallConversionRate =
    totalLeads > 0 ? Math.round((totalClients / totalLeads) * 1000) / 10 : 0;

  // 2. Total Meetings
  const totalMeetings = await prisma.taskSchedule.count({
    where: {
      type: 'CLIENT_MEETING',
      status: 'COMPLETED',
    },
  });

  // 3. Revenue Metrics
  const revenueAggregate = await prisma.deal.aggregate({
    where: { status: 'CLOSED_WON' },
    _sum: { dealValue: true },
    _count: { id: true },
  });
  const totalRevenue = Number(revenueAggregate._sum.dealValue || 0);

  // Revenue target progress (Target: 3,000,000 INR)
  const MONTHLY_TARGET = 3000000;
  const targetProgressPercentage = Math.min(
    100,
    Math.round((totalRevenue / MONTHLY_TARGET) * 100)
  );

  // 4. Deals Breakdown by Status (for Donut / Circular gauges)
  const dealStatuses = ['PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];
  const dealsByStatus = await Promise.all(
    dealStatuses.map(async (st) => {
      const agg = await prisma.deal.aggregate({
        where: { status: st },
        _count: { id: true },
        _sum: { dealValue: true },
      });
      return {
        status: st,
        count: agg._count.id || 0,
        value: Number(agg._sum.dealValue || 0),
      };
    })
  );

  // 5. Leads Breakdown by Area
  const allLeads = await prisma.lead.findMany({
    select: { area: true, status: true },
  });
  const areaMap = {};
  allLeads.forEach((l) => {
    const a = l.area || 'Unknown';
    if (!areaMap[a]) {
      areaMap[a] = { area: a, totalLeads: 0, converted: 0 };
    }
    areaMap[a].totalLeads += 1;
    if (l.status === 'CONVERTED') {
      areaMap[a].converted += 1;
    }
  });
  const leadsByArea = Object.values(areaMap);

  // 6. Monthly Revenue & Leads Trend (Last 6 Months)
  const monthlyRevenueAndLeadsTrend = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const year = now.getFullYear();
    const month = now.getMonth() - i;
    const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const monthLabel = startOfMonth.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    const monthLeads = await prisma.lead.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const monthRevenueAgg = await prisma.deal.aggregate({
      where: {
        status: 'CLOSED_WON',
        closedAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: { dealValue: true },
      _count: { id: true },
    });

    monthlyRevenueAndLeadsTrend.push({
      month: monthLabel,
      leadsCount: monthLeads,
      revenue: Number(monthRevenueAgg._sum.dealValue || 0),
      dealsWon: monthRevenueAgg._count.id || 0,
    });
  }

  // 7. Employee Leaderboard
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      designation: true,
      _count: {
        select: {
          assignedLeads: true,
        },
      },
      assignedLeads: {
        where: { status: 'CONVERTED' },
        select: { id: true },
      },
      assignedTasks: {
        where: {
          type: 'CLIENT_MEETING',
          status: 'COMPLETED',
        },
        select: { id: true, durationMinutes: true },
      },
      deals: {
        where: { status: 'CLOSED_WON' },
        select: { id: true, dealValue: true },
      },
    },
  });

  const employeeLeaderboard = employees
    .map((emp) => {
      const totalLeadsCount = emp._count.assignedLeads;
      const convertedCount = emp.assignedLeads.length;
      const conversionRate =
        totalLeadsCount > 0 ? Math.round((convertedCount / totalLeadsCount) * 1000) / 10 : 0;
      const totalWonRevenue = emp.deals.reduce(
        (sum, d) => sum + Number(d.dealValue || 0),
        0
      );
      const meetingsCount = emp.assignedTasks.length;
      const totalMeetingMinutes = emp.assignedTasks.reduce(
        (sum, t) => sum + (t.durationMinutes || 0),
        0
      );

      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        avatarUrl: emp.avatarUrl,
        designation: emp.designation,
        leadsCount: totalLeadsCount,
        convertedCount,
        conversionRate,
        meetingsCount,
        totalMeetingMinutes,
        dealsWonCount: emp.deals.length,
        revenueGenerated: totalWonRevenue,
      };
    })
    .sort((a, b) => b.revenueGenerated - a.revenueGenerated || b.conversionRate - a.conversionRate);

  res.status(200).json({
    success: true,
    overview: {
      totalClients,
      totalLeads,
      totalApproached,
      totalMeetings,
      totalRevenue,
      overallConversionRate,
      monthlyTarget: MONTHLY_TARGET,
      targetProgressPercentage,
    },
    dealsByStatus,
    leadsByArea,
    monthlyRevenueAndLeadsTrend,
    employeeLeaderboard,
  });
});

module.exports = {
  getEmployeeAnalytics,
  getExecutiveAnalytics,
};

