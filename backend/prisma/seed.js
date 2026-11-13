const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Fixed deterministic UUIDs for seed records to guarantee full idempotency
const SEED_IDS = {
  users: {
    ceo: '11111111-1111-4111-8111-111111111111',
    head: '22222222-2222-4222-8222-222222222222',
    shivani: '33333333-3333-4333-8333-333333333333',
    rahul: '44444444-4444-4444-8444-444444444444',
  },
  leads: {
    acme: '55555555-5555-4555-8555-555555555551',
    nexus: '55555555-5555-4555-8555-555555555552',
    zenith: '55555555-5555-4555-8555-555555555553',
    pulse: '55555555-5555-4555-8555-555555555554',
    cloudscale: '55555555-5555-4555-8555-555555555555',
    vertex: '55555555-5555-4555-8555-555555555556',
  },
  notes: {
    note1: '66666666-6666-4666-8666-666666666661',
    note2: '66666666-6666-4666-8666-666666666662',
    note3: '66666666-6666-4666-8666-666666666663',
    note4: '66666666-6666-4666-8666-666666666664',
  },
  tasks: {
    task1: '77777777-7777-4777-8777-777777777771',
    task2: '77777777-7777-4777-8777-777777777772',
    task3: '77777777-7777-4777-8777-777777777773',
    task4: '77777777-7777-4777-8777-777777777774',
    task5: '77777777-7777-4777-8777-777777777775',
  },
  deals: {
    dealAcme: '88888888-8888-4888-8888-888888888881',
    dealCloudscale: '88888888-8888-4888-8888-888888888882',
    dealNexus: '88888888-8888-4888-8888-888888888883',
    dealZenith: '88888888-8888-4888-8888-888888888884',
  },
  personalNotes: {
    pnote1: '99999999-9999-4999-8999-999999999991',
    pnote2: '99999999-9999-4999-8999-999999999992',
    pnote3: '99999999-9999-4999-8999-999999999993',
  },
};

