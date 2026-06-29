import express from 'express';
import cors from 'cors';
import todosRouter from './routes/todos.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/todos', todosRouter);

// 未知路由 → 統一回 JSON 404
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
});

// 集中錯誤處理：Express 5 會自動把 async handler 的 rejection 轉到這裡
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  // 400 這類客戶端錯誤直接帶上訊息；其餘隱藏細節只回通用訊息
  const message = status < 500 ? err.message : 'Internal Server Error';
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({ error: message });
});

export default app;
