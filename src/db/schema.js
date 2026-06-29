import {
  boolean,
  serial,
  text,
  timestamp,
  pgTable,
} from 'drizzle-orm/pg-core';

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  completed: boolean('completed').notNull().default(false),
  // 用 timestamptz（絕對時間點），避免 SQL now() 與 JS Date 寫入不同時區造成錯位
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  // 軟刪除標記：null = 未刪除，非 null = 已刪除（記錄刪除時間）
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
