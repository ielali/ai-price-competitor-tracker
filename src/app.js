import { createRequire } from 'module';
import express from 'express';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb } from './db/init.js';
import { landingPageHandler } from './routes/landing.js';
import { privacyPageHandler, termsPageHandler } from './routes/staticPages.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
import { logger } from './services/logger.js';
import { recordRequest, getMetrics } from './services/metrics.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const app = express();

app.use(express.json());

// CR-6 fix: mount static assets at /assets instead of / to avoid exposing
// any other files that may exist in the public/ directory (e.g. app.js).
app.use('/assets', express.static(join(__dirname, '..', 'public')));

// Landing page (root)
app.get('/', landingPageHandler);

// Static marketing pages
app.get('/privacy', privacyPageHandler);
app.get('/terms', termsPageHandler);
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
