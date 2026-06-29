import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

const { DATABASE_URL } = process.env;

// 缺少連線設定就 fail fast，避免在壞掉的狀態下啟動
if (!DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env and provide a PostgreSQL connection string.',
  );
}

export const pool = new Pool({ connectionString: DATABASE_URL });

export const db = drizzle(pool, { schema });
