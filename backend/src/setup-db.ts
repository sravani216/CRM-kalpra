import { ensurePostgresRunning } from './postgres-service.js';
import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

async function main() {
  console.log('[Setup] Ensuring PostgreSQL 18 is running on port 5433...');
  const pg = await ensurePostgresRunning(5433);

  console.log('[Setup] Pushing Prisma schema to PostgreSQL database...');
  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: 'postgresql://postgres:password@localhost:5433/crm?schema=public'
    }
  });

  console.log('[Setup] Verifying Prisma Client query...');
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://postgres:password@localhost:5433/crm?schema=public'
      }
    }
  });
  await prisma.$connect();
  const userCount = await prisma.user.count();
  console.log(`[Setup] Connected to PostgreSQL! Current user count: ${userCount}`);
  await prisma.$disconnect();

  console.log('[Setup] Stopping temporary setup PG instance...');
  await pg.stop();
  console.log('[Setup] Database setup complete and verified!');
  process.exit(0);
}

main().catch((err) => {
  console.error('[Setup] Error:', err);
  process.exit(1);
});
