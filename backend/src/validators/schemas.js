const { z } = require('zod');

// Middleware generator for Zod schemas
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------------------------
// AUTH & USERS SCHEMAS
// ------------------------------------------------------------------------------

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  designation: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark', 'system']).optional(),
      accentColor: z.string().optional(),
      compactView: z.boolean().optional(),
      notifications: z.boolean().optional(),
    })
    .passthrough()
    .optional(),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});

const createTeamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  designation: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

// ------------------------------------------------------------------------------
// LEADS & NOTES SCHEMAS
// ------------------------------------------------------------------------------

const leadStatusEnum = z.enum([
  'NEW',
  'APPROACHED',
  'FOLLOW_UP',
  'MEETING_SCHEDULED',
  'CONVERTED',
  'LOST',
]);

const createLeadSchema = z.object({
  name: z.string().min(1, 'Lead contact person name is required'),
  companyName: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  area: z.string().min(1, 'Area is required for regional mapping'),
  contact: z.string().min(1, 'Contact number or email is required'),
  approachType: z.string().min(1, 'Approach type is required (e.g. Call, Visit, LinkedIn)'),
  status: leadStatusEnum.default('NEW').optional(),
  assignedToId: z.string().uuid('Invalid user UUID').optional(),
});

const updateLeadSchema = z.object({
  name: z.string().min(1).optional(),
  companyName: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  area: z.string().min(1).optional(),
  contact: z.string().min(1).optional(),
  approachType: z.string().min(1).optional(),
  status: leadStatusEnum.optional(),
  assignedToId: z.string().uuid().optional(),
});

const createLeadNoteSchema = z.object({
  content: z.string().min(1, 'Note content cannot be empty'),
});

// ------------------------------------------------------------------------------
// TASKS & SCHEDULES SCHEMAS
// ------------------------------------------------------------------------------

const taskTypeEnum = z.enum(['CLIENT_MEETING', 'FOLLOW_UP', 'REPORT', 'GENERAL']);
const taskStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'MISSED']);

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  type: taskTypeEnum.default('GENERAL'),
  companyName: z.string().optional().nullable(),
  personName: z.string().optional().nullable(),
  personDesignation: z.string().optional().nullable(),
  contact: z.string().optional().nullable(),
  scheduledDate: z.string().or(z.date()).transform((val) => new Date(val)),
  leadId: z.string().uuid().optional().nullable(),
  assignedToId: z.string().uuid().optional(),
  reportSummary: z.string().optional().nullable(),
});

const stopTaskSchema = z.object({
  status: taskStatusEnum.optional(),
  reportSummary: z.string().optional(),
});

// ------------------------------------------------------------------------------
// DEALS SCHEMAS
// ------------------------------------------------------------------------------

const dealStatusEnum = z.enum(['PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']);

const updateDealSchema = z.object({
  dealValue: z.number().or(z.string().transform(Number)).optional(),
  status: dealStatusEnum.optional(),
  nextFollowUpDate: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val ? new Date(val) : null)),
});

// ------------------------------------------------------------------------------
// PERSONAL STICKY NOTES SCHEMAS
// ------------------------------------------------------------------------------

const createPersonalNoteSchema = z.object({
  title: z.string().optional().nullable(),
  content: z.string().min(1, 'Note content cannot be empty'),
  pinned: z.boolean().default(false).optional(),
  color: z.enum(['yellow', 'purple', 'green', 'blue', 'rose', 'amber']).default('yellow').optional(),
});

const updatePersonalNoteSchema = z.object({
  title: z.string().optional().nullable(),
  content: z.string().min(1).optional(),
  pinned: z.boolean().optional(),
  color: z.enum(['yellow', 'purple', 'green', 'blue', 'rose', 'amber']).optional(),
});

module.exports = {
  validate,
  loginSchema,
  profileUpdateSchema,
  passwordChangeSchema,
  createTeamMemberSchema,
  createLeadSchema,
  updateLeadSchema,
  createLeadNoteSchema,
  createTaskSchema,
  stopTaskSchema,
  updateDealSchema,
  createPersonalNoteSchema,
  updatePersonalNoteSchema,
};

