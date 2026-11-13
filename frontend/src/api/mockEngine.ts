import {
  INITIAL_MOCK_USERS,
  INITIAL_MOCK_LEADS,
  INITIAL_MOCK_TASKS,
  INITIAL_MOCK_DEALS,
  INITIAL_MOCK_NOTES,
} from './mockData';
import { User, Lead, TaskSchedule, Deal, PersonalNote } from '../types';

const PREFIX = 'kalpra_crm_gh_';

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(val));
  } catch (e) {}
}

class MockEngine {
  private users: User[] = getStored('users', INITIAL_MOCK_USERS);
  private leads: Lead[] = getStored('leads', INITIAL_MOCK_LEADS);
  private tasks: TaskSchedule[] = getStored('tasks', INITIAL_MOCK_TASKS);
  private deals: Deal[] = getStored('deals', INITIAL_MOCK_DEALS);
  private notes: PersonalNote[] = getStored('notes', INITIAL_MOCK_NOTES);

  private getCurrentUser(): User {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return this.users[2]; // Default to Shivani (Employee)
  }

  async handleRequest<T = any>(
    endpoint: string,
    method: string,
    body?: any,
    params?: Record<string, any>
  ): Promise<T> {
    const currentUser = this.getCurrentUser();
    const cleanUrl = endpoint.split('?')[0];

    // 1. Auth: /auth/login
    if (cleanUrl === '/auth/login' && method === 'POST') {
      const email = body?.email?.toLowerCase().trim();
      const user = this.users.find((u) => u.email.toLowerCase() === email) || this.users[2];
      const token = `mock-jwt-token-for-${user.id}`;
      return {
        success: true,
        token,
        user,
      } as any;
    }

    // 2. Auth: /auth/me
    if (cleanUrl === '/auth/me') {
      return {
        success: true,
        user: currentUser,
      } as any;
    }

    // 3. User: /users/profile
    if (cleanUrl === '/users/profile' && method === 'PATCH') {
      const updatedUser = { ...currentUser, ...body };
      if (body?.preferences) {
        updatedUser.preferences = { ...currentUser.preferences, ...body.preferences };
      }
      this.users = this.users.map((u) => (u.id === currentUser.id ? updatedUser : u));
      setStored('users', this.users);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser } as any;
    }

    // 4. User: /users/password
    if (cleanUrl === '/users/password' && method === 'PATCH') {
      return { success: true, message: 'Password updated successfully' } as any;
    }

    // 5. User: /users/team
    if (cleanUrl === '/users/team') {
      if (method === 'GET') {
        const team = this.users
          .filter((u) => u.role === 'EMPLOYEE')
          .map((emp) => {
            const empLeads = this.leads.filter((l) => l.assignedToId === emp.id);
            const empTasks = this.tasks.filter((t) => t.assignedToId === emp.id);
            const empWonDeals = this.deals.filter((d) => d.ownerId === emp.id && d.status === 'CLOSED_WON');
            const totalWonRevenue = empWonDeals.reduce((sum, d) => sum + Number(d.dealValue || 0), 0);
            return {
              ...emp,
              stats: {
                leadsCount: empLeads.length,
                tasksCount: empTasks.length,
                followUpsCount: empTasks.filter((t) => t.type === 'FOLLOW_UP').length,
                dealsClosedCount: empWonDeals.length,
                totalWonRevenue,
              },
            };
          });
        return { success: true, team } as any;
      }
      if (method === 'POST') {
        const newEmp: User = {
          id: `emp-${Date.now()}`,
          name: body.name,
          email: body.email,
          role: 'EMPLOYEE',
          designation: body.designation || 'Marketing Associate',
          phone: body.phone,
          bio: body.bio,
          isActive: true,
        };
        this.users.push(newEmp);
        setStored('users', this.users);
        return { success: true, user: newEmp } as any;
      }
    }

    // 6. Leads: /leads
    if (cleanUrl === '/leads') {
      if (method === 'GET') {
        let result = [...this.leads];
        if (currentUser.role === 'EMPLOYEE') {
          result = result.filter((l) => l.assignedToId === currentUser.id);
        } else if (params?.employeeId) {
          result = result.filter((l) => l.assignedToId === params.employeeId);
        }
        if (params?.area) {
          result = result.filter((l) => l.area.toLowerCase() === params.area.toLowerCase());
        }
        if (params?.search) {
          const s = params.search.toLowerCase();
          result = result.filter(
            (l) =>
              l.name.toLowerCase().includes(s) ||
              (l.companyName && l.companyName.toLowerCase().includes(s)) ||
              l.contact.toLowerCase().includes(s)
          );
        }
        return { success: true, leads: result } as any;
      }
      if (method === 'POST') {
        const newLead: Lead = {
          id: `lead-${Date.now()}`,
          name: body.name,
          companyName: body.companyName || null,
          designation: body.designation || null,
          area: body.area,
          contact: body.contact,
          approachType: body.approachType || 'Call',
          status: body.status || 'NEW',
          createdById: currentUser.id,
          assignedToId: currentUser.role === 'EMPLOYEE' ? currentUser.id : body.assignedToId || currentUser.id,
          createdAt: new Date().toISOString(),
          notes: [],
        };
        this.leads.unshift(newLead);
        setStored('leads', this.leads);
        return { success: true, lead: newLead } as any;
      }
    }

