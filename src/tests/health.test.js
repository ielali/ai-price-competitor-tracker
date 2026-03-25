import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_PATH = ':memory:';

const { default: app } = await import('../app.js');

describe('GET /health', () => {
  let server;
  let baseUrl;

  before(() => new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  }));

  after(() => new Promise((resolve) => server.close(resolve)));

  it('returns 200 with status ok and db connected', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.db, 'connected');
  });
});
