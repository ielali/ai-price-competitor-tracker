import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_PATH = ':memory:';

// Import after setting DATABASE_PATH so the in-memory DB is used
const { getDb, resetDb } = await import('../db/init.js');
const { recordRequest, getMetrics, cleanupOldLogs } = await import('../services/metrics.js');

describe('Metrics', () => {
  before(() => {
    // Ensure the DB is initialised
    getDb();
  });

  it('recordRequest persists a row to request_logs', () => {
    const before = getDb().prepare('SELECT COUNT(*) as n FROM request_logs').get().n;
    recordRequest({ method: 'GET', path: '/products', status: 200, duration_ms: 42 });
    const after = getDb().prepare('SELECT COUNT(*) as n FROM request_logs').get().n;
    assert.equal(after, before + 1);
  });

  it('getMetrics returns totalRequests >= 1 after recording', () => {
    recordRequest({ method: 'POST', path: '/competitors', status: 201, duration_ms: 10 });
    const metrics = getMetrics();
    assert.ok(metrics.totalRequests >= 1);
    assert.ok(Array.isArray(metrics.recentActivity));
    assert.ok(typeof metrics.errorBreakdown === 'object');
  });

  it('error requests increment errorRequests and set error_type', () => {
    const before = getMetrics().errorRequests;
    recordRequest({ method: 'GET', path: '/missing', status: 404, duration_ms: 5 });
    const after = getMetrics().errorRequests;
    assert.ok(after > before);

    const row = getDb().prepare(
      `SELECT error_type FROM request_logs WHERE path = '/missing' ORDER BY id DESC LIMIT 1`
    ).get();
    assert.equal(row.error_type, 'validation_error');
  });

  it('auth errors are categorised as auth_error', () => {
    recordRequest({ method: 'GET', path: '/protected', status: 401, duration_ms: 3 });
    const row = getDb().prepare(
      `SELECT error_type FROM request_logs WHERE path = '/protected' ORDER BY id DESC LIMIT 1`
    ).get();
    assert.equal(row.error_type, 'auth_error');
  });

  it('server errors are categorised as server_error', () => {
    recordRequest({ method: 'GET', path: '/crash', status: 500, duration_ms: 100 });
    const row = getDb().prepare(
      `SELECT error_type FROM request_logs WHERE path = '/crash' ORDER BY id DESC LIMIT 1`
    ).get();
    assert.equal(row.error_type, 'server_error');
  });

  it('errorBreakdown includes categorised errors', () => {
    const metrics = getMetrics();
    // We inserted 401 and 500 above, so there should be auth_error and server_error entries
    assert.ok(typeof metrics.errorBreakdown.auth_error === 'number');
    assert.ok(typeof metrics.errorBreakdown.server_error === 'number');
  });

  it('cleanupOldLogs does not throw', () => {
    assert.doesNotThrow(() => cleanupOldLogs());
  });
});
