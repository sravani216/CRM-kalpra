const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Initialize singleton PrismaClient instance
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['warn', 'error'],
});

// Graceful disconnection on application termination
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;

