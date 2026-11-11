import { ensurePostgresRunning } from './postgres-service.js';
import { execSync } from 'node:child_process';

async function run() {
  console.log('[Run-Seed] Starting PostgreSQL 18...');
  const pg = await ensurePostgresRunning(5433);

  console.log('[Run-Seed] Running seed.ts...');
  execSync('npx tsx src/seed.ts', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: 'postgresql://postgres:password@localhost:5433/crm?schema=public'
    }
  });

  console.log('[Run-Seed] Seeding completed! Stopping temporary PG instance...');
  await pg.stop();
  process.exit(0);
}

run().catch((err) => {
  console.error('[Run-Seed] Error:', err);
  process.exit(1);
});

