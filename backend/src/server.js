require('dotenv').config();
const app = require('./app');
const prisma = require('./config/db');
const { ensureUploadDirs } = require('./middleware/upload');

const PORT = process.env.PORT || 5000;

// Ensure upload folders exist before binding
ensureUploadDirs();

const server = app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`🚀 Marketing CRM Backend Server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`========================================================`);
});

// Handle graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down server...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('🔌 Database client disconnected cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('Error during database disconnect:', err);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = server;

