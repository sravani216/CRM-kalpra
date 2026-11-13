const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { AppError } = require('./errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'crm-kalpra-super-secret-jwt-key-change-in-production';

/**
 * Verify JWT token and attach authenticated user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // If user is already authenticated higher up in the middleware chain, proceed
    if (req.user) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No Bearer token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Authentication token has expired. Please log in again.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact administrator.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-Based Access Control (RBAC) Guard
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: Insufficient permissions for this action.',
      });
    }

    next();
  };
};

/**
 * CEO Read-Only Enforcement Middleware
 * If user has CEO role and attempts any mutation (POST, PUT, PATCH, DELETE),
 * immediately block and return 403 Forbidden with exact required message:
 * { message: "CEO account has read-only access." }
 */
const blockCeoMutations = (req, res, next) => {
  if (req.user && req.user.role === 'CEO' && req.method !== 'GET') {
    // Exempt login and change-password endpoints
    const exemptPaths = [
      '/api/auth/login',
      '/api/auth/change-password',
      '/api/users/password',
    ];

    const isExempt = exemptPaths.some((p) => req.originalUrl.startsWith(p));
    if (!isExempt) {
      return res.status(403).json({
        success: false,
        message: 'CEO account has read-only access.',
      });
    }
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
  blockCeoMutations,
};
