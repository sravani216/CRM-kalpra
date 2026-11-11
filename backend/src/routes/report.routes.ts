import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { Role, LeadStatus, TaskStatus, FollowUpStatus } from '@prisma/client';

const router = Router();

// Generate dynamic reports
router.get('/generate', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { type = 'conversion', format = 'json' } = req.query;

    let reportTitle = 'Report';
    let records: any[] = [];
    let summary: any = {};

    switch (type) {
      case 'daily_work': {
        reportTitle = 'Daily Employee Work & Interaction Report';
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const activities = await prisma.leadActivity.findMany({
          where: { createdAt: { gte: startOfToday } },
          include: {
            user: { select: { name: true, role: true } },
            lead: { select: { leadId: true, title: true, client: { select: { name: true, organization: true } } } }
          },
          orderBy: { createdAt: 'desc' }
        });

        records = activities.map(a => ({
          time: a.createdAt.toLocaleTimeString(),
          employee: a.user.name,
          type: a.type,
          title: a.title,
          lead: `${a.lead.leadId} - ${a.lead.title}`,
          organization: a.lead.client.organization,
          outcome: a.outcome || a.remarks || 'Recorded',
        }));

        summary = { totalActivitiesToday: activities.length };
        break;
      }

      case 'lead_conversion': {
        reportTitle = 'Lead Pipeline & Conversion Analysis Report';
        const leads = await prisma.lead.findMany({
          where: { isDeleted: false },
          include: {
            client: { select: { name: true, organization: true, location: true } },
            assignedTo: { select: { name: true } },
            deals: true,
          },
          orderBy: { createdAt: 'desc' }
        });

        records = leads.map(l => ({
          leadId: l.leadId,
          client: l.client.name,
          organization: l.client.organization,
          source: l.source,
          priority: l.priority,
          status: l.status,
          expectedValue: l.expectedValue,
          assignedTo: l.assignedTo?.name || 'Unassigned',
          contacted: l.hasContacted ? 'Yes' : 'No',
          createdDate: l.createdAt.toLocaleDateString(),
          dealWon: l.deals.length > 0 ? 'Yes' : 'No',
        }));

        const totalValue = leads.reduce((s, l) => s + l.expectedValue, 0);
        const wonCount = leads.filter(l => l.status === LeadStatus.WON).length;
        const wonRevenue = leads.filter(l => l.status === LeadStatus.WON).reduce((s, l) => s + l.expectedValue, 0);

        summary = {
          totalLeads: leads.length,
          wonCount,
          conversionRate: leads.length > 0 ? `${((wonCount / leads.length) * 100).toFixed(1)}%` : '0%',
          totalPipelineValue: totalValue,
          wonRevenue,
        };
        break;
      }

      case 'employee_productivity': {
        reportTitle = 'Employee Workload & Performance Audit Report';
        const employees = await prisma.user.findMany({
          where: { role: Role.EMPLOYEE, isActive: true },
          include: {
            assignedLeads: { where: { isDeleted: false } },
            tasksAssignedTo: { where: { isDeleted: false } },
            followups: { where: { isDeleted: false } },
            dealsWon: true,
            fieldCheckins: true,
          }
        });

        records = employees.map(e => {
          const totalLeads = e.assignedLeads.length;
          const contacted = e.assignedLeads.filter(l => l.hasContacted).length;
          const won = e.assignedLeads.filter(l => l.status === LeadStatus.WON).length;
          const tasksDone = e.tasksAssignedTo.filter(t => t.status === TaskStatus.COMPLETED).length;
          const followupsDone = e.followups.filter(f => f.status === FollowUpStatus.COMPLETED).length;
          const rev = e.dealsWon.reduce((s, d) => s + d.amount, 0);

          return {
            employee: e.name,
            designation: e.designation,
            leadsAssigned: totalLeads,
            leadsContacted: contacted,
            dealsWon: won,
            conversionRate: totalLeads > 0 ? `${((won / totalLeads) * 100).toFixed(1)}%` : '0%',
            revenueGenerated: rev,
            tasksCompleted: tasksDone,
            tasksPending: e.tasksAssignedTo.length - tasksDone,
            followupsCompleted: followupsDone,
            fieldVisits: e.fieldCheckins.length,
          };
        });

        summary = { totalEmployeesEvaluated: employees.length };
        break;
      }

      case 'lost_leads': {
        reportTitle = 'Lost & Inactive Leads Root-Cause Report';
        const lost = await prisma.lead.findMany({
          where: { isDeleted: false, status: LeadStatus.LOST },
          include: {
            client: { select: { name: true, organization: true } },
            assignedTo: { select: { name: true } }
          }
        });

        records = lost.map(l => ({
          leadId: l.leadId,
          title: l.title,
          client: l.client.name,
          organization: l.client.organization,
          source: l.source,
          lostReason: l.lostReason || 'Not specified',
          lostValue: l.expectedValue,
          assignedTo: l.assignedTo?.name || 'Unassigned',
          date: l.updatedAt.toLocaleDateString(),
        }));

        summary = {
          totalLostLeads: lost.length,
          lostOpportunityValue: lost.reduce((s, l) => s + l.expectedValue, 0)
        };
        break;
      }

      case 'revenue': {
        reportTitle = 'Closed Won Deal & Revenue Realization Report';
        const deals = await prisma.deal.findMany({
          where: { stage: 'Won' },
          include: {
            client: { select: { name: true, organization: true, location: true } },
            lead: { select: { leadId: true, title: true, source: true } },
            closedBy: { select: { name: true } }
          },
          orderBy: { closeDate: 'desc' }
        });

        records = deals.map(d => ({
          dealId: d.dealId,
          dealTitle: d.title,
          organization: d.client.organization,
          amount: d.amount,
          currency: d.currency,
          closedBy: d.closedBy?.name || 'Management',
          source: d.lead.source,
          closeDate: d.closeDate ? d.closeDate.toLocaleDateString() : 'N/A',
          wonReason: d.wonReason || 'Closed successfully',
        }));

        summary = {
          totalDealsWon: deals.length,
          totalRevenue: deals.reduce((s, d) => s + d.amount, 0)
        };
        break;
      }

      default: {
        reportTitle = 'General CRM Activity Report';
        records = [];
      }
    }

    if (format === 'csv') {
      if (records.length === 0) {
        res.setHeader('Content-Type', 'text/csv');
        res.attachment(`${type}_report.csv`);
        res.send('No data available');
        return;
      }

      const headers = Object.keys(records[0]).join(',');
      const rows = records.map(r =>
        Object.values(r)
          .map(val => `"${String(val).replace(/"/g, '""')}"`)
          .join(',')
      ).join('\n');

      const csvContent = `${headers}\n${rows}`;
      res.setHeader('Content-Type', 'text/csv');
      res.attachment(`${type}_report_${Date.now()}.csv`);
      res.send(csvContent);
      return;
    }

    res.json({
      success: true,
      reportTitle,
      type,
      generatedAt: new Date().toISOString(),
      summary,
      records
    });
  } catch (err: any) {
    console.error('Report error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate report.' });
  }
});

export default router;

