import { PrismaClient, Role, LeadPriority, LeadStatus, TaskPriority, TaskStatus, FollowUpStatus, ActivityType, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5433/crm?schema=public'
    }
  }
});

async function main() {
  console.log('[Seed] Seeding database...');

  // Clean existing tables in reverse dependency order
  await prisma.fieldCheckin.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.taskUpdate.deleteMany();
  await prisma.task.deleteMany();
  await prisma.leadActivity.deleteMany();
  await prisma.leadAssignment.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const ceo = await prisma.user.create({
    data: {
      name: 'Rajesh Varma',
      email: 'ceo@kalpracrm.com',
      password: passwordHash,
      role: Role.CEO,
      phone: '+91 98765 43210',
      designation: 'Chief Executive Officer',
      department: 'Executive Management',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    }
  });

  const adminSrija = await prisma.user.create({
    data: {
      name: 'Srija Mam',
      email: 'admin.srija@kalpracrm.com',
      password: passwordHash,
      role: Role.ADMIN,
      phone: '+91 98765 11223',
      designation: 'Head of Client Acquisition',
      department: 'Lead Generation & Admin',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    }
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Arvind Kumar',
      email: 'manager@kalpracrm.com',
      password: passwordHash,
      role: Role.MANAGER,
      phone: '+91 98765 33445',
      designation: 'Sales & Marketing Manager',
      department: 'Sales Strategy',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    }
  });

  const shivani = await prisma.user.create({
    data: {
      name: 'Shivani Reddy',
      email: 'shivani@kalpracrm.com',
      password: passwordHash,
      role: Role.EMPLOYEE,
      phone: '+91 98765 55667',
      designation: 'Marketing & Sales Executive',
      department: 'Marketing & Sales',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    }
  });

  const uday = await prisma.user.create({
    data: {
      name: 'Uday Kiran',
      email: 'uday@kalpracrm.com',
      password: passwordHash,
      role: Role.EMPLOYEE,
      phone: '+91 98765 77889',
      designation: 'Senior Sales Specialist',
      department: 'Marketing & Sales',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    }
  });

  console.log('[Seed] Users created: CEO, Admin Srija Mam, Manager Arvind, Employees Shivani and Uday.');

  // 2. Create Clients
  const client1 = await prisma.client.create({
    data: {
      clientId: 'CLT-1001',
      name: 'Apex Global Logistics Pvt Ltd',
      organization: 'Apex Logistics Group',
      contactPerson: 'Vikram Malhotra',
      phone: '+91 91234 56781',
      email: 'v.malhotra@apexlogistics.in',
      location: 'Hyderabad, Telangana',
      industry: 'Logistics & Supply Chain',
      requirement: 'End-to-end Fleet tracking CRM and customer portal.',
      source: 'Cold Call',
      notes: 'High potential enterprise account with 200+ fleet vehicles.',
      createdById: adminSrija.id,
    }
  });

  const client2 = await prisma.client.create({
    data: {
      clientId: 'CLT-1002',
      name: 'Zenith Healthtech Solutions',
      organization: 'Zenith Group',
      contactPerson: 'Dr. Ananya Sen',
      phone: '+91 91234 56782',
      email: 'ananya.sen@zenithhealth.org',
      location: 'Bengaluru, Karnataka',
      industry: 'Healthcare & Biotech',
      requirement: 'Tele-consultation booking CRM and patient notification system.',
      source: 'Website',
      notes: 'Ready for quick rollout across 12 clinics.',
      createdById: adminSrija.id,
    }
  });

  const client3 = await prisma.client.create({
    data: {
      clientId: 'CLT-1003',
      name: 'Nexus Financial Advisory Services',
      organization: 'Nexus FinServ Corp',
      contactPerson: 'Rohan Mehra',
      phone: '+91 91234 56783',
      email: 'rohan.mehra@nexusfinserv.com',
      location: 'Mumbai, Maharashtra',
      industry: 'Financial Services & Wealth Management',
      requirement: 'High net-worth client relationship management system.',
      source: 'Referral',
      notes: 'Referred by board member. Strict data compliance required.',
      createdById: adminSrija.id,
    }
  });

  const client4 = await prisma.client.create({
    data: {
      clientId: 'CLT-1004',
      name: 'BlueHorizon Retailers',
      organization: 'BlueHorizon Brands',
      contactPerson: 'Pooja Agarwal',
      phone: '+91 91234 56784',
      email: 'pooja.a@bluehorizonretail.com',
      location: 'New Delhi, Delhi NCR',
      industry: 'Retail & eCommerce',
      requirement: 'Multi-store customer loyalty & omnichannel marketing CRM.',
      source: 'Exhibition',
      notes: 'Met at India Retail Expo 2026. Needs proposal by month-end.',
      createdById: adminSrija.id,
    }
  });

  const client5 = await prisma.client.create({
    data: {
      clientId: 'CLT-1005',
      name: 'TechNova Cloud Technologies',
      organization: 'TechNova Global',
      contactPerson: 'Karthik Raja',
      phone: '+91 91234 56785',
      email: 'karthik.raja@technovacloud.io',
      location: 'Chennai, Tamil Nadu',
      industry: 'Information Technology',
      requirement: 'Partner lead tracking and sales pipeline forecasting module.',
      source: 'Social Media',
      notes: 'Tech savvy client looking for modern UI and API integrations.',
      createdById: adminSrija.id,
    }
  });

  const client6 = await prisma.client.create({
    data: {
      clientId: 'CLT-1006',
      name: 'GreenAgro Agrochem',
      organization: 'GreenAgro Industries',
      contactPerson: 'Suresh Patil',
      phone: '+91 91234 56786',
      email: 'suresh@greenagrochem.com',
      location: 'Pune, Maharashtra',
      industry: 'Agriculture & Manufacturing',
      requirement: 'Rural dealer lead management and field officer tracking.',
      source: 'Cold Call',
      notes: 'Wants GPS field photo check-in for 40 field reps.',
      createdById: adminSrija.id,
    }
  });

  console.log('[Seed] 6 Clients created.');

  // 3. Create Leads across Pipeline Stages
  // Lead 1: Won (Apex) - Assigned to Shivani
  const lead1 = await prisma.lead.create({
    data: {
      leadId: 'LEAD-1001',
      clientId: client1.id,
      title: 'Fleet CRM Enterprise Suite',
      source: 'Cold Call',
      priority: LeadPriority.HIGH,
      status: LeadStatus.WON,
      requirement: 'Fleet management and enterprise dispatch tracking license for 200 seats.',
      expectedValue: 1250000,
      assignedToId: shivani.id,
      createdById: adminSrija.id,
      hasContacted: true,
      contactedAt: new Date(Date.now() - 20 * 86400000),
    }
  });

  // Create Deal for Won Lead
  await prisma.deal.create({
    data: {
      dealId: 'DEL-1001',
      leadId: lead1.id,
      clientId: client1.id,
      title: 'Apex Logistics Annual Enterprise Contract',
      amount: 1250000,
      currency: 'INR',
      stage: 'Won',
      closeDate: new Date(Date.now() - 2 * 86400000),
      closedById: shivani.id,
      wonReason: 'Superior mobile tracking feature and competitive annual SaaS pricing.',
    }
  });

  // Lead 2: Proposal Sent (Zenith) - Assigned to Uday
  const lead2 = await prisma.lead.create({
    data: {
      leadId: 'LEAD-1002',
      clientId: client2.id,
      title: 'Clinic Tele-consultation CRM',
      source: 'Website',
      priority: LeadPriority.URGENT,
      status: LeadStatus.PROPOSAL_SENT,
      requirement: 'Appointment scheduling and automated SMS/WhatsApp alerts for 12 clinics.',
      expectedValue: 750000,
      assignedToId: uday.id,
      createdById: adminSrija.id,
      hasContacted: true,
      contactedAt: new Date(Date.now() - 10 * 86400000),
      nextFollowUpDate: new Date(Date.now() + 1 * 86400000), // Tomorrow
    }
  });

  // Lead 3: Negotiation (Nexus FinServ) - Assigned to Shivani
  const lead3 = await prisma.lead.create({
    data: {
      leadId: 'LEAD-1003',
      clientId: client3.id,
      title: 'HNI Wealth Portfolio Management CRM',
      source: 'Referral',
      priority: LeadPriority.HIGH,
      status: LeadStatus.NEGOTIATION,
      requirement: 'Bespoke CRM with strict audit logging, document vault, and encrypted notes.',
      expectedValue: 1850000,
      assignedToId: shivani.id,
      createdById: adminSrija.id,
      hasContacted: true,
      contactedAt: new Date(Date.now() - 14 * 86400000),
      nextFollowUpDate: new Date(Date.now() + 2 * 86400000),
    }
  });

  // Lead 4: Demo Scheduled (BlueHorizon) - Assigned to Uday
  const lead4 = await prisma.lead.create({
    data: {
      leadId: 'LEAD-1004',
      clientId: client4.id,
      title: 'Omnichannel Retail Marketing Hub',
      source: 'Exhibition',
      priority: LeadPriority.MEDIUM,
      status: LeadStatus.DEMO_SCHEDULED,
      requirement: 'Cross-store loyalty points synchronization and segmented marketing campaigns.',
      expectedValue: 920000,
      assignedToId: uday.id,
      createdById: adminSrija.id,
      hasContacted: true,
      contactedAt: new Date(Date.now() - 5 * 86400000),
      nextFollowUpDate: new Date(Date.now() + 1 * 86400000),
    }
  });

  // Lead 5: Contacted / Interested (TechNova) - Assigned to Shivani
  const lead5 = await prisma.lead.create({
    data: {
      leadId: 'LEAD-1005',
      clientId: client5.id,
      title: 'Partner Sales Forecasting Engine',
      source: 'Social Media',
      priority: LeadPriority.MEDIUM,
      status: LeadStatus.INTERESTED,
      requirement: 'Channel partner pipeline sharing and commission calculation portal.',
      expectedValue: 640000,
      assignedToId: shivani.id,
      createdById: adminSrija.id,
      hasContacted: true,
      contactedAt: new Date(Date.now() - 3 * 86400000),
      nextFollowUpDate: new Date(Date.now() + 3 * 86400000),
    }
  });

  // Lead 6: New Lead / Unassigned (GreenAgro)
  const lead6 = await prisma.lead.create({
    data: {
      leadId: 'LEAD-1006',
      clientId: client6.id,
      title: 'Field Rep GPS Attendance & CRM',
      source: 'Cold Call',
      priority: LeadPriority.HIGH,
      status: LeadStatus.NEW,
      requirement: '40 field executives check-in, photo upload, dealer visiting schedule.',
      expectedValue: 1100000,
      assignedToId: null, // Unassigned! Srija or Manager can assign
      createdById: adminSrija.id,
      hasContacted: false,
    }
  });

  // Lead 7: Lost Lead
  const lead7 = await prisma.lead.create({
    data: {
      leadId: 'LEAD-1007',
      clientId: client2.id,
      title: 'Legacy Hospital Server Migration',
      source: 'Website',
      priority: LeadPriority.LOW,
      status: LeadStatus.LOST,
      requirement: 'On-premise hardware maintenance and older server virtualization.',
      expectedValue: 350000,
      assignedToId: uday.id,
      createdById: adminSrija.id,
      hasContacted: true,
      contactedAt: new Date(Date.now() - 30 * 86400000),
      lostReason: 'Client decided to defer hardware upgrade to Q4 due to internal budget constraints.',
    }
  });

  console.log('[Seed] 7 Leads created across stages.');

  // 4. Create Lead Assignments history
  await prisma.leadAssignment.create({
    data: {
      leadId: lead1.id,
      assignedToId: shivani.id,
      assignedById: adminSrija.id,
      notes: 'Initial assignment to Shivani for logistics sector expertise.',
    }
  });

  await prisma.leadAssignment.create({
    data: {
      leadId: lead2.id,
      assignedToId: uday.id,
      assignedById: adminSrija.id,
      notes: 'Assigned to Uday for healthcare tech solutions.',
    }
  });

  await prisma.leadAssignment.create({
    data: {
      leadId: lead3.id,
      assignedToId: shivani.id,
      assignedById: manager.id,
      notes: 'Manager Arvind assigned Shivani for HNI wealth advisory.',
    }
  });

  // 5. Create Lead Activities
  await prisma.leadActivity.create({
    data: {
      leadId: lead1.id,
      userId: shivani.id,
      type: ActivityType.CALL,
      title: 'Introductory Discovery Call',
      description: 'Discussed Vikram Malhotra requirements for 200 vehicle dispatch team.',
      durationMinutes: 35,
      outcome: 'Interested in seeing customized pricing structure.',
    }
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead1.id,
      userId: shivani.id,
      type: ActivityType.STATUS_CHANGE,
      title: 'Deal Won & Contract Signed',
      previousStatus: 'NEGOTIATION',
      newStatus: 'WON',
      remarks: 'Signed annual SaaS contract of INR 1,250,000.',
    }
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead2.id,
      userId: uday.id,
      type: ActivityType.PROPOSAL,
      title: 'Sent Proposal V2 with Multi-clinic Discount',
      description: 'Shared 15% bundled discount proposal for 12 clinics.',
      outcome: 'Awaiting board review on Friday.',
    }
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead3.id,
      userId: shivani.id,
      type: ActivityType.MEETING,
      title: 'Executive Security Review Meeting',
      description: 'Presented data privacy whitepaper to Rohan Mehra and IT director.',
      durationMinutes: 50,
      outcome: 'Cleared IT compliance; proceeding to commercial negotiation.',
    }
  });

  // 6. Create Tasks
  // Task 1: Overdue Task (alert on dashboard)
  const task1 = await prisma.task.create({
    data: {
      taskId: 'TSK-1001',
      title: 'Send customized SLA draft to Nexus FinServ',
      description: 'Draft the 99.9% uptime SLA document requested by legal counsel of Nexus.',
      priority: TaskPriority.HIGH,
      status: TaskStatus.OVERDUE,
      assignedToId: shivani.id,
      assignedById: manager.id,
      clientId: client3.id,
      leadId: lead3.id,
      startDate: new Date(Date.now() - 4 * 86400000),
      dueDate: new Date(Date.now() - 1 * 86400000), // Overdue by 1 day
    }
  });

  // Task 2: Pending Review (Submitted by Shivani, awaiting Manager approval)
  const task2 = await prisma.task.create({
    data: {
      taskId: 'TSK-1002',
      title: 'Prepare Apex Logistics onboarding checklist',
      description: 'Create step-by-step rollout plan and milestone document for Apex engineering team.',
      priority: TaskPriority.HIGH,
      status: TaskStatus.PENDING_REVIEW,
      assignedToId: shivani.id,
      assignedById: manager.id,
      clientId: client1.id,
      leadId: lead1.id,
      dueDate: new Date(Date.now() + 2 * 86400000),
      completionEvidence: 'Completed comprehensive onboarding document covering API credentials, webhooks, and training timetable.',
      evidenceAttachment: '/uploads/sample-onboarding-plan.pdf',
    }
  });

  await prisma.taskUpdate.create({
    data: {
      taskId: task2.id,
      userId: shivani.id,
      action: 'SUBMITTED_FOR_REVIEW',
      remarks: 'Completed all 6 sections of the onboarding blueprint. Ready for manager Arvind approval.',
    }
  });

  // Task 3: In Progress (Uday)
  await prisma.task.create({
    data: {
      taskId: 'TSK-1003',
      title: 'Conduct Live Product Walkthrough with BlueHorizon team',
      description: 'Demonstrate the customer loyalty points engine and automated promotional triggers.',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.IN_PROGRESS,
      assignedToId: uday.id,
      assignedById: manager.id,
      clientId: client4.id,
      leadId: lead4.id,
      dueDate: new Date(Date.now() + 1 * 86400000),
    }
  });

  // Task 4: Completed & Approved (Uday)
  const task4 = await prisma.task.create({
    data: {
      taskId: 'TSK-1004',
      title: 'Send Zenith Healthtech revised quotation',
      description: 'Revise pricing with the 12-clinic volume discount as discussed.',
      priority: TaskPriority.URGENT,
      status: TaskStatus.COMPLETED,
      assignedToId: uday.id,
      assignedById: manager.id,
      clientId: client2.id,
      leadId: lead2.id,
      dueDate: new Date(Date.now() - 2 * 86400000),
      completedAt: new Date(Date.now() - 1 * 86400000),
      completionEvidence: 'Sent revised PDF quotation to Dr. Ananya Sen via email.',
      managerReviewRemarks: 'Approved. Looks very thorough and well-structured.',
      reviewedById: manager.id,
      reviewedAt: new Date(Date.now() - 1 * 86400000),
    }
  });

  await prisma.taskUpdate.create({
    data: {
      taskId: task4.id,
      userId: manager.id,
      action: 'APPROVED',
      remarks: 'Quotation verified and approved for transmission.',
    }
  });

  // 7. Follow-ups (Due Today, Upcoming, Overdue)
  // Due Today Follow-up for Shivani
  await prisma.followUp.create({
    data: {
      followupId: 'FOL-1001',
      leadId: lead3.id,
      clientId: client3.id,
      userId: shivani.id,
      scheduledDate: new Date(), // Today!
      status: FollowUpStatus.SCHEDULED,
      type: 'Call',
      discussionNotes: 'Call Rohan Mehra regarding final contract signing date.',
    }
  });

  // Upcoming Follow-up for Uday
  await prisma.followUp.create({
    data: {
      followupId: 'FOL-1002',
      leadId: lead2.id,
      clientId: client2.id,
      userId: uday.id,
      scheduledDate: new Date(Date.now() + 1 * 86400000), // Tomorrow
      status: FollowUpStatus.SCHEDULED,
      type: 'Video Conference',
      discussionNotes: 'Follow up with Dr. Ananya Sen regarding clinic board evaluation of proposal.',
    }
  });

  // Overdue Follow-up for Uday
  await prisma.followUp.create({
    data: {
      followupId: 'FOL-1003',
      leadId: lead4.id,
      clientId: client4.id,
      userId: uday.id,
      scheduledDate: new Date(Date.now() - 2 * 86400000), // 2 days ago (Overdue)
      status: FollowUpStatus.MISSED,
      type: 'Meeting',
      discussionNotes: 'Schedule preparation call with IT director of BlueHorizon.',
    }
  });

  // Completed Follow-up
  await prisma.followUp.create({
    data: {
      followupId: 'FOL-1004',
      leadId: lead1.id,
      clientId: client1.id,
      userId: shivani.id,
      scheduledDate: new Date(Date.now() - 3 * 86400000),
      status: FollowUpStatus.COMPLETED,
      type: 'Meeting',
      callOutcome: 'Positive',
      clientResponse: 'Agreed to commercial terms without further changes.',
      discussionNotes: 'Met with Vikram Malhotra at Hyderabad corporate office.',
      completedAt: new Date(Date.now() - 3 * 86400000),
    }
  });

  // 8. Field Check-in / Employee Tracking Records
  await prisma.fieldCheckin.create({
    data: {
      userId: shivani.id,
      clientId: client1.id,
      leadId: lead1.id,
      locationName: 'Apex Logistics HQ, Madhapur, Hyderabad',
      address: 'Plot 42, HITEC City, Madhapur, Hyderabad 500081',
      latitude: 17.4485,
      longitude: 78.3752,
      photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
      notes: 'On-site contract signing meeting with Vikram Malhotra.',
      checkinTime: new Date(Date.now() - 2 * 86400000),
    }
  });

  await prisma.fieldCheckin.create({
    data: {
      userId: uday.id,
      clientId: client4.id,
      leadId: lead4.id,
      locationName: 'BlueHorizon Retail flagship store, Saket, Delhi',
      address: 'Select Citywalk Mall, Saket, New Delhi 110017',
      latitude: 28.5283,
      longitude: 77.2185,
      photoUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80',
      notes: 'Inspected store POS hardware setup for loyalty CRM integration.',
      checkinTime: new Date(Date.now() - 1 * 86400000),
    }
  });

  // 9. Notifications
  await prisma.notification.create({
    data: {
      userId: ceo.id,
      title: 'Milestone Won: INR 1,250,000 Deal Closed',
      message: 'Shivani Reddy closed the annual contract with Apex Global Logistics!',
      type: NotificationType.STATUS_CHANGE,
      link: '/pipeline',
    }
  });

  await prisma.notification.create({
    data: {
      userId: manager.id,
      title: 'Task Submitted for Review',
      message: 'Shivani Reddy submitted evidence for TSK-1002 (Apex onboarding checklist).',
      type: NotificationType.TASK_REVIEW,
      link: '/tasks',
    }
  });

  await prisma.notification.create({
    data: {
      userId: shivani.id,
      title: 'Follow-up Due Today',
      message: 'You have a scheduled call with Rohan Mehra (Nexus FinServ) today.',
      type: NotificationType.FOLLOWUP_UPCOMING,
      link: '/followups',
    }
  });

  await prisma.notification.create({
    data: {
      userId: uday.id,
      title: 'Task Approved by Manager',
      message: 'Manager Arvind approved task TSK-1004 (Zenith Healthtech quotation).',
      type: NotificationType.TASK_APPROVED,
      link: '/tasks',
    }
  });

  // 10. Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: adminSrija.id,
      userEmail: adminSrija.email,
      action: 'CLIENT_CREATED',
      entityType: 'CLIENT',
      entityId: client1.id,
      details: JSON.stringify({ name: client1.name, clientId: client1.clientId }),
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: adminSrija.id,
      userEmail: adminSrija.email,
      action: 'LEAD_ASSIGNED',
      entityType: 'LEAD',
      entityId: lead1.id,
      details: JSON.stringify({ leadId: lead1.leadId, assignedTo: 'Shivani Reddy' }),
    }
  });

  console.log('[Seed] Database successfully populated with real production-grade data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
