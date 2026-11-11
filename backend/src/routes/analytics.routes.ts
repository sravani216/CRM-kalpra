import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { Role, LeadStatus, TaskStatus, FollowUpStatus, ActivityType } from '@prisma/client';

const router = Router();

router.get('/performance', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { range = '30d', employeeId = '' } = req.query;

    const days = range === '7d' ? 7 : range === '90d' ? 90 : range === 'all' ? 365 : 30;
    const sinceDate = new Date(Date.now() - days * 86400000);

    const userWhere: any = {
      role: Role.EMPLOYEE,
      isActive: true,
    };

    if (req.user!.role === Role.EMPLOYEE) {
      userWhere.id = req.user!.id;
    } else if (employeeId) {
      userWhere.id = employeeId as string;
    }

    const employees = await prisma.user.findMany({
      where: userWhere,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        designation: true,
        assignedLeads: {
          where: { isDeleted: false },
          select: {
            id: true,
            status: true,
            hasContacted: true,
            expectedValue: true,
            createdAt: true,
          }
        },
        activities: {
          where: { createdAt: { gte: sinceDate } },
          select: { id: true, type: true, createdAt: true }
        },
        tasksAssignedTo: {
          where: { isDeleted: false },
          select: { id: true, status: true, dueDate: true, completedAt: true }
        },
        followups: {
          where: { isDeleted: false },
          select: { id: true, status: true, scheduledDate: true }
        },
        dealsWon: {
          select: { id: true, amount: true, closeDate: true }
        },
        fieldCheckins: {
          where: { checkinTime: { gte: sinceDate } },
          select: { id: true, locationName: true, checkinTime: true }
        }
      }
    });

    const metrics = employees.map(emp => {
      const totalLeads = emp.assignedLeads.length;
      const contacted = emp.assignedLeads.filter(l => l.hasContacted).length;
      const won = emp.assignedLeads.filter(l => l.status === LeadStatus.WON).length;
      const conversionRate = totalLeads > 0 ? ((won / totalLeads) * 100).toFixed(1) : '0';

      const meetings = emp.activities.filter(a => a.type === ActivityType.MEETING || a.type === ActivityType.DEMO).length;
      const calls = emp.activities.filter(a => a.type === ActivityType.CALL).length;
      const proposals = emp.activities.filter(a => a.type === ActivityType.PROPOSAL).length;

      const completedTasks = emp.tasksAssignedTo.filter(t => t.status === TaskStatus.COMPLETED).length;
      const pendingTasks = emp.tasksAssignedTo.filter(t => t.status !== TaskStatus.COMPLETED).length;

      const completedFollowups = emp.followups.filter(f => f.status === FollowUpStatus.COMPLETED).length;
      const missedFollowups = emp.followups.filter(f => f.status === FollowUpStatus.MISSED || (f.status === FollowUpStatus.SCHEDULED && f.scheduledDate < new Date())).length;

      const revenue = emp.dealsWon.reduce((sum, d) => sum + d.amount, 0);

      return {
        id: emp.id,
        name: emp.name,
        avatar: emp.avatar,
        designation: emp.designation,
        kpis: {
          totalAssignedLeads: totalLeads,
          leadsContacted: contacted,
          contactRate: totalLeads > 0 ? `${((contacted / totalLeads) * 100).toFixed(1)}%` : '0%',
          conversionRate: `${conversionRate}%`,
          dealsWon: won,
          revenueGenerated: revenue,
          tasksCompleted: completedTasks,
          tasksPending: pendingTasks,
          followupsCompleted: completedFollowups,
          followupsMissed: missedFollowups,
          meetingsConducted: meetings,
          callsLogged: calls,
          proposalsSent: proposals,
          fieldVisits: emp.fieldCheckins.length,
        }
      };
    });

    // Comparison data for bar charts
    const comparisonChart = metrics.map(m => ({
      name: m.name,
      leads: m.kpis.totalAssignedLeads,
      contacted: m.kpis.leadsContacted,
      tasksDone: m.kpis.tasksCompleted,
      dealsWon: m.kpis.dealsWon,
      revenueLakhs: (m.kpis.revenueGenerated / 100000).toFixed(2),
    }));

    res.json({
      success: true,
      data: {
        timeRange: range,
        employees: metrics,
        comparisonChart
      }
    });
  } catch (err: any) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve analytics.' });
  }
});

export default router;

