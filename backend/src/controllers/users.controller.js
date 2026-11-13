const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { formatUser } = require('./auth.controller');

/**
 * PATCH /api/users/profile
 * Update name, designation, phone, bio, and preferences JSON
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, designation, phone, bio, preferences } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (designation !== undefined) updateData.designation = designation;
  if (phone !== undefined) updateData.phone = phone;
  if (bio !== undefined) updateData.bio = bio;
  if (preferences !== undefined) {
    // Merge existing preferences with incoming updates
    const currentPreferences =
      typeof req.user.preferences === 'object' && req.user.preferences !== null
        ? req.user.preferences
        : {};
    updateData.preferences = { ...currentPreferences, ...preferences };
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: updateData,
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    user: formatUser(updatedUser),
  });
});

/**
 * POST /api/users/profile/avatar
 * Upload and save Instagram-style profile avatar
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No avatar image file uploaded.', 400);
  }

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: { avatarUrl },
  });

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded and updated successfully.',
    avatarUrl,
    user: formatUser(updatedUser),
  });
});

/**
 * PATCH /api/users/password
 * Verify currentPassword and securely hash & save newPassword
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Current password does not match.', 400);
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: req.user.id },
    data: { passwordHash: newHash },
  });

  res.status(200).json({
    success: true,
    message: 'Password updated successfully.',
  });
});

/**
 * GET /api/users/team
 * List all marketing employees with summary counts of assigned tasks, follow-ups, leads, and deals closed.
 * Accessible to Marketing Head and CEO.
 */
const getTeam = asyncHandler(async (req, res) => {
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      designation: true,
      phone: true,
      avatarUrl: true,
      bio: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          assignedLeads: true,
          assignedTasks: true,
        },
      },
      assignedTasks: {
        where: { type: 'FOLLOW_UP' },
        select: { id: true },
      },
      deals: {
        where: { status: 'CLOSED_WON' },
        select: { id: true, dealValue: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate detailed summary statistics per employee
  const team = employees.map((emp) => {
    const totalWonRevenue = emp.deals.reduce(
      (sum, d) => sum + Number(d.dealValue || 0),
      0
    );

    return {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      role: emp.role,
      designation: emp.designation,
      phone: emp.phone,
      avatarUrl: emp.avatarUrl,
      bio: emp.bio,
      isActive: emp.isActive,
      createdAt: emp.createdAt,
      stats: {
        leadsCount: emp._count.assignedLeads,
        tasksCount: emp._count.assignedTasks,
        followUpsCount: emp.assignedTasks.length,
        dealsClosedCount: emp.deals.length,
        totalWonRevenue,
      },
    };
  });

  res.status(200).json({
    success: true,
    count: team.length,
    team,
  });
});

/**
 * POST /api/users/team
 * Create a new EMPLOYEE account (+ Add Member from Team Management screen).
 * Marketing Head only.
 */
const createTeamMember = asyncHandler(async (req, res) => {
  const { name, email, password, designation, phone, bio } = req.body;

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existing) {
    throw new AppError('An account with this email address already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'EMPLOYEE',
      designation: designation || 'Marketing Associate',
      phone: phone || null,
      bio: bio || null,
      preferences: {
        theme: 'light',
        accentColor: '#2563eb',
        compactView: false,
        notifications: true,
      },
      isActive: true,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Marketing team member created successfully.',
    user: formatUser(newUser),
  });
});

/**
 * PATCH /api/users/:id/status
 * Toggle employee active status
 * Marketing Head only.
 */
const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const targetUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!targetUser) {
    throw new AppError('User not found.', 404);
  }

  // Prevent modifying CEO
  if (targetUser.role === 'CEO') {
    throw new AppError('Cannot modify status of CEO account.', 403);
  }

  const newStatus = typeof isActive === 'boolean' ? isActive : !targetUser.isActive;

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: newStatus },
  });

  res.status(200).json({
    success: true,
    message: `User account has been ${newStatus ? 'activated' : 'deactivated'}.`,
    user: formatUser(updated),
  });
});

module.exports = {
  updateProfile,
  uploadAvatar,
  changePassword,
  getTeam,
  createTeamMember,
  toggleUserStatus,
};

