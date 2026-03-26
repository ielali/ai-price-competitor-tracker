import express from 'express';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb } from './db/init.js';
import { landingPageHandler } from './routes/landing.js';
import { privacyPageHandler, termsPageHandler } from './routes/staticPages.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

app.get('/health', (_req, res) => {
  try {
    getDb().prepare('SELECT 1').get();
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

export default app;
