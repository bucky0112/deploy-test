import { defineConfig } from 'drizzle-kit';

// drizzle-kit 以 Node 執行此設定檔，這裡載入 .env 讓 DATABASE_URL 可用
// （Node 20.6+ 提供 process.loadEnvFile）
try {
  process.loadEnvFile();
} catch {
  // 沒有 .env 檔時忽略，改用既有環境變數
}

export default defineConfig({
  schema: './src/db/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
