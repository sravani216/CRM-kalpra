const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'crm-kalpra-super-secret-jwt-key-change-in-production';

/**
 * Format user object for safe public / client response
 */
const formatUser = (user) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    throw new AppError('Invalid email or password credentials.', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password credentials.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact administrator.', 403);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(200).json({
    success: true,
    message: 'Authentication successful.',
    token,
    user: formatUser(user),
  });
});

/**
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: formatUser(req.user),
  });
});

/**
 * POST /api/auth/change-password (alias for compatibility)
 */
const changePasswordAlias = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Current password is incorrect.', 400);
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: req.user.id },
    data: { passwordHash: newHash },
  });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully.',
  });
});

module.exports = {
  login,
  getMe,
  changePasswordAlias,
  formatUser,
};

