import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

describe('Logger', () => {
  let originalLevel;
  let captured;

  beforeEach(() => {
    originalLevel = process.env.LOG_LEVEL;
  });

  afterEach(() => {
    if (originalLevel === undefined) {
      delete process.env.LOG_LEVEL;
    } else {
      process.env.LOG_LEVEL = originalLevel;
    }
    captured = null;
  });

  async function makeLogger(level) {
    // Each test needs a fresh logger instance with the desired level
    process.env.LOG_LEVEL = level;
    // Dynamic import with cache-busting is not supported in ESM without workarounds,
    // so we test the singleton by checking output directly.
    const { logger } = await import('../services/logger.js');
    return logger;
  }

  it('outputs valid JSON to stdout for info level', async () => {
    const { logger } = await import('../services/logger.js');

    const lines = [];
    const orig = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk, ...rest) => {
      lines.push(chunk);
      return orig(chunk, ...rest);
    };

    try {
      logger.info('test message', { foo: 'bar' });
    } finally {
      process.stdout.write = orig;
    }

    assert.ok(lines.length > 0, 'expected at least one line written');
    const entry = JSON.parse(lines[lines.length - 1]);
    assert.equal(entry.level, 'info');
    assert.equal(entry.message, 'test message');
    assert.deepEqual(entry.context, { foo: 'bar' });
    assert.ok(entry.timestamp, 'should have timestamp');
    // Validate ISO 8601
    assert.ok(!isNaN(Date.parse(entry.timestamp)));
  });

  it('routes error level to stderr', async () => {
    const { logger } = await import('../services/logger.js');

    const lines = [];
    const orig = process.stderr.write.bind(process.stderr);
    process.stderr.write = (chunk, ...rest) => {
      lines.push(chunk);
      return orig(chunk, ...rest);
    };

    try {
      logger.error('something broke', { code: 500 });
    } finally {
      process.stderr.write = orig;
    }

    assert.ok(lines.length > 0, 'expected stderr output');
    const entry = JSON.parse(lines[lines.length - 1]);
    assert.equal(entry.level, 'error');
    assert.equal(entry.message, 'something broke');
  });

  it('omits context field when no context provided', async () => {
    const { logger } = await import('../services/logger.js');

    const lines = [];
    const orig = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk, ...rest) => {
      lines.push(chunk);
      return orig(chunk, ...rest);
    };

    try {
      logger.info('no context');
    } finally {
      process.stdout.write = orig;
    }

    const entry = JSON.parse(lines[lines.length - 1]);
    assert.equal(Object.hasOwn(entry, 'context'), false);
  });

  it('suppresses debug messages when LOG_LEVEL is info', async () => {
    // The singleton was created with default (info) or whatever is set.
    // We test by setting level to error and creating a fresh instance.
    const { Logger } = await import('../services/logger.js').catch(() => null) ?? {};

    // Since we can't re-instantiate the singleton easily, we test level filtering
    // by monkey-patching _log and calling debug on it directly.
    const { logger } = await import('../services/logger.js');

    // Force level to info (2) — debug (3) should be suppressed
    const savedLevel = logger.level;
    logger.level = 2; // info

    const lines = [];
    const orig = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk, ...rest) => {
      lines.push(chunk);
      return orig(chunk, ...rest);
    };

    try {
      logger.debug('this should not appear');
    } finally {
      process.stdout.write = orig;
      logger.level = savedLevel;
    }

    const debugLines = lines.filter(l => {
      try { return JSON.parse(l).level === 'debug'; } catch { return false; }
    });
    assert.equal(debugLines.length, 0, 'debug should be filtered at info level');
  });
});
