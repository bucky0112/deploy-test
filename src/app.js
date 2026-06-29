import express from 'express';
import cors from 'cors';
import todosRouter from './routes/todos.js';

const app = express();

// 從環境變數讀前端白名單：逗號分隔、去空白、濾掉空字串，支援多組來源
// 例：CORS_ORIGINS="https://app.example.com, http://localhost:5173"
const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // 放行無 origin 的請求（curl、同源、server-to-server）
    // 未設定白名單時（allowedOrigins 為空）一律放行 → 允許所有來源
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    const err = new Error(`Not allowed by CORS: ${origin}`);
    err.status = 403;
    callback(err);
  },
};

app.use(cors(corsOptions));
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
