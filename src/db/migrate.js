import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './index.js';

// 正式環境用的 migrate：只依賴 drizzle-orm（正式依賴），不需要 drizzle-kit（dev 工具）。
// 重用 db/index.js 設定好的連線（它負責載入 .env 與驗證 DATABASE_URL），
// 套用 drizzle/ 內尚未執行的 SQL migration。
await migrate(db, { migrationsFolder: './drizzle' });
await pool.end();

console.log('migrate 完成');