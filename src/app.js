import { createRequire } from 'module';
import express from 'express';
import { getDb } from './db/init.js';
import { logger } from './services/logger.js';
import { recordRequest, getMetrics } from './services/metrics.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const app = express();

app.use(express.json());

// Request/response logging middleware — skip /health to avoid noise
app.use((req, res, next) => {
  if (req.path === '/health') return next();

  const startedAt = Date.now();

  res.on('finish', () => {
    const duration_ms = Date.now() - startedAt;
    const status = res.statusCode;
    const logData = { method: req.method, path: req.path, status, duration_ms };

    if (status >= 500) {
      logger.error('Request failed', logData);
    } else if (status >= 400) {
      logger.warn('Request error', logData);
    } else {
      logger.info('Request completed', logData);
    }

    recordRequest({ method: req.method, path: req.path, status, duration_ms });
  });

  next();
});

app.get('/health', (_req, res) => {
  try {
    getDb().prepare('SELECT 1').get();
    res.json({
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      version,
    });
  } catch {
    res.status(503).json({ status: 'error', uptime: Math.floor(process.uptime()), version });
  }
});

app.get('/metrics', (_req, res) => {
  res.json(getMetrics());
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error('Unhandled request error', {
    method: req.method,
    path: req.path,
    error: err.message,
    stack: err.stack,
  });
  const status = err.status ?? err.statusCode ?? 500;
  res.status(status).json({ error: err.message ?? 'Internal Server Error' });
});

export default app;
