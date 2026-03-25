import { getDb } from '../db/init.js';
import { logger } from './logger.js';

const RETENTION_DAYS = parseInt(process.env.METRICS_RETENTION_DAYS ?? '30', 10);

const ERROR_TYPES = {
  401: 'auth_error',
  403: 'auth_error',
  400: 'validation_error',
  422: 'validation_error',
  429: 'rate_limit_error',
  408: 'timeout_error',
};

function classifyError(status) {
  if (!status || status < 400) return null;
  if (ERROR_TYPES[status]) return ERROR_TYPES[status];
  if (status >= 500) return 'server_error';
  return 'validation_error';
}

/**
 * Persist a completed request into the request_logs table.
 * @param {{ method: string, path: string, status: number, duration_ms: number }} data
 */
export function recordRequest(data) {
  const { method, path, status, duration_ms } = data;
  const error_type = classifyError(status);
  try {
    getDb().prepare(
      `INSERT INTO request_logs (method, path, status, duration_ms, error_type)
       VALUES (?, ?, ?, ?, ?)`
    ).run(method, path, status ?? null, duration_ms ?? null, error_type);
  } catch (err) {
    logger.error('Failed to persist request log', { error: err.message });
  }
}

/**
 * Return aggregate request metrics from SQLite so they survive restarts.
 */
export function getMetrics() {
  const db = getDb();

  const totals = db.prepare(`
    SELECT
      COUNT(*)                                                      AS total_requests,
      SUM(CASE WHEN status >= 400 THEN 1 ELSE 0 END)               AS error_requests,
      AVG(duration_ms)                                              AS avg_duration_ms
    FROM request_logs
  `).get();

  const errorBreakdown = db.prepare(`
    SELECT error_type, COUNT(*) AS count
    FROM request_logs
    WHERE error_type IS NOT NULL
    GROUP BY error_type
  `).all().reduce((acc, row) => {
    acc[row.error_type] = row.count;
    return acc;
  }, {});

  const recentActivity = db.prepare(`
    SELECT method, path, status, duration_ms, error_type, timestamp
    FROM request_logs
    ORDER BY timestamp DESC
    LIMIT 100
  `).all();

  return {
    totalRequests:  totals.total_requests  ?? 0,
    errorRequests:  totals.error_requests  ?? 0,
    avgDurationMs:  totals.avg_duration_ms ?? 0,
    errorBreakdown,
    recentActivity,
  };
}

/**
 * Delete request_logs older than RETENTION_DAYS.
 */
export function cleanupOldLogs() {
  try {
    const result = getDb().prepare(
      `DELETE FROM request_logs WHERE timestamp < datetime('now', ? || ' days')`
    ).run(`-${RETENTION_DAYS}`);
    if (result.changes > 0) {
      logger.info('Cleaned up old request logs', { deleted: result.changes, retention_days: RETENTION_DAYS });
    }
  } catch (err) {
    logger.error('Failed to clean up old request logs', { error: err.message });
  }
}

/**
 * Start periodic log cleanup (every 6 hours).
 */
export function startMetricsCleanup() {
  cleanupOldLogs();
  setInterval(cleanupOldLogs, 6 * 60 * 60 * 1000).unref();
}