    // Lead notes: /leads/:id/notes
    if (cleanUrl.match(/\/leads\/[^\/]+\/notes/) && method === 'POST') {
      const leadId = cleanUrl.split('/')[2];
      const newNote = {
        id: `note-${Date.now()}`,
        leadId,
        authorId: currentUser.id,
        content: body.content,
        createdAt: new Date().toISOString(),
        author: {
          id: currentUser.id,
          name: currentUser.name,
          avatarUrl: currentUser.avatarUrl,
          role: currentUser.role,
        },
      };
      this.leads = this.leads.map((l) =>
        l.id === leadId ? { ...l, notes: [newNote, ...(l.notes || [])] } : l
      );
      setStored('leads', this.leads);
      return { success: true, note: newNote } as any;
    }

    // Update lead: /leads/:id
    if (cleanUrl.startsWith('/leads/') && method === 'PATCH') {
      const leadId = cleanUrl.split('/')[2];
      this.leads = this.leads.map((l) => {
        if (l.id === leadId) {
          const updated = { ...l, ...body };
          // Auto create deal if MEETING_SCHEDULED or CONVERTED
          if (
            (body.status === 'MEETING_SCHEDULED' || body.status === 'CONVERTED') &&
            !this.deals.some((d) => d.leadId === leadId)
          ) {
            const newDeal: Deal = {
              id: `deal-${Date.now()}`,
              leadId,
              ownerId: updated.assignedToId,
              dealValue: 500000,
              status: 'PROPOSAL',
              lead: updated,
            };
            this.deals.push(newDeal);
            setStored('deals', this.deals);
          }
          return updated;
        }
        return l;
      });
      setStored('leads', this.leads);
      const lead = this.leads.find((l) => l.id === leadId);
      return { success: true, lead } as any;
    }

    // 7. Tasks: /tasks
    if (cleanUrl === '/tasks') {
      if (method === 'GET') {
        let result = [...this.tasks];
        if (currentUser.role === 'EMPLOYEE') {
          result = result.filter((t) => t.assignedToId === currentUser.id);
        } else if (params?.employeeId) {
          result = result.filter((t) => t.assignedToId === params.employeeId);
        }
        return { success: true, tasks: result } as any;
      }
      if (method === 'POST') {
        const newTask: TaskSchedule = {
          id: `task-${Date.now()}`,
          title: body.title,
          type: body.type || 'GENERAL',
          companyName: body.companyName || null,
          personName: body.personName || null,
          personDesignation: body.personDesignation || null,
          contact: body.contact || null,
          scheduledDate: body.scheduledDate,
          durationMinutes: 0,
          status: 'PENDING',
          assignedToId: body.assignedToId || currentUser.id,
          assignedById: currentUser.id,
          leadId: body.leadId || null,
          createdAt: new Date().toISOString(),
        };
        this.tasks.unshift(newTask);
        setStored('tasks', this.tasks);
        return { success: true, task: newTask } as any;
      }
    }

