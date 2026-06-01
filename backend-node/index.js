import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/api', chatRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`PDF Chat API running at http://localhost:${PORT}`);
  console.log(`Using embed model : ${process.env.EMBED_MODEL || 'gemini-embedding-001'}`);
  console.log(`Using chat model  : ${process.env.CHAT_MODEL  || 'llama-3.1-8b-instant'}`);
});
