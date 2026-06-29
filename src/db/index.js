import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

// 本地開發載入 .env；正式環境由平台注入環境變數、沒有 .env 也照常運作
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch {
    // 沒有 .env 檔（如正式環境）就略過，改用既有環境變數
  }
}

const { DATABASE_URL } = process.env;

// 缺少連線設定就 fail fast，避免在壞掉的狀態下啟動
if (!DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env and provide a PostgreSQL connection string.',
  );
}

export const pool = new Pool({ connectionString: DATABASE_URL });

export const db = drizzle(pool, { schema });
