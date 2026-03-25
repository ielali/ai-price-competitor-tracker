import { PORT } from './config/env.js';
import app from './app.js';
import { getDb } from './db/init.js';
import { logger } from './services/logger.js';
import { startMetricsCleanup } from './services/metrics.js';

const server = app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    node_version: process.version,
    env: process.env.NODE_ENV ?? 'development',
  });
  startMetricsCleanup();
});

function gracefulShutdown(signal) {
  logger.info('Shutdown initiated', { signal });
  server.close(() => {
    logger.info('HTTP server closed');
    try {
      getDb().close();
      logger.info('Database connection closed');
    } catch {
      // DB may already be closed
    }
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