async function main() {
  console.log('🌱 Starting database seed for Marketing CRM...');

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // ----------------------------------------------------------------------------
  // 1. Seed Users (1 CEO, 1 MARKETING_HEAD, 2 EMPLOYEES)
  // ----------------------------------------------------------------------------
  console.log('👤 Seeding Users...');

  const ceo = await prisma.user.upsert({
    where: { email: 'ceo@company.com' },
    update: {
      name: 'Rajesh Sharma',
      role: 'CEO',
      designation: 'Chief Executive Officer',
      phone: '+91 98765 00001',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      bio: 'Executive leadership, strategic vision, and company-wide performance tracking.',
      preferences: {
        theme: 'light',
        accentColor: '#2563eb',
        compactView: false,
        notifications: true,
      },
      isActive: true,
    },
    create: {
      id: SEED_IDS.users.ceo,
      name: 'Rajesh Sharma',
      email: 'ceo@company.com',
      passwordHash,
      role: 'CEO',
      designation: 'Chief Executive Officer',
      phone: '+91 98765 00001',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      bio: 'Executive leadership, strategic vision, and company-wide performance tracking.',
      preferences: {
        theme: 'light',
        accentColor: '#2563eb',
        compactView: false,
        notifications: true,
      },
      isActive: true,
    },
  });

  const head = await prisma.user.upsert({
    where: { email: 'head@company.com' },
    update: {
      name: 'Vikram Malhotra',
      role: 'MARKETING_HEAD',
      designation: 'Head of Marketing & Sales',
      phone: '+91 98765 00002',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      bio: 'Directing marketing campaigns, team performance, lead distribution, and deals closing.',
      preferences: {
        theme: 'light',
        accentColor: '#0ea5e9',
        compactView: false,
        notifications: true,
      },
      isActive: true,
    },
    create: {
      id: SEED_IDS.users.head,
      name: 'Vikram Malhotra',
      email: 'head@company.com',
      passwordHash,
      role: 'MARKETING_HEAD',
      designation: 'Head of Marketing & Sales',
      phone: '+91 98765 00002',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      bio: 'Directing marketing campaigns, team performance, lead distribution, and deals closing.',
      preferences: {
        theme: 'light',
        accentColor: '#0ea5e9',
        compactView: false,
        notifications: true,
      },
      isActive: true,
    },
  });

  const shivani = await prisma.user.upsert({
    where: { email: 'shivani@company.com' },
    update: {
      name: 'Shivani Verma',
      role: 'EMPLOYEE',
      designation: 'Senior Marketing Executive',
      phone: '+91 98765 00003',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      bio: 'High-value enterprise conversions, client meetings, and strategic territory outreach.',
      preferences: {
        theme: 'light',
        accentColor: '#ec4899',
        compactView: true,
        notifications: true,
      },
      isActive: true,
    },
    create: {
      id: SEED_IDS.users.shivani,
      name: 'Shivani Verma',
      email: 'shivani@company.com',
      passwordHash,
      role: 'EMPLOYEE',
      designation: 'Senior Marketing Executive',
      phone: '+91 98765 00003',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      bio: 'High-value enterprise conversions, client meetings, and strategic territory outreach.',
      preferences: {
        theme: 'light',
        accentColor: '#ec4899',
        compactView: true,
        notifications: true,
      },
      isActive: true,
    },
  });

  const rahul = await prisma.user.upsert({
    where: { email: 'rahul@company.com' },
    update: {
      name: 'Rahul Nair',
      role: 'EMPLOYEE',
      designation: 'Marketing Associate',
      phone: '+91 98765 00004',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      bio: 'Territory lead generation, cold calls, product presentations, and pipeline expansion.',
      preferences: {
        theme: 'light',
        accentColor: '#10b981',
        compactView: false,
        notifications: true,
      },
      isActive: true,
    },
    create: {
      id: SEED_IDS.users.rahul,
      name: 'Rahul Nair',
      email: 'rahul@company.com',
      passwordHash,
      role: 'EMPLOYEE',
      designation: 'Marketing Associate',
      phone: '+91 98765 00004',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      bio: 'Territory lead generation, cold calls, product presentations, and pipeline expansion.',
      preferences: {
        theme: 'light',
        accentColor: '#10b981',
        compactView: false,
        notifications: true,
      },
      isActive: true,
    },
  });

  console.log(`✅ Users seeded: CEO (${ceo.name}), Marketing Head (${head.name}), Employees (${shivani.name}, ${rahul.name})`);

  // ----------------------------------------------------------------------------
  // 2. Seed Leads across multiple Areas
  // ----------------------------------------------------------------------------
  console.log('🏢 Seeding Leads...');

  const leadAcme = await prisma.lead.upsert({
    where: { id: SEED_IDS.leads.acme },
    update: {
      name: 'Ananya Roy',
      companyName: 'Acme Retail Solutions',
      designation: 'Director of Operations',
      area: 'Hitec City',
      contact: 'ananya.roy@acmeretail.com | +91 98111 22334',
      approachType: 'Visit',
      status: 'CONVERTED',
      createdById: head.id,
      assignedToId: shivani.id,
    },
    create: {
      id: SEED_IDS.leads.acme,
      name: 'Ananya Roy',
      companyName: 'Acme Retail Solutions',
      designation: 'Director of Operations',
      area: 'Hitec City',
      contact: 'ananya.roy@acmeretail.com | +91 98111 22334',
      approachType: 'Visit',
      status: 'CONVERTED',
      createdById: head.id,
      assignedToId: shivani.id,
    },
  });

  const leadNexus = await prisma.lead.upsert({
    where: { id: SEED_IDS.leads.nexus },
    update: {
      name: 'Karthik Iyer',
      companyName: 'Nexus FinTech Labs',
      designation: 'VP of Product',
      area: 'Gachibowli',
      contact: 'karthik@nexusfintech.io | +91 98222 33445',
      approachType: 'LinkedIn',
      status: 'MEETING_SCHEDULED',
      createdById: head.id,
      assignedToId: shivani.id,
    },
    create: {
      id: SEED_IDS.leads.nexus,
      name: 'Karthik Iyer',
      companyName: 'Nexus FinTech Labs',
      designation: 'VP of Product',
      area: 'Gachibowli',
      contact: 'karthik@nexusfintech.io | +91 98222 33445',
      approachType: 'LinkedIn',
      status: 'MEETING_SCHEDULED',
      createdById: head.id,
      assignedToId: shivani.id,
    },
  });

  const leadZenith = await prisma.lead.upsert({
    where: { id: SEED_IDS.leads.zenith },
    update: {
      name: 'Meera Sen',
      companyName: 'Zenith Logistics & Supply',
      designation: 'Supply Chain Head',
      area: 'Banjara Hills',
      contact: 'meera.sen@zenithlogistics.in | +91 98333 44556',
      approachType: 'Call',
      status: 'FOLLOW_UP',
      createdById: head.id,
      assignedToId: rahul.id,
    },
    create: {
      id: SEED_IDS.leads.zenith,
      name: 'Meera Sen',
      companyName: 'Zenith Logistics & Supply',
      designation: 'Supply Chain Head',
      area: 'Banjara Hills',
      contact: 'meera.sen@zenithlogistics.in | +91 98333 44556',
      approachType: 'Call',
      status: 'FOLLOW_UP',
      createdById: head.id,
      assignedToId: rahul.id,
    },
  });

  const leadPulse = await prisma.lead.upsert({
    where: { id: SEED_IDS.leads.pulse },
    update: {
      name: 'Dr. Arvind Swamy',
      companyName: 'Pulse Healthcare Systems',
      designation: 'Managing Director',
      area: 'Jubilee Hills',
      contact: 'dr.swamy@pulsehealth.org | +91 98444 55667',
      approachType: 'Visit',
      status: 'APPROACHED',
      createdById: shivani.id,
      assignedToId: shivani.id,
    },
    create: {
      id: SEED_IDS.leads.pulse,
      name: 'Dr. Arvind Swamy',
      companyName: 'Pulse Healthcare Systems',
      designation: 'Managing Director',
      area: 'Jubilee Hills',
      contact: 'dr.swamy@pulsehealth.org | +91 98444 55667',
      approachType: 'Visit',
      status: 'APPROACHED',
      createdById: shivani.id,
      assignedToId: shivani.id,
    },
  });

  const leadCloudscale = await prisma.lead.upsert({
    where: { id: SEED_IDS.leads.cloudscale },
    update: {
      name: 'Neha Kapoor',
      companyName: 'CloudScale Technologies',
      designation: 'Chief Technology Officer',
      area: 'Madhapur',
      contact: 'neha@cloudscale.tech | +91 98555 66778',
      approachType: 'Email',
      status: 'CONVERTED',
      createdById: rahul.id,
      assignedToId: rahul.id,
    },
    create: {
      id: SEED_IDS.leads.cloudscale,
      name: 'Neha Kapoor',
      companyName: 'CloudScale Technologies',
      designation: 'Chief Technology Officer',
      area: 'Madhapur',
      contact: 'neha@cloudscale.tech | +91 98555 66778',
      approachType: 'Email',
      status: 'CONVERTED',
      createdById: rahul.id,
      assignedToId: rahul.id,
    },
  });

  const leadVertex = await prisma.lead.upsert({
    where: { id: SEED_IDS.leads.vertex },
    update: {
      name: 'Suresh Patel',
      companyName: 'Vertex Infrastructure',
      designation: 'Project Director',
      area: 'Kondapur',
      contact: 'suresh.p@vertexinfra.com | +91 98666 77889',
      approachType: 'Call',
      status: 'NEW',
      createdById: head.id,
      assignedToId: rahul.id,
    },
    create: {
      id: SEED_IDS.leads.vertex,
      name: 'Suresh Patel',
      companyName: 'Vertex Infrastructure',
      designation: 'Project Director',
      area: 'Kondapur',
      contact: 'suresh.p@vertexinfra.com | +91 98666 77889',
      approachType: 'Call',
      status: 'NEW',
      createdById: head.id,
      assignedToId: rahul.id,
    },
  });

  console.log('✅ Leads seeded across Hitec City, Gachibowli, Banjara Hills, Jubilee Hills, Madhapur, Kondapur');

  // ----------------------------------------------------------------------------
  // 3. Seed LeadNotes (Threaded notes per lead)
  // ----------------------------------------------------------------------------
  console.log('📝 Seeding Lead Notes...');

  await prisma.leadNote.upsert({
    where: { id: SEED_IDS.notes.note1 },
    update: {
      content: 'Initial discovery meeting held at Acme Hitec City office. Client impressed by multi-territory tracking and analytics.',
      authorId: shivani.id,
    },
    create: {
      id: SEED_IDS.notes.note1,
      leadId: leadAcme.id,
      authorId: shivani.id,
      content: 'Initial discovery meeting held at Acme Hitec City office. Client impressed by multi-territory tracking and analytics.',
    },
  });

  await prisma.leadNote.upsert({
    where: { id: SEED_IDS.notes.note2 },
    update: {
      content: 'Sent commercial proposal tier 2 with 12 months SLA support. Awaiting CFO sign-off.',
      authorId: shivani.id,
    },
    create: {
      id: SEED_IDS.notes.note2,
      leadId: leadAcme.id,
      authorId: shivani.id,
      content: 'Sent commercial proposal tier 2 with 12 months SLA support. Awaiting CFO sign-off.',
    },
  });

  await prisma.leadNote.upsert({
    where: { id: SEED_IDS.notes.note3 },
    update: {
      content: 'Connected on LinkedIn. Karthik requested a live platform demonstration focusing on sales team tracking.',
      authorId: shivani.id,
    },
    create: {
      id: SEED_IDS.notes.note3,
      leadId: leadNexus.id,
      authorId: shivani.id,
      content: 'Connected on LinkedIn. Karthik requested a live platform demonstration focusing on sales team tracking.',
    },
  });

  await prisma.leadNote.upsert({
    where: { id: SEED_IDS.notes.note4 },
    update: {
      content: 'Cold call outreach completed. Meera is interested in route-based client meeting management.',
      authorId: rahul.id,
    },
    create: {
      id: SEED_IDS.notes.note4,
      leadId: leadZenith.id,
      authorId: rahul.id,
      content: 'Cold call outreach completed. Meera is interested in route-based client meeting management.',
    },
  });

  console.log('✅ LeadNotes seeded successfully');

  // ----------------------------------------------------------------------------
  // 4. Seed TaskSchedules (Meetings, Follow-ups, and Reports with timers & proofs)
  // ----------------------------------------------------------------------------
  console.log('⏱️ Seeding TaskSchedules...');

  await prisma.taskSchedule.upsert({
    where: { id: SEED_IDS.tasks.task1 },
    update: {
      title: 'In-person Strategy & Contract Finalization',
      type: 'CLIENT_MEETING',
      companyName: 'Acme Retail Solutions',
      personName: 'Ananya Roy',
      personDesignation: 'Director of Operations',
      contact: '+91 98111 22334',
      scheduledDate: new Date('2026-11-10T10:00:00Z'),
      startTime: new Date('2026-11-10T10:05:00Z'),
      endTime: new Date('2026-11-10T10:50:00Z'),
      durationMinutes: 45,
      status: 'COMPLETED',
      photoUrl: '/uploads/proofs/acme_meeting_photo.jpg',
      reportSummary: 'Met with Ananya at Acme HQ. Scope finalized; agreement approved and submitted to billing.',
      assignedToId: shivani.id,
      assignedById: head.id,
      leadId: leadAcme.id,
    },
    create: {
      id: SEED_IDS.tasks.task1,
      title: 'In-person Strategy & Contract Finalization',
      type: 'CLIENT_MEETING',
      companyName: 'Acme Retail Solutions',
      personName: 'Ananya Roy',
      personDesignation: 'Director of Operations',
      contact: '+91 98111 22334',
      scheduledDate: new Date('2026-11-10T10:00:00Z'),
      startTime: new Date('2026-11-10T10:05:00Z'),
      endTime: new Date('2026-11-10T10:50:00Z'),
      durationMinutes: 45,
      status: 'COMPLETED',
      photoUrl: '/uploads/proofs/acme_meeting_photo.jpg',
      reportSummary: 'Met with Ananya at Acme HQ. Scope finalized; agreement approved and submitted to billing.',
      assignedToId: shivani.id,
      assignedById: head.id,
      leadId: leadAcme.id,
    },
  });

  await prisma.taskSchedule.upsert({
    where: { id: SEED_IDS.tasks.task2 },
    update: {
      title: 'Product Architecture Walkthrough',
      type: 'CLIENT_MEETING',
      companyName: 'Nexus FinTech Labs',
      personName: 'Karthik Iyer',
      personDesignation: 'VP of Product',
      contact: '+91 98222 33445',
      scheduledDate: new Date('2026-11-14T11:00:00Z'),
      startTime: null,
      endTime: null,
      durationMinutes: 0,
      status: 'PENDING',
      photoUrl: null,
      reportSummary: null,
      assignedToId: shivani.id,
      assignedById: head.id,
      leadId: leadNexus.id,
    },
    create: {
      id: SEED_IDS.tasks.task2,
      title: 'Product Architecture Walkthrough',
      type: 'CLIENT_MEETING',
      companyName: 'Nexus FinTech Labs',
      personName: 'Karthik Iyer',
      personDesignation: 'VP of Product',
      contact: '+91 98222 33445',
      scheduledDate: new Date('2026-11-14T11:00:00Z'),
      startTime: null,
      endTime: null,
      durationMinutes: 0,
      status: 'PENDING',
      photoUrl: null,
      reportSummary: null,
      assignedToId: shivani.id,
      assignedById: head.id,
      leadId: leadNexus.id,
    },
  });

  await prisma.taskSchedule.upsert({
    where: { id: SEED_IDS.tasks.task3 },
    update: {
      title: 'Commercial Discussion Follow-up',
      type: 'FOLLOW_UP',
      companyName: 'Zenith Logistics & Supply',
      personName: 'Meera Sen',
      personDesignation: 'Supply Chain Head',
      contact: '+91 98333 44556',
      scheduledDate: new Date('2026-11-15T15:30:00Z'),
      durationMinutes: 0,
      status: 'PENDING',
      assignedToId: rahul.id,
      assignedById: head.id,
      leadId: leadZenith.id,
    },
    create: {
      id: SEED_IDS.tasks.task3,
      title: 'Commercial Discussion Follow-up',
      type: 'FOLLOW_UP',
      companyName: 'Zenith Logistics & Supply',
      personName: 'Meera Sen',
      personDesignation: 'Supply Chain Head',
      contact: '+91 98333 44556',
      scheduledDate: new Date('2026-11-15T15:30:00Z'),
      durationMinutes: 0,
      status: 'PENDING',
      assignedToId: rahul.id,
      assignedById: head.id,
      leadId: leadZenith.id,
    },
  });

  await prisma.taskSchedule.upsert({
    where: { id: SEED_IDS.tasks.task4 },
    update: {
      title: 'Daily Field Outreach & Lead Conversion Report',
      type: 'REPORT',
      scheduledDate: new Date('2026-11-12T18:00:00Z'),
      durationMinutes: 30,
      status: 'COMPLETED',
      reportUrl: '/uploads/reports/rahul_daily_report_20261112.pdf',
      reportSummary: 'Visited 4 prospects in Madhapur & Banjara Hills. Closed deal with CloudScale Technologies.',
      assignedToId: rahul.id,
      assignedById: head.id,
    },
    create: {
      id: SEED_IDS.tasks.task4,
      title: 'Daily Field Outreach & Lead Conversion Report',
      type: 'REPORT',
      scheduledDate: new Date('2026-11-12T18:00:00Z'),
      durationMinutes: 30,
      status: 'COMPLETED',
      reportUrl: '/uploads/reports/rahul_daily_report_20261112.pdf',
      reportSummary: 'Visited 4 prospects in Madhapur & Banjara Hills. Closed deal with CloudScale Technologies.',
      assignedToId: rahul.id,
      assignedById: head.id,
    },
  });

  await prisma.taskSchedule.upsert({
    where: { id: SEED_IDS.tasks.task5 },
    update: {
      title: 'Enterprise Architecture Sign-off Meeting',
      type: 'CLIENT_MEETING',
      companyName: 'CloudScale Technologies',
      personName: 'Neha Kapoor',
      personDesignation: 'Chief Technology Officer',
      contact: '+91 98555 66778',
      scheduledDate: new Date('2026-11-12T14:00:00Z'),
      startTime: new Date('2026-11-12T14:00:00Z'),
      endTime: new Date('2026-11-12T15:15:00Z'),
      durationMinutes: 75,
      status: 'COMPLETED',
      photoUrl: '/uploads/proofs/cloudscale_signoff.png',
      reportSummary: 'Presented technical specs and data compliance. Neha signed off on enterprise implementation.',
      assignedToId: rahul.id,
      assignedById: rahul.id,
      leadId: leadCloudscale.id,
    },
    create: {
      id: SEED_IDS.tasks.task5,
      title: 'Enterprise Architecture Sign-off Meeting',
      type: 'CLIENT_MEETING',
      companyName: 'CloudScale Technologies',
      personName: 'Neha Kapoor',
      personDesignation: 'Chief Technology Officer',
      contact: '+91 98555 66778',
      scheduledDate: new Date('2026-11-12T14:00:00Z'),
      startTime: new Date('2026-11-12T14:00:00Z'),
      endTime: new Date('2026-11-12T15:15:00Z'),
      durationMinutes: 75,
      status: 'COMPLETED',
      photoUrl: '/uploads/proofs/cloudscale_signoff.png',
      reportSummary: 'Presented technical specs and data compliance. Neha signed off on enterprise implementation.',
      assignedToId: rahul.id,
      assignedById: rahul.id,
      leadId: leadCloudscale.id,
    },
  });

  console.log('✅ TaskSchedules seeded with meeting timers, proof photos, and reports');

  // ----------------------------------------------------------------------------
  // 5. Seed Deals (Revenue tracking for CEO & Marketing Head)
  // ----------------------------------------------------------------------------
  console.log('💰 Seeding Deals...');

  await prisma.deal.upsert({
    where: { leadId: leadAcme.id },
    update: {
      ownerId: shivani.id,
      dealValue: 750000.00,
      status: 'CLOSED_WON',
      closedAt: new Date('2026-11-10T14:30:00Z'),
    },
    create: {
      id: SEED_IDS.deals.dealAcme,
      leadId: leadAcme.id,
      ownerId: shivani.id,
      dealValue: 750000.00,
      status: 'CLOSED_WON',
      closedAt: new Date('2026-11-10T14:30:00Z'),
    },
  });

  await prisma.deal.upsert({
    where: { leadId: leadCloudscale.id },
    update: {
      ownerId: rahul.id,
      dealValue: 1200000.00,
      status: 'CLOSED_WON',
      closedAt: new Date('2026-11-12T17:00:00Z'),
    },
    create: {
      id: SEED_IDS.deals.dealCloudscale,
      leadId: leadCloudscale.id,
      ownerId: rahul.id,
      dealValue: 1200000.00,
      status: 'CLOSED_WON',
      closedAt: new Date('2026-11-12T17:00:00Z'),
    },
  });

  await prisma.deal.upsert({
    where: { leadId: leadNexus.id },
    update: {
      ownerId: shivani.id,
      dealValue: 950000.00,
      status: 'NEGOTIATION',
      nextFollowUpDate: new Date('2026-11-16T11:00:00Z'),
    },
    create: {
      id: SEED_IDS.deals.dealNexus,
      leadId: leadNexus.id,
      ownerId: shivani.id,
      dealValue: 950000.00,
      status: 'NEGOTIATION',
      nextFollowUpDate: new Date('2026-11-16T11:00:00Z'),
    },
  });

  await prisma.deal.upsert({
    where: { leadId: leadZenith.id },
    update: {
      ownerId: rahul.id,
      dealValue: 450000.00,
      status: 'PROPOSAL',
      nextFollowUpDate: new Date('2026-11-18T15:00:00Z'),
    },
    create: {
      id: SEED_IDS.deals.dealZenith,
      leadId: leadZenith.id,
      ownerId: rahul.id,
      dealValue: 450000.00,
      status: 'PROPOSAL',
      nextFollowUpDate: new Date('2026-11-18T15:00:00Z'),
    },
  });

  console.log('✅ Deals seeded: ₹19,50,000 Won, ₹14,00,000 in Active Pipeline');

  // ----------------------------------------------------------------------------
  // 6. Seed PersonalNotes (Home Page sticky notes / scratchpad)
  // ----------------------------------------------------------------------------
  console.log('📌 Seeding Personal Notes...');

  await prisma.personalNote.upsert({
    where: { id: SEED_IDS.personalNotes.pnote1 },
    update: {
      title: 'Q4 Revenue Acceleration',
      content: 'Targeting 25% MoM conversion improvement in Hitec City & Gachibowli clusters. Focus sales meetings on high-tier enterprise SLAs.',
      pinned: true,
      color: 'yellow',
    },
    create: {
      id: SEED_IDS.personalNotes.pnote1,
      userId: ceo.id,
      title: 'Q4 Revenue Acceleration',
      content: 'Targeting 25% MoM conversion improvement in Hitec City & Gachibowli clusters. Focus sales meetings on high-tier enterprise SLAs.',
      pinned: true,
      color: 'yellow',
    },
  });

  await prisma.personalNote.upsert({
    where: { id: SEED_IDS.personalNotes.pnote2 },
    update: {
      title: 'Territory Reallocation Strategy',
      content: 'Assign Banjara Hills and Kondapur field visits to Rahul. Align Shivani on Gachibowli fintech prospects.',
      pinned: true,
      color: 'purple',
    },
    create: {
      id: SEED_IDS.personalNotes.pnote2,
      userId: head.id,
      title: 'Territory Reallocation Strategy',
      content: 'Assign Banjara Hills and Kondapur field visits to Rahul. Align Shivani on Gachibowli fintech prospects.',
      pinned: true,
      color: 'purple',
    },
  });

  await prisma.personalNote.upsert({
    where: { id: SEED_IDS.personalNotes.pnote3 },
    update: {
      title: 'Objections & FAQs for FinTech Demo',
      content: 'Be ready with data isolation architecture and custom export specs for Karthik (Nexus).',
      pinned: false,
      color: 'green',
    },
    create: {
      id: SEED_IDS.personalNotes.pnote3,
      userId: shivani.id,
      title: 'Objections & FAQs for FinTech Demo',
      content: 'Be ready with data isolation architecture and custom export specs for Karthik (Nexus).',
      pinned: false,
      color: 'green',
    },
  });

  console.log('✅ PersonalNotes seeded successfully');
  console.log('✨ Seed completed with zero errors!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

