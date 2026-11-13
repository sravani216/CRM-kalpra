const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');
const { authenticate, blockCeoMutations } = require('./middleware/auth');
const { UPLOADS_ROOT, ensureUploadDirs } = require('./middleware/upload');

// Import routes
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const leadsRoutes = require('./routes/leads.routes');
const tasksRoutes = require('./routes/tasks.routes');
const dealsRoutes = require('./routes/deals.routes');
const notesRoutes = require('./routes/notes.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();

// Ensure upload folders exist
ensureUploadDirs();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Enable Cross-Origin Resource Sharing
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// HTTP request logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads (avatars, meeting proof photos, reports)
app.use('/uploads', express.static(UPLOADS_ROOT));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Marketing CRM Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ------------------------------------------------------------------------------
// API ROUTES
// ------------------------------------------------------------------------------

// Auth routes (includes public /login and protected /me, /change-password)
app.use('/api/auth', authRoutes);

// Authenticated modules with global CEO Read-Only enforcement middleware
app.use('/api/users', authenticate, blockCeoMutations, usersRoutes);
app.use('/api/leads', authenticate, blockCeoMutations, leadsRoutes);
app.use('/api/tasks', authenticate, blockCeoMutations, tasksRoutes);
app.use('/api/deals', authenticate, blockCeoMutations, dealsRoutes);
app.use('/api/notes', authenticate, blockCeoMutations, notesRoutes);
app.use('/api/analytics', authenticate, blockCeoMutations, analyticsRoutes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
});

// Centralized async error handling middleware
app.use(errorHandler);

module.exports = app;

