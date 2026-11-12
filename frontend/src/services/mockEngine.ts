import {
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_LEADS,
  INITIAL_TASKS,
  INITIAL_FOLLOWUPS,
  INITIAL_CHECKINS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REMINDERS,
  INITIAL_NOTES,
  INITIAL_WORK_REPORTS,
  INITIAL_DEAL_CLOSING_REPORTS,
  INITIAL_CLIENT_MEETINGS,
  INITIAL_EMPLOYEE_LOCATIONS,
  MockUser,
} from './mockData';

const STORAGE_KEY_PREFIX = 'kalpra_crm_demo_';

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {}
}

// Database state
class MockDatabase {
  users: MockUser[] = getStored('users', INITIAL_USERS);
  clients: any[] = getStored('clients', INITIAL_CLIENTS);
  leads: any[] = getStored('leads', INITIAL_LEADS);
  tasks: any[] = getStored('tasks', INITIAL_TASKS);
  followups: any[] = getStored('followups', INITIAL_FOLLOWUPS);
  checkins: any[] = getStored('checkins', INITIAL_CHECKINS);
  notifications: any[] = getStored('notifications', INITIAL_NOTIFICATIONS);
  reminders: any[] = getStored('reminders', INITIAL_REMINDERS);
  notes: any[] = getStored('notes', INITIAL_NOTES);
  workReports: any[] = getStored('workReports', INITIAL_WORK_REPORTS);
  dealReports: any[] = getStored('dealReports', INITIAL_DEAL_CLOSING_REPORTS);
  clientMeetings: any[] = getStored('clientMeetings', INITIAL_CLIENT_MEETINGS);
  employeeLocations: any[] = getStored('employeeLocations', INITIAL_EMPLOYEE_LOCATIONS);

  save() {
    setStored('users', this.users);
    setStored('clients', this.clients);
    setStored('leads', this.leads);
    setStored('tasks', this.tasks);
    setStored('followups', this.followups);
    setStored('checkins', this.checkins);
    setStored('notifications', this.notifications);
    setStored('reminders', this.reminders);
    setStored('notes', this.notes);
    setStored('workReports', this.workReports);
    setStored('dealReports', this.dealReports);
    setStored('clientMeetings', this.clientMeetings);
    setStored('employeeLocations', this.employeeLocations);
  }

  getCurrentUser(): MockUser {
    const saved = localStorage.getItem('kalpra_crm_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return this.users[0]; // Default to CEO Rajesh Varma
  }
}

export const mockDb = new MockDatabase();

// Mock REST Engine
export async function handleMockRequest(
  endpoint: string,
  method: string = 'GET',
  data?: any,
  params?: Record<string, any>
): Promise<any> {
  // Artificial micro-delay for realistic feel
  await new Promise((r) => setTimeout(r, 60));

  const cleanEndpoint = endpoint.split('?')[0];
  const currentUser = mockDb.getCurrentUser();

  // 1. AUTH
  if (cleanEndpoint === '/auth/login' && method === 'POST') {
    const { email } = data || {};
    const user = mockDb.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase()) || mockDb.users[0];
    return {
      success: true,
      token: 'demo-jwt-token-' + user.id,
      user,
      message: 'Logged in successfully (Demo Mode)',
    };
  }

  if (cleanEndpoint === '/auth/me') {
    return {
      success: true,
      user: currentUser,
    };
  }

  if (cleanEndpoint === '/auth/logout') {
    return { success: true, message: 'Logged out successfully' };
  }

  // 2. DASHBOARD
  if (cleanEndpoint === '/dashboard') {
    const totalClients = mockDb.clients.length;
    const totalLeads = mockDb.leads.length;
    const activeLeads = mockDb.leads.filter((l) => l.status !== 'WON' && l.status !== 'LOST').length;
    const convertedDeals = mockDb.leads.filter((l) => l.status === 'WON').length;
    const lostLeads = mockDb.leads.filter((l) => l.status === 'LOST').length;
    const overallConversionRate = totalLeads ? Math.round((convertedDeals / totalLeads) * 100) : 0;
    const pendingTasks = mockDb.tasks.filter((t) => t.status !== 'COMPLETED').length;
    const overdueTasks = mockDb.tasks.filter((t) => t.status === 'OVERDUE' || new Date(t.dueDate) < new Date()).length;
    const totalRevenue = mockDb.leads
      .filter((l) => l.status === 'WON')
      .reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);

    const monthlyPerformance = [
      { month: 'Jun', revenue: 420000, target: 500000, deals: 2 },
      { month: 'Jul', revenue: 580000, target: 600000, deals: 3 },
      { month: 'Aug', revenue: 710000, target: 700000, deals: 4 },
      { month: 'Sep', revenue: 650000, target: 750000, deals: 3 },
      { month: 'Oct', revenue: 920000, target: 900000, deals: 5 },
      { month: 'Nov', revenue: totalRevenue, target: 1200000, deals: convertedDeals },
    ];

