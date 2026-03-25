import express from 'express';
import { getDb } from './db/init.js';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  try {
    getDb().prepare('SELECT 1').get();
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

export default app;
