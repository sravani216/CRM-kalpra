const { ZodError } = require('zod');

class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async wrapper to catch unhandled promise rejections
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Centralized error handler & Prisma / Zod / JWT / Multer error translator
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // Handle Prisma Known Request Errors
  if (err.code) {
    switch (err.code) {
      case 'P2002': {
        statusCode = 409;
        const target = Array.isArray(err.meta?.target)
          ? err.meta.target.join(', ')
          : err.meta?.target || 'field';
        message = `A record with this ${target} already exists.`;
        break;
      }
      case 'P2025': {
        statusCode = 404;
        message = err.meta?.cause || 'Requested record was not found.';
        break;
      }
      case 'P2003': {
        statusCode = 400;
        message = 'Invalid reference: Related record does not exist.';
        break;
      }
      default:
        if (err.code.startsWith('P')) {
          statusCode = 400;
          message = `Database query error (${err.code}).`;
        }
        break;
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired. Please log in again.';
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds maximum allowed limit (10MB).';
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  // Log 500 errors in development
  if (statusCode === 500) {
    console.error('💥 Unhandled Server Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};

module.exports = {
  AppError,
  asyncHandler,
  errorHandler,
};