    const employeePerformance = [
      {
        name: 'Shivani Reddy',
        leads: mockDb.leads.filter((l) => l.assignedToId === 'usr-shivani').length,
        won: mockDb.leads.filter((l) => l.assignedToId === 'usr-shivani' && l.status === 'WON').length,
        revenue: mockDb.leads
          .filter((l) => l.assignedToId === 'usr-shivani' && l.status === 'WON')
          .reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0),
        tasksCompleted: mockDb.tasks.filter((t) => t.assignedToId === 'usr-shivani' && t.status === 'COMPLETED').length,
      },
      {
        name: 'Uday Kiran',
        leads: mockDb.leads.filter((l) => l.assignedToId === 'usr-uday').length,
        won: mockDb.leads.filter((l) => l.assignedToId === 'usr-uday' && l.status === 'WON').length,
        revenue: mockDb.leads
          .filter((l) => l.assignedToId === 'usr-uday' && l.status === 'WON')
          .reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0),
        tasksCompleted: mockDb.tasks.filter((t) => t.assignedToId === 'usr-uday' && t.status === 'COMPLETED').length,
      },
    ];

    const leadSources = [
      { source: 'Cold Call', count: mockDb.leads.filter((l) => l.source === 'Cold Call').length, percentage: 30 },
      { source: 'Website', count: mockDb.leads.filter((l) => l.source === 'Website').length, percentage: 25 },
      { source: 'Referral', count: mockDb.leads.filter((l) => l.source === 'Referral').length, percentage: 25 },
      { source: 'Exhibition', count: mockDb.leads.filter((l) => l.source === 'Exhibition').length, percentage: 10 },
      { source: 'Social Media', count: mockDb.leads.filter((l) => l.source === 'Social Media').length, percentage: 10 },
    ];

    const recentActivities = [
      {
        id: 'act-1',
        title: 'Deal Won: Apex Logistics',
        description: 'Shivani closed Rs. 7,50,000 contract with Apex Global Logistics.',
        time: '2 hours ago',
        user: 'Shivani Reddy',
        badge: 'WON',
      },
      {
        id: 'act-2',
        title: 'Task Evidence Submitted',
        description: 'Shivani submitted compliance proposal documentation for review.',
        time: '5 hours ago',
        user: 'Shivani Reddy',
        badge: 'REVIEW',
      },
      {
        id: 'act-3',
        title: 'Field Visit Verified',
        description: 'Uday checked in at Zenith Healthtech Campus, Indiranagar.',
        time: '1 day ago',
        user: 'Uday Kiran',
        badge: 'CHECKIN',
      },
      {
        id: 'act-4',
        title: 'Client Registered',
        description: 'Srija registered GreenAgro Agrochem.',
        time: '2 days ago',
        user: 'Srija Mam',
        badge: 'CLIENT',
      },
    ];

    const overdueFollowups = mockDb.followups
      .filter((f) => f.status === 'OVERDUE' || (f.status === 'SCHEDULED' && new Date(f.scheduledAt) < new Date()))
      .map((f) => {
        const client = mockDb.clients.find((c) => c.id === f.clientId);
        const assignedTo = mockDb.users.find((u) => u.id === f.assignedToId);
        return {
          id: f.id,
          title: f.title,
          clientName: client?.name || 'Client',
          assignedToName: assignedTo?.name || 'Employee',
          scheduledAt: f.scheduledAt,
          type: f.type,
        };
      });

    const employeeProductivity = employeePerformance.map((emp) => ({
      ...emp,
      conversionRate: emp.leads ? Math.round((emp.won / emp.leads) * 100) : 0,
    }));

    // Employee specific stats
    const myLeads = mockDb.leads.filter((l) => l.assignedToId === currentUser.id);
    const myTasks = mockDb.tasks.filter((t) => t.assignedToId === currentUser.id);
    const myFollowups = mockDb.followups.filter((f) => f.assignedToId === currentUser.id);

    return {
      success: true,
      stats: {
        totalClients,
        totalLeads,
        activeLeads,
        convertedDeals,
        lostLeads,
        overallConversionRate,
        pendingTasks,
        overdueTasks,
        totalRevenue,
        monthlyRevenue: totalRevenue,
        // Admin specific
        totalAcquiredClients: totalClients,
        totalLeadsGenerated: totalLeads,
        assignedLeadsCount: mockDb.leads.filter((l) => l.assignedToId).length,
        unassignedLeadsCount: mockDb.leads.filter((l) => !l.assignedToId).length,
        // Manager specific
        totalTeamWorkload: pendingTasks,
        pendingApprovalsCount: mockDb.tasks.filter((t) => t.status === 'PENDING_REVIEW').length,
        delayedActivitiesCount: overdueTasks + overdueFollowups.length,
        // Employee specific
        myAssignedLeads: myLeads.length,
        leadsContacted: myLeads.filter((l) => l.status !== 'NEW_LEAD' && l.status !== 'ASSIGNED').length,
        interestedClients: myLeads.filter((l) => l.status === 'INTERESTED' || l.status === 'DEMO_SCHEDULED').length,
        followupsDueToday: myFollowups.filter((f) => f.status === 'SCHEDULED').length,
        myOverdueFollowups: myFollowups.filter((f) => f.status === 'OVERDUE').length,
        tasksAssigned: myTasks.length,
        tasksCompleted: myTasks.filter((t) => t.status === 'COMPLETED').length,
        myPendingTasks: myTasks.filter((t) => t.status !== 'COMPLETED').length,
        dealsConverted: myLeads.filter((l) => l.status === 'WON').length,
      },
      monthlyPerformance,
      employeePerformance,
      leadSources,
      recentActivities,
      overdueFollowups,
      employeeProductivity,
      statusDistribution: [
        { status: 'NEW_LEAD', count: mockDb.leads.filter((l) => l.status === 'NEW_LEAD').length },
        { status: 'ASSIGNED', count: mockDb.leads.filter((l) => l.status === 'ASSIGNED').length },
        { status: 'CONTACTED', count: mockDb.leads.filter((l) => l.status === 'CONTACTED').length },
        { status: 'INTERESTED', count: mockDb.leads.filter((l) => l.status === 'INTERESTED').length },
        { status: 'DEMO_SCHEDULED', count: mockDb.leads.filter((l) => l.status === 'DEMO_SCHEDULED').length },
        { status: 'PROPOSAL_SENT', count: mockDb.leads.filter((l) => l.status === 'PROPOSAL_SENT').length },
        { status: 'NEGOTIATION', count: mockDb.leads.filter((l) => l.status === 'NEGOTIATION').length },
        { status: 'WON', count: convertedDeals },
        { status: 'LOST', count: lostLeads },
      ],
      employeeWiseLeads: [
        { name: 'Shivani Reddy', count: mockDb.leads.filter((l) => l.assignedToId === 'usr-shivani').length },
        { name: 'Uday Kiran', count: mockDb.leads.filter((l) => l.assignedToId === 'usr-uday').length },
      ],
      recentClients: mockDb.clients.slice(0, 5),
      leadProgression: [
        { stage: 'Acquired', count: totalClients },
        { stage: 'Contacted', count: mockDb.leads.filter((l) => l.status !== 'NEW_LEAD').length },
        { stage: 'Qualified', count: mockDb.leads.filter((l) => ['INTERESTED', 'DEMO_SCHEDULED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON'].includes(l.status)).length },
        { stage: 'Won', count: convertedDeals },
      ],
      upcomingTasks: myTasks.slice(0, 5),
      todayFollowups: myFollowups.slice(0, 5),
    };
  }

  // 3. CLIENTS
  if (cleanEndpoint === '/clients') {
    if (method === 'GET') {
      const search = (params?.search || '').toLowerCase();
      const status = params?.status || '';
      let list = mockDb.clients;
      if (search) {
        list = list.filter(
          (c) =>
            c.name.toLowerCase().includes(search) ||
            c.organization.toLowerCase().includes(search) ||
            c.contactPerson.toLowerCase().includes(search) ||
            c.clientId.toLowerCase().includes(search)
        );
      }
      if (status) {
        list = list.filter((c) => c.status === status);
      }
      return {
        success: true,
        data: list,
        pagination: { total: list.length, page: 1, limit: 50, totalPages: 1 },
      };
    }

    if (method === 'POST') {
      const nextNum = 1000 + mockDb.clients.length + 1;
      const newClient = {
        id: 'clt-' + Date.now(),
        clientId: 'CLT-' + nextNum,
        name: data.name,
        organization: data.organization || data.name,
        contactPerson: data.contactPerson,
        phone: data.phone,
        email: data.email,
        location: data.location || 'India',
        industry: data.industry || 'General',
        requirement: data.requirement || '',
        source: data.source || 'Website',
        notes: data.notes || '',
        status: 'ACTIVE',
        createdById: currentUser.id,
        createdAt: new Date().toISOString(),
      };
      mockDb.clients.unshift(newClient);
      mockDb.save();
      return { success: true, data: newClient, message: 'Client registered successfully' };
    }
  }

  // Client Details
  if (cleanEndpoint.startsWith('/clients/')) {
    const clientId = cleanEndpoint.replace('/clients/', '');
    const client = mockDb.clients.find((c) => c.id === clientId || c.clientId === clientId);
    if (!client) {
      return { success: false, message: 'Client not found' };
    }

    if (method === 'GET') {
      const leads = mockDb.leads.filter((l) => l.clientId === client.id);
      const tasks = mockDb.tasks.filter((t) => t.clientId === client.id);
      const followups = mockDb.followups.filter((f) => f.clientId === client.id);
      const checkins = mockDb.checkins.filter((c) => c.clientId === client.id);
      return {
        success: true,
        data: {
          ...client,
          leads: leads.map((l) => ({
            ...l,
            assignedTo: mockDb.users.find((u) => u.id === l.assignedToId),
          })),
          tasks: tasks.map((t) => ({
            ...t,
            assignedTo: mockDb.users.find((u) => u.id === t.assignedToId),
          })),
          followups: followups.map((f) => ({
            ...f,
            assignedTo: mockDb.users.find((u) => u.id === f.assignedToId),
          })),
          checkins,
        },
      };
    }

    if (method === 'PUT') {
      Object.assign(client, data);
      mockDb.save();
      return { success: true, data: client, message: 'Client updated successfully' };
    }
  }

  // 4. LEADS
  if (cleanEndpoint === '/leads') {
    if (method === 'GET') {
      const search = (params?.search || '').toLowerCase();
      const status = params?.status || '';
      const assignedToId = params?.assignedToId || '';
      let list = mockDb.leads;

      if (currentUser.role === 'EMPLOYEE') {
        list = list.filter((l) => l.assignedToId === currentUser.id);
      } else if (assignedToId) {
        list = list.filter((l) => l.assignedToId === assignedToId);
      }

      if (status) {
        list = list.filter((l) => l.status === status);
      }

      const enriched = list.map((l) => ({
        ...l,
        client: mockDb.clients.find((c) => c.id === l.clientId),
        assignedTo: mockDb.users.find((u) => u.id === l.assignedToId),
      }));

      if (search) {
        return {
          success: true,
          data: enriched.filter(
            (l) =>
              l.leadId.toLowerCase().includes(search) ||
              l.requirement?.toLowerCase().includes(search) ||
              l.client?.name?.toLowerCase().includes(search)
          ),
        };
      }

      return { success: true, data: enriched };
    }

    if (method === 'POST') {
      const nextNum = 2000 + mockDb.leads.length + 1;
      let clientId = data.clientId;

      // If new company name provided and no existing client selected, auto-register client
      if (!clientId && data.companyName) {
        const newClient = {
          id: 'clt-' + Date.now(),
          clientId: 'CLT-' + (1000 + mockDb.clients.length + 1),
          name: data.companyName,
          organization: data.companyName,
          contactPerson: data.contactPerson || 'Client Contact',
          phone: data.contactNumber || data.phone || '+91 90000 00000',
          email: data.email || `${data.companyName.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
          location: data.area || 'Hyderabad',
          industry: data.industry || 'Technology & Services',
          requirement: data.requirement || '',
          source: data.source || 'Website',
          status: 'ACTIVE',
          notes: data.notes || '',
          createdAt: new Date().toISOString(),
          createdById: currentUser.id,
        };
        mockDb.clients.unshift(newClient);
        clientId = newClient.id;
      }

      const newLead = {
        id: 'led-' + Date.now(),
        leadId: 'LED-' + nextNum,
        clientId: clientId || mockDb.clients[0]?.id,
        contactPerson: data.contactPerson || (data.name ? data.name : 'Lead Person'),
        designation: data.designation || 'Manager',
        companyName: data.companyName || mockDb.clients.find((c) => c.id === clientId)?.name || 'Company',
        area: data.area || 'Hitec City, Hyderabad',
        contactNumber: data.contactNumber || data.phone || '+91 90000 00000',
        assignedToId: data.assignedToId || currentUser.id,
        priority: data.priority || 'MEDIUM',
        status: data.status || 'Interested',
        requirement: data.requirement || 'CRM & Software Solutions',
        dealValue: Number(data.dealValue || data.expectedValue) || 300000,
        source: data.source || 'Direct',
        notes: data.notes || '',
        nextFollowupDate: data.nextFollowupDate || null,
        createdById: currentUser.id,
        createdAt: new Date().toISOString(),
      };
      mockDb.leads.unshift(newLead);
      mockDb.save();
      return {
        success: true,
        data: {
          ...newLead,
          client: mockDb.clients.find((c) => c.id === newLead.clientId),
          assignedTo: mockDb.users.find((u) => u.id === newLead.assignedToId),
        },
        message: 'Lead created successfully',
      };
    }
  }

  if (cleanEndpoint.startsWith('/leads/') && cleanEndpoint.endsWith('/assign') && method === 'PATCH') {
    const leadId = cleanEndpoint.replace('/leads/', '').replace('/assign', '');
    const lead = mockDb.leads.find((l) => l.id === leadId);
    if (lead) {
      lead.assignedToId = data.assignedToId;
      lead.status = 'ASSIGNED';
      mockDb.save();
      return { success: true, data: lead, message: 'Lead assigned successfully' };
    }
  }

  if (cleanEndpoint.startsWith('/leads/') && cleanEndpoint.endsWith('/status') && method === 'PATCH') {
    const leadId = cleanEndpoint.replace('/leads/', '').replace('/status', '');
    const lead = mockDb.leads.find((l) => l.id === leadId);
    if (lead) {
      lead.status = data.status;
      if (data.reason) lead.statusReason = data.reason;
      mockDb.save();
      return { success: true, data: lead, message: 'Status updated successfully' };
    }
  }

  // 5. SALES PIPELINE
  if (cleanEndpoint === '/pipeline') {
    if (method === 'GET') {
      const STAGES = [
        'NEW_LEAD',
        'ASSIGNED',
        'CONTACTED',
        'INTERESTED',
        'DEMO_SCHEDULED',
        'PROPOSAL_SENT',
        'NEGOTIATION',
        'WON',
        'LOST',
        'ON_HOLD',
      ];

      let leads = mockDb.leads;
      if (currentUser.role === 'EMPLOYEE') {
        leads = leads.filter((l) => l.assignedToId === currentUser.id);
      }

      const enriched = leads.map((l) => ({
        ...l,
        client: mockDb.clients.find((c) => c.id === l.clientId),
        assignedTo: mockDb.users.find((u) => u.id === l.assignedToId),
      }));

      const columns = STAGES.map((stage) => {
        const stageLeads = enriched.filter((l) => l.status === stage);
        const stageValue = stageLeads.reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);
        return {
          id: stage,
          name: stage.replace(/_/g, ' '),
          leads: stageLeads,
          count: stageLeads.length,
          totalValue: stageValue,
        };
      });

      return {
        success: true,
        data: {
          columns,
          totalLeads: enriched.length,
          totalPipelineValue: enriched.reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0),
        },
      };
    }
  }

  if (cleanEndpoint.startsWith('/pipeline/') && cleanEndpoint.endsWith('/move') && method === 'PATCH') {
    const leadId = cleanEndpoint.replace('/pipeline/', '').replace('/move', '');
    const lead = mockDb.leads.find((l) => l.id === leadId);
    if (lead) {
      lead.status = data.stage || data.status;
      if (data.reason) lead.statusReason = data.reason;
      if (data.dealValue) lead.dealValue = Number(data.dealValue);
      mockDb.save();
      return { success: true, data: lead, message: 'Lead moved successfully' };
    }
  }

  // 6. TASKS
  if (cleanEndpoint === '/tasks') {
    if (method === 'GET') {
      let list = mockDb.tasks;
      if (currentUser.role === 'EMPLOYEE') {
        list = list.filter((t) => t.assignedToId === currentUser.id);
      }
      const enriched = list.map((t) => ({
        ...t,
        client: mockDb.clients.find((c) => c.id === t.clientId),
        assignedTo: mockDb.users.find((u) => u.id === t.assignedToId),
      }));
      return { success: true, data: enriched };
    }

    if (method === 'POST') {
      const nextNum = 3000 + mockDb.tasks.length + 1;
      const newTask = {
        id: 'tsk-' + Date.now(),
        taskId: 'TSK-' + nextNum,
        title: data.title,
        description: data.description,
        assignedToId: data.assignedToId,
        clientId: data.clientId || null,
        leadId: data.leadId || null,
        priority: data.priority || 'MEDIUM',
        status: 'NOT_STARTED',
        dueDate: data.dueDate,
        createdById: currentUser.id,
        createdAt: new Date().toISOString(),
      };
      mockDb.tasks.unshift(newTask);
      mockDb.save();
      return {
        success: true,
        data: {
          ...newTask,
          client: mockDb.clients.find((c) => c.id === newTask.clientId),
          assignedTo: mockDb.users.find((u) => u.id === newTask.assignedToId),
        },
        message: 'Task created successfully',
      };
    }
  }

  if (cleanEndpoint.startsWith('/tasks/') && cleanEndpoint.endsWith('/status') && method === 'PATCH') {
    const taskId = cleanEndpoint.replace('/tasks/', '').replace('/status', '');
    const task = mockDb.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = data.status;
      if (data.progressRemarks) task.progressRemarks = data.progressRemarks;
      if (data.completionEvidence) task.completionEvidence = data.completionEvidence;
      if (data.attachmentUrl) task.attachmentUrl = data.attachmentUrl;
      mockDb.save();
      return { success: true, data: task, message: 'Task updated successfully' };
    }
  }

  if (cleanEndpoint.startsWith('/tasks/') && cleanEndpoint.endsWith('/review') && method === 'PATCH') {
    const taskId = cleanEndpoint.replace('/tasks/', '').replace('/review', '');
    const task = mockDb.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = data.status; // COMPLETED or BLOCKED
      task.reviewRemarks = data.reviewRemarks;
      task.reviewedById = currentUser.id;
      task.reviewedAt = new Date().toISOString();
      mockDb.save();
      return { success: true, data: task, message: 'Task review submitted' };
    }
  }

  // 7. FOLLOW-UPS
  if (cleanEndpoint === '/followups') {
    if (method === 'GET') {
      let list = mockDb.followups;
      if (currentUser.role === 'EMPLOYEE') {
        list = list.filter((f) => f.assignedToId === currentUser.id);
      }
      const enriched = list.map((f) => ({
        ...f,
        client: mockDb.clients.find((c) => c.id === f.clientId),
        assignedTo: mockDb.users.find((u) => u.id === f.assignedToId),
      }));
      return { success: true, data: enriched };
    }

    if (method === 'POST') {
      const nextNum = 4000 + mockDb.followups.length + 1;
      const newFollowup = {
        id: 'flw-' + Date.now(),
        followupId: 'FLW-' + nextNum,
        title: data.title,
        clientId: data.clientId,
        leadId: data.leadId || null,
        assignedToId: data.assignedToId || currentUser.id,
        scheduledAt: data.scheduledAt,
        type: data.type || 'CALL',
        status: 'SCHEDULED',
        notes: data.notes || '',
        createdById: currentUser.id,
        createdAt: new Date().toISOString(),
      };
      mockDb.followups.unshift(newFollowup);
      mockDb.save();
      return {
        success: true,
        data: {
          ...newFollowup,
          client: mockDb.clients.find((c) => c.id === newFollowup.clientId),
          assignedTo: mockDb.users.find((u) => u.id === newFollowup.assignedToId),
        },
        message: 'Follow-up scheduled successfully',
      };
    }
  }

  if (cleanEndpoint.startsWith('/followups/') && cleanEndpoint.endsWith('/complete') && method === 'PATCH') {
    const followupId = cleanEndpoint.replace('/followups/', '').replace('/complete', '');
    const followup = mockDb.followups.find((f) => f.id === followupId);
    if (followup) {
      followup.status = 'COMPLETED';
      followup.outcome = data.outcome;
      followup.clientResponse = data.clientResponse;
      followup.discussionNotes = data.discussionNotes;
      followup.completedAt = new Date().toISOString();
      mockDb.save();
      return { success: true, data: followup, message: 'Follow-up completed' };
    }
  }

  // 8. FIELD TRACKING
  if (cleanEndpoint === '/tracking') {
    if (method === 'GET') {
      const enriched = mockDb.checkins.map((c) => ({
        ...c,
        client: mockDb.clients.find((cl) => cl.id === c.clientId),
        employee: mockDb.users.find((u) => u.id === c.employeeId),
      }));
      return { success: true, data: enriched };
    }

    if (method === 'POST') {
      const nextNum = 5000 + mockDb.checkins.length + 1;
      const newCheckin = {
        id: 'chk-' + Date.now(),
        checkinId: 'CHK-' + nextNum,
        employeeId: currentUser.id,
        clientId: data.clientId,
        locationName: data.locationName || 'Client Site',
        latitude: data.latitude || 17.385,
        longitude: data.longitude || 78.4867,
        notes: data.notes || '',
        photoUrl:
          data.photoUrl ||
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
      };
      mockDb.checkins.unshift(newCheckin);
      mockDb.save();
      return {
        success: true,
        data: {
          ...newCheckin,
          client: mockDb.clients.find((cl) => cl.id === newCheckin.clientId),
          employee: currentUser,
        },
        message: 'Field check-in recorded successfully',
      };
    }
  }

  // 9. ANALYTICS
  if (cleanEndpoint === '/analytics') {
    return {
      success: true,
      data: {
        totalLeads: mockDb.leads.length,
        wonLeads: mockDb.leads.filter((l) => l.status === 'WON').length,
        conversionRate: 20,
        totalRevenue: mockDb.leads
          .filter((l) => l.status === 'WON')
          .reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0),
        employeeComparison: [
          {
            name: 'Shivani Reddy',
            contacted: 8,
            completedTasks: 5,
            wonDeals: 1,
            revenue: 750000,
            conversionRate: 25,
          },
          {
            name: 'Uday Kiran',
            contacted: 6,
            completedTasks: 4,
            wonDeals: 1,
            revenue: 520000,
            conversionRate: 20,
          },
        ],
        stageFunnel: [
          { stage: 'New Leads', count: 1 },
          { stage: 'Contacted', count: 2 },
          { stage: 'Interested', count: 1 },
          { stage: 'Proposal / Demo', count: 2 },
          { stage: 'Negotiation', count: 1 },
          { stage: 'Won', count: 2 },
        ],
      },
    };
  }

  // 10. REPORTS
  if (cleanEndpoint === '/reports') {
    const reportType = params?.type || 'conversion';
    let records = [];

    if (reportType === 'conversion') {
      records = mockDb.leads.map((l) => ({
        id: l.leadId,
        client: mockDb.clients.find((c) => c.id === l.clientId)?.name || 'Client',
        assignedTo: mockDb.users.find((u) => u.id === l.assignedToId)?.name || 'Unassigned',
        source: l.source,
        status: l.status,
        dealValue: l.dealValue,
        date: l.createdAt.split('T')[0],
      }));
    } else if (reportType === 'productivity') {
      records = [
        {
          employee: 'Shivani Reddy',
          assignedLeads: 5,
          contacted: 4,
          wonDeals: 1,
          tasksCompleted: 4,
          followupsDone: 3,
          revenueGenerated: 'Rs. 7,50,000',
        },
        {
          employee: 'Uday Kiran',
          assignedLeads: 4,
          contacted: 3,
          wonDeals: 1,
          tasksCompleted: 3,
          followupsDone: 2,
          revenueGenerated: 'Rs. 5,20,000',
        },
      ];
    } else if (reportType === 'daily') {
      records = mockDb.tasks.map((t) => ({
        taskId: t.taskId,
        title: t.title,
        employee: mockDb.users.find((u) => u.id === t.assignedToId)?.name || 'Employee',
        client: mockDb.clients.find((c) => c.id === t.clientId)?.name || 'Client',
        status: t.status,
        dueDate: t.dueDate.split('T')[0],
      }));
    } else {
      records = mockDb.leads
        .filter((l) => l.status === 'WON')
        .map((l) => ({
          leadId: l.leadId,
          client: mockDb.clients.find((c) => c.id === l.clientId)?.name || 'Client',
          closedBy: mockDb.users.find((u) => u.id === l.assignedToId)?.name || 'Employee',
          dealValue: 'Rs. ' + Number(l.dealValue).toLocaleString('en-IN'),
          closedDate: l.createdAt.split('T')[0],
        }));
    }

    return {
      success: true,
      reportType,
      records,
      generatedAt: new Date().toISOString(),
    };
  }

  // 11. NOTIFICATIONS
  if (cleanEndpoint === '/notifications') {
    if (method === 'GET') {
      return { success: true, data: mockDb.notifications };
    }
  }

  if (cleanEndpoint.startsWith('/notifications/') && cleanEndpoint.endsWith('/read') && method === 'PATCH') {
    const notifId = cleanEndpoint.replace('/notifications/', '').replace('/read', '');
    const n = mockDb.notifications.find((notif) => notif.id === notifId);
    if (n) n.isRead = true;
    mockDb.save();
    return { success: true };
  }

  if (cleanEndpoint === '/notifications/read-all' && method === 'PATCH') {
    mockDb.notifications.forEach((n) => (n.isRead = true));
    mockDb.save();
    return { success: true };
  }

  // 12. UPLOAD
  if (cleanEndpoint === '/upload' && method === 'POST') {
    return {
      success: true,
      fileUrl:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
      filename: 'uploaded_evidence.jpg',
    };
  }

  // 13. CALENDAR TASK REMINDERS (Module 1a)
  if (cleanEndpoint === '/reminders') {
    if (method === 'GET') {
      const userId = params?.userId || currentUser.id;
      // Admin and CEO can see all or filter, Employee sees own
      let filtered = mockDb.reminders;
      if (currentUser.role === 'EMPLOYEE' || params?.userId) {
        filtered = filtered.filter((r) => r.userId === userId);
      }
      return { success: true, data: filtered };
    }

    if (method === 'POST') {
      const newReminder = {
        id: 'rem-' + Date.now(),
        userId: data?.userId || currentUser.id,
        title: data?.title || 'Reminder',
        date: data?.date || new Date().toISOString().split('T')[0],
        time: data?.time || '10:00',
        category: data?.category || 'TASK',
        priority: data?.priority || 'MEDIUM',
        notes: data?.notes || '',
        isCompleted: false,
        createdAt: new Date().toISOString(),
      };
      mockDb.reminders.unshift(newReminder);
      mockDb.save();
      return { success: true, data: newReminder, message: 'Reminder created successfully' };
    }
  }

  if (cleanEndpoint.startsWith('/reminders/') && cleanEndpoint.endsWith('/toggle') && method === 'PATCH') {
    const id = cleanEndpoint.replace('/reminders/', '').replace('/toggle', '');
    const reminder = mockDb.reminders.find((r) => r.id === id);
    if (reminder) {
      reminder.isCompleted = !reminder.isCompleted;
      mockDb.save();
      return { success: true, data: reminder };
    }
    return { success: false, message: 'Reminder not found' };
  }

  if (cleanEndpoint.startsWith('/reminders/') && method === 'DELETE') {
    const id = cleanEndpoint.replace('/reminders/', '');
    mockDb.reminders = mockDb.reminders.filter((r) => r.id !== id);
    mockDb.save();
    return { success: true, message: 'Reminder deleted' };
  }

  // 14. PERSONAL & STRATEGIC NOTES (Module 1c)
  if (cleanEndpoint === '/notes') {
    if (method === 'GET') {
      const userId = params?.userId || currentUser.id;
      const userNotes = mockDb.notes.filter((n) => n.userId === userId);
      userNotes.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      });
      return { success: true, data: userNotes };
    }

    if (method === 'POST') {
      const newNote = {
        id: 'note-' + Date.now(),
        userId: currentUser.id,
        title: data?.title || 'Untitled Thought',
        content: data?.content || '',
        color: data?.color || 'yellow',
        isPinned: !!data?.isPinned,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockDb.notes.unshift(newNote);
      mockDb.save();
      return { success: true, data: newNote, message: 'Note saved' };
    }
  }

  if (cleanEndpoint.startsWith('/notes/') && method === 'PUT') {
    const id = cleanEndpoint.replace('/notes/', '');
    const note = mockDb.notes.find((n) => n.id === id);
    if (note) {
      note.title = data?.title ?? note.title;
      note.content = data?.content ?? note.content;
      note.color = data?.color ?? note.color;
      note.isPinned = data?.isPinned ?? note.isPinned;
      note.updatedAt = new Date().toISOString();
      mockDb.save();
      return { success: true, data: note };
    }
    return { success: false, message: 'Note not found' };
  }

  if (cleanEndpoint.startsWith('/notes/') && method === 'DELETE') {
    const id = cleanEndpoint.replace('/notes/', '');
    mockDb.notes = mockDb.notes.filter((n) => n.id !== id);
    mockDb.save();
    return { success: true, message: 'Note deleted' };
  }

  // 15. CLIENT MEETINGS (Module 3 Box 1)
  if (cleanEndpoint === '/client-meetings') {
    if (method === 'GET') {
      return { success: true, data: mockDb.clientMeetings };
    }
    if (method === 'POST') {
      const newMtg = {
        id: 'mtg-' + Date.now(),
        clientId: data?.clientId || 'clt-custom',
        contactPerson: data?.contactPerson || 'Client Contact',
        designation: data?.designation || 'Manager',
        companyName: data?.companyName || 'Company',
        area: data?.area || 'Hyderabad',
        contactNumber: data?.contactNumber || '+91 90000 00000',
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        scheduledTime: data?.scheduledTime || 'Today',
        status: data?.status || 'SCHEDULED',
        clientStatus: data?.clientStatus || 'Active',
        discussionNotes: data?.discussionNotes || '',
        createdAt: new Date().toISOString(),
      };
      mockDb.clientMeetings.unshift(newMtg);
      mockDb.save();
      return { success: true, data: newMtg };
    }
  }

  if (cleanEndpoint.startsWith('/client-meetings/') && cleanEndpoint.endsWith('/start') && method === 'POST') {
    const id = cleanEndpoint.replace('/client-meetings/', '').replace('/start', '');
    const meeting = mockDb.clientMeetings.find((m) => m.id === id);
    if (meeting) {
      meeting.status = 'IN_MEETING';
      meeting.meetingStartTime = new Date().toISOString();
      mockDb.save();
      return { success: true, data: meeting, message: 'Meeting timer started' };
    }
    return { success: false, message: 'Meeting not found' };
  }

  if (cleanEndpoint.startsWith('/client-meetings/') && cleanEndpoint.endsWith('/stop') && method === 'POST') {
    const id = cleanEndpoint.replace('/client-meetings/', '').replace('/stop', '');
    const meeting = mockDb.clientMeetings.find((m) => m.id === id);
    if (meeting) {
      meeting.status = 'COMPLETED';
      meeting.meetingStopTime = new Date().toISOString();
      if (meeting.meetingStartTime) {
        const diffMs = new Date(meeting.meetingStopTime).getTime() - new Date(meeting.meetingStartTime).getTime();
        meeting.durationMinutes = Math.max(1, Math.round(diffMs / 60000));
      } else {
        meeting.durationMinutes = data?.durationMinutes || 45;
      }
      if (data?.discussionNotes) meeting.discussionNotes = data.discussionNotes;
      if (data?.clientStatus) meeting.clientStatus = data.clientStatus;
      mockDb.save();
      return { success: true, data: meeting, message: 'Meeting completed successfully' };
    }
    return { success: false, message: 'Meeting not found' };
  }

  if (cleanEndpoint.startsWith('/client-meetings/') && cleanEndpoint.endsWith('/upload-photo') && method === 'POST') {
    const id = cleanEndpoint.replace('/client-meetings/', '').replace('/upload-photo', '');
    const meeting = mockDb.clientMeetings.find((m) => m.id === id);
    if (meeting) {
      meeting.photoUrl = data?.photoUrl;
      // Also register into checkins and update employee live location photo
      mockDb.checkins.unshift({
        id: 'chk-' + Date.now(),
        checkinId: 'CHK-' + Math.floor(5000 + Math.random() * 1000),
        employeeId: meeting.employeeId,
        clientId: meeting.clientId,
        locationName: meeting.area + ' - ' + meeting.companyName,
        latitude: 17.44 + Math.random() * 0.05,
        longitude: 78.38 + Math.random() * 0.05,
        notes: `Meeting photo uploaded for ${meeting.contactPerson} (${meeting.companyName})`,
        photoUrl: data?.photoUrl,
        createdAt: new Date().toISOString(),
      });
      const loc = mockDb.employeeLocations.find((l) => l.employeeId === meeting.employeeId);
      if (loc) {
        loc.lastPhotoUrl = data?.photoUrl;
        loc.lastActive = 'Just now';
        loc.currentArea = meeting.area;
      }
      mockDb.save();
      return { success: true, data: meeting, message: 'Photo uploaded successfully' };
    }
    return { success: false, message: 'Meeting not found' };
  }

  // 16. WORK STATUS REPORTS (Module 3 Box 3) - Synced to Admin & CEO
  if (cleanEndpoint === '/work-reports') {
    if (method === 'GET') {
      return { success: true, data: mockDb.workReports };
    }
    if (method === 'POST') {
      const newReport = {
        id: 'rep-' + Date.now(),
        reportId: 'REP-' + Math.floor(100 + Math.random() * 900),
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        employeeAvatar: currentUser.avatar,
        employeeDesignation: currentUser.designation || 'Marketing Executive',
        title: data?.title || 'Daily Work Status Report',
        date: data?.date || new Date().toISOString().split('T')[0],
        summary: data?.summary || '',
        meetingsConducted: Number(data?.meetingsConducted) || 1,
        leadsContacted: Number(data?.leadsContacted) || 3,
        dealsProgressed: Number(data?.dealsProgressed) || 1,
        revenueInfluenced: Number(data?.revenueInfluenced) || 0,
        challenges: data?.challenges || '',
        attachmentName: data?.attachmentName || 'Daily_Work_Summary.pdf',
        attachmentSize: data?.attachmentSize || '1.8 MB',
        status: 'SUBMITTED',
        createdAt: new Date().toISOString(),
      };
      mockDb.workReports.unshift(newReport);
      // Notify Admin and CEO
      mockDb.notifications.unshift({
        id: 'notif-' + Date.now(),
        userId: 'usr-admin',
        title: 'New Work Report Submitted 📋',
        message: `${currentUser.name} uploaded work report: "${newReport.title}". Reflected on Admin and CEO Dashboards.`,
        type: 'TASK_ASSIGNED',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      mockDb.notifications.unshift({
        id: 'notif-' + (Date.now() + 1),
        userId: 'usr-ceo',
        title: 'Marketing Work Report Received 📈',
        message: `${currentUser.name} submitted daily status update (${newReport.meetingsConducted} meetings, Rs. ${newReport.revenueInfluenced.toLocaleString('en-IN')} pipeline).`,
        type: 'TASK_ASSIGNED',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      mockDb.save();
      return { success: true, data: newReport, message: 'Report submitted and reflected in Admin & CEO Dashboards!' };
    }
  }

  if (cleanEndpoint.startsWith('/work-reports/') && cleanEndpoint.endsWith('/review') && method === 'PATCH') {
    const id = cleanEndpoint.replace('/work-reports/', '').replace('/review', '');
    const report = mockDb.workReports.find((r) => r.id === id);
    if (report) {
      report.status = data?.status || 'REVIEWED';
      report.reviewedBy = currentUser.name;
      report.reviewedAt = new Date().toISOString();
      if (data?.adminRemarks) report.adminRemarks = data.adminRemarks;
      mockDb.save();
      return { success: true, data: report, message: 'Report reviewed' };
    }
    return { success: false, message: 'Report not found' };
  }

  // 17. DEAL CLOSING REPORTS (Admin Module 2)
  if (cleanEndpoint === '/deal-reports') {
    if (method === 'GET') {
      return { success: true, data: mockDb.dealReports };
    }
    if (method === 'POST') {
      const budgetAmount = Number(data?.budgetAmount) || 500000;
      const reportNum = mockDb.dealReports.length + 1;
      const newDealReport = {
        id: 'dcr-' + Date.now(),
        reportId: `DCR-2026-${String(reportNum).padStart(3, '0')}`,
        clientId: data?.clientId,
        clientName: data?.clientName || 'Client',
        organization: data?.organization || data?.clientName || 'Client Org',
        contactPerson: data?.contactPerson || 'Lead Person',
        contactDesignation: data?.contactDesignation || 'Director',
        area: data?.area || 'Hyderabad',
        dealTitle: data?.dealTitle || 'Enterprise Software Subscription Agreement',
        budgetAmount,
        closedDate: data?.closedDate || new Date().toISOString().split('T')[0],
        paymentMilestones: data?.paymentMilestones || '50% Advance, 50% on Delivery',
        scopeOfWork: data?.scopeOfWork || 'Implementation of Kalpra CRM solution.',
        wonReason: data?.wonReason || 'Superior features and local technical support.',
        closedById: currentUser.id,
        closedByName: currentUser.name,
        createdAt: new Date().toISOString(),
      };
      mockDb.dealReports.unshift(newDealReport);

      // Update lead to Won if lead exists
      const lead = mockDb.leads.find((l) => l.clientId === data?.clientId || l.id === data?.leadId);
      if (lead) {
        lead.status = 'Won';
        lead.dealValue = budgetAmount;
      }

      // Update client status
      const client = mockDb.clients.find((c) => c.id === data?.clientId);
      if (client) {
        client.status = 'Closed Won';
      }

      // Notify CEO
      mockDb.notifications.unshift({
        id: 'notif-' + Date.now(),
        userId: 'usr-ceo',
        title: `Deal Closed with Budget Rs. ${budgetAmount.toLocaleString('en-IN')} 🏆`,
        message: `${currentUser.name} closed the deal for ${newDealReport.clientName}. Closing report ${newDealReport.reportId} generated.`,
        type: 'DEAL_WON',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      mockDb.save();
      return { success: true, data: newDealReport, message: 'Deal closed and report generated successfully!' };
    }
  }

  // 18. FOLLOW-UP STATUS & OTHER CUSTOM STATUS (Module 3 Box 2)
  if (cleanEndpoint.startsWith('/followups/') && cleanEndpoint.endsWith('/status') && method === 'PATCH') {
    const id = cleanEndpoint.replace('/followups/', '').replace('/status', '');
    const followup = mockDb.followups.find((f) => f.id === id);
    if (followup) {
      followup.status = data?.status || followup.status;
      if (data?.customStatusText !== undefined) {
        followup.customStatusText = data.customStatusText;
      }
      if (data?.notes) followup.notes = data.notes;
      mockDb.save();
      return { success: true, data: followup, message: 'Follow-up status updated' };
    }
    return { success: false, message: 'Follow-up not found' };
  }

  // 19. LEAD NOTES & CREATION WITH USER REQUIREMENTS (Module 2)
  if (cleanEndpoint.startsWith('/leads/') && cleanEndpoint.endsWith('/notes') && method === 'PATCH') {
    const id = cleanEndpoint.replace('/leads/', '').replace('/notes', '');
    const lead = mockDb.leads.find((l) => l.id === id);
    if (lead) {
      lead.notes = data?.notes;
      mockDb.save();
      return { success: true, data: lead, message: 'Lead notes updated' };
    }
    return { success: false, message: 'Lead not found' };
  }

  // 20. TEAM MANAGEMENT & LOCATION MONITORING (Admin Module 3 & Extra Feature)
  if (cleanEndpoint === '/team/add' && method === 'POST') {
    const newUser = {
      id: 'usr-' + Date.now(),
      name: data?.name || 'New Employee',
      email: data?.email || `employee${Date.now()}@kalpracrm.com`,
      role: (data?.role as any) || 'EMPLOYEE',
      phone: data?.phone || '+91 98765 00000',
      designation: data?.designation || 'Marketing & Sales Executive',
      department: data?.department || 'Marketing & Sales',
      area: data?.area || 'Hitec City, Hyderabad',
      avatar:
        data?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    mockDb.users.push(newUser);
    // Add default live tracking entry
    mockDb.employeeLocations.push({
      employeeId: newUser.id,
      employeeName: newUser.name,
      designation: newUser.designation,
      avatar: newUser.avatar,
      currentArea: newUser.area,
      city: 'Hyderabad',
      latitude: 17.44,
      longitude: 78.38,
      lastActive: 'Just registered',
      status: 'ON_FIELD',
      batteryLevel: 95,
    });
    mockDb.save();
    return { success: true, data: newUser, message: 'Team member added successfully' };
  }

  if (cleanEndpoint === '/team/assign-lead' && method === 'POST') {
    const lead = mockDb.leads.find((l) => l.id === data?.leadId);
    if (lead) {
      lead.assignedToId = data?.employeeId;
      mockDb.save();
      return { success: true, data: lead, message: 'Lead assigned to team member' };
    }
    return { success: false, message: 'Lead not found' };
  }

  if (cleanEndpoint === '/tracking/locations' && method === 'GET') {
    return { success: true, data: mockDb.employeeLocations };
  }

  if (cleanEndpoint === '/tracking/update-location' && method === 'POST') {
    const loc = mockDb.employeeLocations.find((l) => l.employeeId === currentUser.id);
    if (loc) {
      if (data?.currentArea) loc.currentArea = data.currentArea;
      if (data?.latitude) loc.latitude = data.latitude;
      if (data?.longitude) loc.longitude = data.longitude;
      if (data?.status) loc.status = data.status;
      if (data?.currentClient) loc.currentClient = data.currentClient;
      if (data?.photoUrl) loc.lastPhotoUrl = data.photoUrl;
      loc.lastActive = 'Just now';
      mockDb.save();
      return { success: true, data: loc };
    }
    return { success: false, message: 'Location entry not found' };
  }

  return { success: true, message: 'OK', data: [] };
}
