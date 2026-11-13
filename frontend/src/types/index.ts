export type Role = 'CEO' | 'MARKETING_HEAD' | 'EMPLOYEE';

export type LeadStatus =
  | 'NEW'
  | 'APPROACHED'
  | 'FOLLOW_UP'
  | 'MEETING_SCHEDULED'
  | 'CONVERTED'
  | 'LOST';

export type TaskType = 'CLIENT_MEETING' | 'FOLLOW_UP' | 'REPORT' | 'GENERAL';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';

export type DealStatus = 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  accentColor?: string;
  compactView?: boolean;
  notifications?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  designation?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  preferences?: UserPreferences;
  isActive: boolean;
  createdAt?: string;
}

export interface LeadNote {
  id: string;
  leadId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  author?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    role?: Role;
  };
}

export interface Deal {
  id: string;
  leadId: string;
  ownerId: string;
  dealValue: number | string;
  status: DealStatus;
  nextFollowUpDate?: string | null;
  closedAt?: string | null;
  createdAt?: string;
  lead?: {
    id: string;
    name: string;
    companyName?: string | null;
    area: string;
    contact: string;
    status: LeadStatus;
  };
  owner?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
}

export interface Lead {
  id: string;
  name: string;
  companyName?: string | null;
  designation?: string | null;
  area: string;
  contact: string;
  approachType: string;
  status: LeadStatus;
  createdById: string;
  assignedToId: string;
  createdAt: string;
  updatedAt?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    role?: Role;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  deal?: Deal | null;
  notes?: LeadNote[];
  _count?: {
    notes: number;
    tasks: number;
  };
}

export interface TaskSchedule {
  id: string;
  title: string;
  type: TaskType;
  companyName?: string | null;
  personName?: string | null;
  personDesignation?: string | null;
  contact?: string | null;
  scheduledDate: string;
  startTime?: string | null;
  endTime?: string | null;
  durationMinutes: number;
  status: TaskStatus;
  photoUrl?: string | null;
  reportUrl?: string | null;
  reportSummary?: string | null;
  assignedToId: string;
  assignedById: string;
  leadId?: string | null;
  createdAt?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  assignedBy?: {
    id: string;
    name: string;
    email: string;
  };
  lead?: Lead | null;
}

export interface PersonalNote {
  id: string;
  userId: string;
  title?: string | null;
  content: string;
  pinned: boolean;
  color?: 'yellow' | 'purple' | 'green' | 'blue' | 'rose' | 'amber';
  createdAt: string;
  updatedAt?: string;
}

export interface EmployeeAnalytics {
  employee: User;
  stats: {
    totalLeads: number;
    totalApproached: number;
    convertedLeads: number;
    conversionRate: number;
    meetingsCompleted: number;
    totalMeetingDurationMinutes: number;
    totalHoursInMeetings: number;
    reportsSubmitted: number;
    dealsWonCount: number;
    totalRevenue: number;
    pipelineValue: number;
  };
  wonDeals: Deal[];
  activityTrend: {
    date: string;
    day: string;
    meetingsCount: number;
    reportsCount: number;
    leadsAdded: number;
    minutesLogged: number;
  }[];
}

export interface ExecutiveAnalytics {
  overview: {
    totalClients: number;
    totalLeads: number;
    totalApproached: number;
    totalMeetings: number;
    totalRevenue: number;
    overallConversionRate: number;
    monthlyTarget: number;
    targetProgressPercentage: number;
  };
  dealsByStatus: {
    status: DealStatus;
    count: number;
    value: number;
  }[];
  leadsByArea: {
    area: string;
    totalLeads: number;
    converted: number;
  }[];
  monthlyRevenueAndLeadsTrend: {
    month: string;
    leadsCount: number;
    revenue: number;
    dealsWon: number;
  }[];
  employeeLeaderboard: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    designation?: string | null;
    leadsCount: number;
    convertedCount: number;
    conversionRate: number;
    meetingsCount: number;
    totalMeetingMinutes: number;
    dealsWonCount: number;
    revenueGenerated: number;
  }[];
}

