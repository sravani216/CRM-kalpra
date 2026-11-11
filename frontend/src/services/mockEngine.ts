import {
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_LEADS,
  INITIAL_TASKS,
  INITIAL_FOLLOWUPS,
  INITIAL_CHECKINS,
  INITIAL_NOTIFICATIONS,
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

  save() {
    setStored('users', this.users);
    setStored('clients', this.clients);
    setStored('leads', this.leads);
    setStored('tasks', this.tasks);
    setStored('followups', this.followups);
    setStored('checkins', this.checkins);
    setStored('notifications', this.notifications);
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
      const newLead = {
        id: 'led-' + Date.now(),
        leadId: 'LED-' + nextNum,
        clientId: data.clientId,
        assignedToId: data.assignedToId || null,
        priority: data.priority || 'MEDIUM',
        status: data.assignedToId ? 'ASSIGNED' : 'NEW_LEAD',
        requirement: data.requirement,
        dealValue: Number(data.dealValue) || 0,
        source: data.source || 'Website',
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

  return { success: true, message: 'OK', data: [] };
}
