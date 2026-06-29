import { Router } from 'express';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../db/index.js';
import { todos } from '../db/schema.js';

const router = Router();

// 解析路徑上的 :id，非正整數視為無效
function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// 只匹配未被軟刪除（deleted_at IS NULL）的指定 id
const activeById = (id) => and(eq(todos.id, id), isNull(todos.deletedAt));

// GET /todos — 列出全部（排除已軟刪除）
router.get('/', async (req, res) => {
  const rows = await db.select().from(todos).where(isNull(todos.deletedAt));
  res.status(200).json(rows);
});

// GET /todos/:id — 取單筆（已軟刪除視為不存在）
router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const [todo] = await db.select().from(todos).where(activeById(id));
  if (!todo) {
    return res.status(404).json({ error: `Todo ${req.params.id} not found` });
  }

  res.status(200).json(todo);
});

// POST /todos — 建立
router.post('/', async (req, res) => {
  const { title } = req.body ?? {};
  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title is required and must be a non-empty string' });
  }

  const [created] = await db
    .insert(todos)
    .values({ title: title.trim() })
    .returning();

  res.status(201).json(created);
});

// PATCH /todos/:id — 部分更新
router.patch('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const { title, completed } = req.body ?? {};
  const updates = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'title must be a non-empty string' });
    }
    updates.title = title.trim();
  }

  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'completed must be a boolean' });
    }
    updates.completed = completed;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Provide at least one of: title, completed' });
  }

  updates.updatedAt = new Date();

  const [updated] = await db
    .update(todos)
    .set(updates)
    .where(activeById(id))
    .returning();

  if (!updated) {
    return res.status(404).json({ error: `Todo ${req.params.id} not found` });
  }

  res.status(200).json(updated);
});

// DELETE /todos/:id — 軟刪除（設定 deleted_at，不移除資料列）
router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  // 只對「未刪除」的列生效；不存在或已軟刪除都不會匹配 → 404
  const [deleted] = await db
    .update(todos)
    .set({ deletedAt: new Date() })
    .where(activeById(id))
    .returning();

  if (!deleted) {
    return res.status(404).json({ error: `Todo ${req.params.id} not found` });
  }

  res.status(204).end();
});

export default router;