    // Start timer: /tasks/:id/start
    if (cleanUrl.match(/\/tasks\/[^\/]+\/start/) && method === 'PATCH') {
      const taskId = cleanUrl.split('/')[2];
      this.tasks = this.tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'IN_PROGRESS', startTime: new Date().toISOString() } : t
      );
      setStored('tasks', this.tasks);
      const task = this.tasks.find((t) => t.id === taskId);
      return { success: true, task } as any;
    }

    // Stop timer: /tasks/:id/stop
    if (cleanUrl.match(/\/tasks\/[^\/]+\/stop/) && method === 'PATCH') {
      const taskId = cleanUrl.split('/')[2];
      this.tasks = this.tasks.map((t) => {
        if (t.id === taskId) {
          const addedMinutes = t.startTime
            ? Math.max(1, Math.round((Date.now() - new Date(t.startTime).getTime()) / 60000))
            : 30;
          return {
            ...t,
            endTime: new Date().toISOString(),
            durationMinutes: (t.durationMinutes || 0) + addedMinutes,
          };
        }
        return t;
      });
      setStored('tasks', this.tasks);
      const task = this.tasks.find((t) => t.id === taskId);
      return { success: true, task } as any;
    }

    // Upload proof: /tasks/:id/upload
    if (cleanUrl.match(/\/tasks\/[^\/]+\/upload/) && method === 'POST') {
      const taskId = cleanUrl.split('/')[2];
      this.tasks = this.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'COMPLETED',
              photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
              reportSummary: body?.reportSummary || 'Proof verified and meeting concluded.',
            }
          : t
      );
      setStored('tasks', this.tasks);
      const task = this.tasks.find((t) => t.id === taskId);
      return { success: true, task } as any;
    }

    // 8. Deals: /deals
    if (cleanUrl === '/deals') {
      if (method === 'GET') {
        let result = [...this.deals];
        if (currentUser.role === 'EMPLOYEE') {
          result = result.filter((d) => d.ownerId === currentUser.id);
        }
        if (params?.status) {
          result = result.filter((d) => d.status === params.status);
        }
        if (params?.search) {
          const s = params.search.toLowerCase();
          result = result.filter(
            (d) =>
              (d.lead?.name && d.lead.name.toLowerCase().includes(s)) ||
              (d.lead?.companyName && d.lead.companyName.toLowerCase().includes(s))
          );
        }
        return { success: true, deals: result } as any;
      }
    }

    if (cleanUrl.startsWith('/deals/') && method === 'PATCH') {
      const dealId = cleanUrl.split('/')[2];
      this.deals = this.deals.map((d) => {
        if (d.id === dealId) {
          const updated = { ...d, ...body };
          if (body.status === 'CLOSED_WON') {
            updated.closedAt = new Date().toISOString();
          }
          return updated;
        }
        return d;
      });
      setStored('deals', this.deals);
      const deal = this.deals.find((d) => d.id === dealId);
      return { success: true, deal } as any;
    }

    // 9. Notes: /notes
    if (cleanUrl === '/notes') {
      if (method === 'GET') {
        const userNotes = this.notes.filter((n) => n.userId === currentUser.id);
        return { success: true, notes: userNotes } as any;
      }
      if (method === 'POST') {
        const newNote: PersonalNote = {
          id: `pnote-${Date.now()}`,
          userId: currentUser.id,
          title: body.title || null,
          content: body.content,
          pinned: body.pinned || false,
          color: body.color || 'yellow',
          createdAt: new Date().toISOString(),
        };
        this.notes.unshift(newNote);
        setStored('notes', this.notes);
        return { success: true, note: newNote } as any;
      }
    }

    if (cleanUrl.startsWith('/notes/') && method === 'PATCH') {
      const noteId = cleanUrl.split('/')[2];
      this.notes = this.notes.map((n) => (n.id === noteId ? { ...n, ...body } : n));
      setStored('notes', this.notes);
      const note = this.notes.find((n) => n.id === noteId);
      return { success: true, note } as any;
    }

    if (cleanUrl.startsWith('/notes/') && method === 'DELETE') {
      const noteId = cleanUrl.split('/')[2];
      this.notes = this.notes.filter((n) => n.id !== noteId);
      setStored('notes', this.notes);
      return { success: true } as any;
    }

    // 10. Analytics: /analytics/employee/:id
    if (cleanUrl.startsWith('/analytics/employee/')) {
      const empId = cleanUrl.split('/')[3] || currentUser.id;
      const empLeads = this.leads.filter((l) => l.assignedToId === empId);
      const converted = empLeads.filter((l) => l.status === 'CONVERTED');
      const empTasks = this.tasks.filter((t) => t.assignedToId === empId);
      const completedMeetings = empTasks.filter((t) => t.type === 'CLIENT_MEETING' && t.status === 'COMPLETED');
      const totalMinutes = empTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
      const empDeals = this.deals.filter((d) => d.ownerId === empId && d.status === 'CLOSED_WON');
      const totalRevenue = empDeals.reduce((sum, d) => sum + Number(d.dealValue || 0), 0);
      const pipelineValue = this.deals
        .filter((d) => d.ownerId === empId && (d.status === 'PROPOSAL' || d.status === 'NEGOTIATION'))
        .reduce((sum, d) => sum + Number(d.dealValue || 0), 0);

      const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const activityTrend = daysOfWeek.map((day, i) => ({
        date: `2026-11-${10 + i}`,
        day,
        meetingsCount: [1, 2, 0, 3, 2, 1, 0][i] || 1,
        reportsCount: 1,
        leadsAdded: [2, 1, 3, 0, 2, 1, 0][i] || 1,
        minutesLogged: [45, 60, 0, 90, 75, 30, 0][i] || 45,
      }));

      return {
        success: true,
        stats: {
          totalLeads: empLeads.length,
          totalApproached: empLeads.filter((l) => l.status !== 'NEW').length,
          convertedLeads: converted.length,
          conversionRate: empLeads.length > 0 ? Math.round((converted.length / empLeads.length) * 1000) / 10 : 66.7,
          meetingsCompleted: completedMeetings.length,
          totalMeetingDurationMinutes: totalMinutes,
          totalHoursInMeetings: Math.round((totalMinutes / 60) * 10) / 10,
          reportsSubmitted: empTasks.filter((t) => t.type === 'REPORT').length,
          dealsWonCount: empDeals.length,
          totalRevenue,
          pipelineValue,
        },
        wonDeals: empDeals,
        activityTrend,
      } as any;
    }

    // 11. Analytics: /analytics/executive
    if (cleanUrl === '/analytics/executive') {
      const totalLeads = this.leads.length;
      const totalClients = this.leads.filter((l) => l.status === 'CONVERTED').length;
      const totalApproached = this.leads.filter((l) => l.status !== 'NEW').length;
      const totalMeetings = this.tasks.filter((t) => t.type === 'CLIENT_MEETING' && t.status === 'COMPLETED').length;
      const wonDeals = this.deals.filter((d) => d.status === 'CLOSED_WON');
      const totalRevenue = wonDeals.reduce((sum, d) => sum + Number(d.dealValue || 0), 0);

      const leaderboard = this.users
        .filter((u) => u.role === 'EMPLOYEE')
        .map((emp) => {
          const empLeads = this.leads.filter((l) => l.assignedToId === emp.id);
          const empWon = this.deals.filter((d) => d.ownerId === emp.id && d.status === 'CLOSED_WON');
          const empRev = empWon.reduce((sum, d) => sum + Number(d.dealValue || 0), 0);
          return {
            id: emp.id,
            name: emp.name,
            email: emp.email,
            avatarUrl: emp.avatarUrl,
            designation: emp.designation,
            leadsCount: empLeads.length,
            convertedCount: empLeads.filter((l) => l.status === 'CONVERTED').length,
            conversionRate: empLeads.length > 0 ? Math.round((empLeads.filter((l) => l.status === 'CONVERTED').length / empLeads.length) * 1000) / 10 : 50,
            meetingsCount: this.tasks.filter((t) => t.assignedToId === emp.id && t.type === 'CLIENT_MEETING').length,
            totalMeetingMinutes: 120,
            dealsWonCount: empWon.length,
            revenueGenerated: empRev,
          };
        });

      return {
        success: true,
        overview: {
          totalClients,
          totalLeads,
          totalApproached,
          totalMeetings,
          totalRevenue,
          overallConversionRate: totalLeads > 0 ? Math.round((totalClients / totalLeads) * 1000) / 10 : 33.3,
          monthlyTarget: 3000000,
          targetProgressPercentage: Math.min(100, Math.round((totalRevenue / 3000000) * 100)),
        },
        dealsByStatus: [
          { status: 'CLOSED_WON', count: 2, value: totalRevenue },
          { status: 'NEGOTIATION', count: 1, value: 950000 },
          { status: 'PROPOSAL', count: 1, value: 450000 },
          { status: 'CLOSED_LOST', count: 0, value: 0 },
        ],
        leadsByArea: [
          { area: 'Hitec City', totalLeads: 1, converted: 1 },
          { area: 'Madhapur', totalLeads: 1, converted: 1 },
          { area: 'Gachibowli', totalLeads: 1, converted: 0 },
          { area: 'Banjara Hills', totalLeads: 1, converted: 0 },
        ],
        monthlyRevenueAndLeadsTrend: [
          { month: 'Jun 2026', revenue: 650000, leadsCount: 4, dealsWon: 1 },
          { month: 'Jul 2026', revenue: 900000, leadsCount: 6, dealsWon: 1 },
          { month: 'Aug 2026', revenue: 1100000, leadsCount: 8, dealsWon: 2 },
          { month: 'Sep 2026', revenue: 1450000, leadsCount: 7, dealsWon: 2 },
          { month: 'Oct 2026', revenue: 1700000, leadsCount: 9, dealsWon: 2 },
          { month: 'Nov 2026', revenue: totalRevenue, leadsCount: totalLeads, dealsWon: wonDeals.length },
        ],
        employeeLeaderboard: leaderboard,
      } as any;
    }

    return { success: true } as any;
  }
}

export const mockEngine = new MockEngine();
