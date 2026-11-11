import EmbeddedPostgres from 'embedded-postgres';
import fs from 'node:fs';
import path from 'node:path';

const dbDir = path.resolve(process.cwd(), 'data/pg_data');
let pgInstance: EmbeddedPostgres | null = null;

export async function ensurePostgresRunning(port = 5433): Promise<EmbeddedPostgres> {
  if (pgInstance) {
    return pgInstance;
  }

  const pg = new EmbeddedPostgres({
    databaseDir: dbDir,
    port,
    user: 'postgres',
    password: 'password',
    persistent: true,
  });

  if (!fs.existsSync(path.join(dbDir, 'PG_VERSION'))) {
    console.log('[PostgreSQL Service] Initializing database cluster at:', dbDir);
    await pg.initialise();
  }

  console.log(`[PostgreSQL Service] Starting PostgreSQL 18 on port ${port}...`);
  await pg.start();
  console.log(`[PostgreSQL Service] PostgreSQL engine active on port ${port}`);

  try {
    await pg.createDatabase('crm');
    console.log('[PostgreSQL Service] Verified database "crm" exists.');
  } catch (err: any) {
    // Database already exists
  }

  pgInstance = pg;

  // Graceful shutdown
  const cleanExit = async () => {
    if (pgInstance) {
      console.log('[PostgreSQL Service] Shutting down PostgreSQL...');
      try {
        await pgInstance.stop();
      } catch (e) {}
      pgInstance = null;
    }
    process.exit(0);
  };

  process.on('SIGINT', cleanExit);
  process.on('SIGTERM', cleanExit);

  return pgInstance;
}

