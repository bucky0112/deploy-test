import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { isConfig } from 'drizzle-orm';

const pool = new Pool({
  connectionString: isConfig.databaseUrl
})

const db = drizzle(pool)
await migrate(db, { migrationsFolder: './drizzle' })

await pool.end()
console.log('migrate 完成')