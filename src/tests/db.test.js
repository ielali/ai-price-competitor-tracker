import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'crypto';
import { getDb } from '../db/init.js';
import * as users from '../db/users.js';
import * as competitors from '../db/competitors.js';
import * as products from '../db/products.js';
import * as competitorProducts from '../db/competitorProducts.js';
import * as priceObservations from '../db/priceObservations.js';
import * as alertRules from '../db/alertRules.js';

// Use in-memory DB for tests
process.env.DATABASE_PATH = ':memory:';

let userId, competitorId, productId, cpId, obsId, alertId;

describe('Database initialization', () => {
  it('creates all tables', () => {
    const db = getDb();
    const tables = db.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`
    ).all().map(r => r.name);
    assert.deepEqual(tables, ['alert_rules', 'competitor_products', 'competitors', 'price_observations', 'products', 'users']);
  });

  it('creates all indexes', () => {
    const db = getDb();
    const indexes = db.prepare(
      `SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name`
    ).all().map(r => r.name);
    assert.ok(indexes.includes('idx_competitors_user'));
    assert.ok(indexes.includes('idx_products_user'));
    assert.ok(indexes.includes('idx_cp_competitor'));
    assert.ok(indexes.includes('idx_cp_product'));
    assert.ok(indexes.includes('idx_observations_cp'));
    assert.ok(indexes.includes('idx_observations_time'));
    assert.ok(indexes.includes('idx_alerts_user'));
    assert.ok(indexes.includes('idx_alerts_product'));
  });

  it('enforces foreign keys', () => {
    assert.throws(() => {
      competitors.create({ id: randomUUID(), user_id: 'nonexistent', name: 'Bad' });
    });
  });
});

describe('Users CRUD', () => {
  it('create', () => {
    userId = randomUUID();
    const user = users.create({ id: userId, email: 'test@test.com', hashed_password: 'hash123' });
    assert.equal(user.id, userId);
    assert.equal(user.email, 'test@test.com');
    assert.equal(user.plan_tier, 'free');
  });

  it('getById', () => {
    const user = users.getById(userId);
    assert.equal(user.id, userId);
  });

  it('listByUser', () => {
    const list = users.listByUser();
    assert.ok(list.length >= 1);
  });

  it('update', () => {
    const updated = users.update(userId, { plan_tier: 'pro' });
    assert.equal(updated.plan_tier, 'pro');
  });

  it('delete', () => {
    const tempId = randomUUID();
    users.create({ id: tempId, email: 'temp@test.com', hashed_password: 'x' });
    users.del(tempId);
    assert.equal(users.getById(tempId), undefined);
  });
});

describe('Competitors CRUD', () => {
  it('create', () => {
    competitorId = randomUUID();
    const c = competitors.create({ id: competitorId, user_id: userId, name: 'TestRival', platform: 'shopify' });
    assert.equal(c.name, 'TestRival');
    assert.equal(c.platform, 'shopify');
  });

  it('getById', () => {
    assert.equal(competitors.getById(competitorId).id, competitorId);
  });

  it('listByUser', () => {
    const list = competitors.listByUser(userId);
    assert.ok(list.some(c => c.id === competitorId));
  });

  it('update', () => {
    const updated = competitors.update(competitorId, { platform: 'amazon' });
    assert.equal(updated.platform, 'amazon');
  });
});

describe('Products CRUD', () => {
  it('create with price as integer cents', () => {
    productId = randomUUID();
    const p = products.create({ id: productId, user_id: userId, name: 'Widget', our_price: 1999 });
    assert.equal(p.our_price, 1999);
    assert.equal(typeof p.our_price, 'number');
  });

  it('getById', () => {
    assert.equal(products.getById(productId).id, productId);
  });

  it('listByUser', () => {
    const list = products.listByUser(userId);
    assert.ok(list.some(p => p.id === productId));
  });

  it('update', () => {
    const updated = products.update(productId, { our_price: 2499 });
    assert.equal(updated.our_price, 2499);
  });
});

describe('CompetitorProducts CRUD', () => {
  it('create', () => {
    cpId = randomUUID();
    const cp = competitorProducts.create({ id: cpId, competitor_id: competitorId, product_id: productId });
    assert.equal(cp.id, cpId);
  });

  it('listByUser', () => {
    const list = competitorProducts.listByUser(userId);
    assert.ok(list.some(cp => cp.id === cpId));
  });

  it('listByCompetitor', () => {
    const list = competitorProducts.listByCompetitor(competitorId);
    assert.ok(list.some(cp => cp.id === cpId));
  });

  it('update last_checked_at', () => {
    const now = new Date().toISOString();
    const updated = competitorProducts.update(cpId, { last_checked_at: now });
    assert.equal(updated.last_checked_at, now);
  });
});

describe('PriceObservations CRUD', () => {
  it('create stores price as integer cents', () => {
    obsId = randomUUID();
    const obs = priceObservations.create({ id: obsId, competitor_product_id: cpId, price: 8499, was_on_sale: 0 });
    assert.equal(obs.price, 8499);
    assert.equal(typeof obs.price, 'number');
  });

  it('create with was_on_sale flag', () => {
    const obs = priceObservations.create({ id: randomUUID(), competitor_product_id: cpId, price: 7999, was_on_sale: 1 });
    assert.equal(obs.was_on_sale, 1);
  });

  it('listByCompetitorProduct', () => {
    const list = priceObservations.listByCompetitorProduct(cpId);
    assert.ok(list.length >= 2);
    assert.ok(list.some(o => o.id === obsId));
  });

  it('listByUser', () => {
    const list = priceObservations.listByUser(userId);
    assert.ok(list.length >= 1);
  });
});

describe('AlertRules CRUD', () => {
  it('create', () => {
    alertId = randomUUID();
    const rule = alertRules.create({ id: alertId, user_id: userId, product_id: productId, rule_type: 'undercut' });
    assert.equal(rule.rule_type, 'undercut');
    assert.equal(rule.is_active, 1);
  });

  it('rejects invalid rule_type', () => {
    assert.throws(() => {
      alertRules.create({ id: randomUUID(), user_id: userId, product_id: productId, rule_type: 'invalid' });
    });
  });

  it('create threshold rule with value', () => {
    const rule = alertRules.create({ id: randomUUID(), user_id: userId, product_id: productId, rule_type: 'threshold', threshold_value: 5000 });
    assert.equal(rule.threshold_value, 5000);
  });

  it('listByUser', () => {
    const list = alertRules.listByUser(userId);
    assert.ok(list.some(r => r.id === alertId));
  });

  it('update is_active', () => {
    const updated = alertRules.update(alertId, { is_active: 0 });
    assert.equal(updated.is_active, 0);
  });

  it('delete', () => {
    alertRules.del(alertId);
    assert.equal(alertRules.getById(alertId), undefined);
  });
});

describe('Cascade deletes', () => {
  it('deleting a user cascades to competitors and products', () => {
    const uid = randomUUID();
    users.create({ id: uid, email: `cascade-${uid}@test.com`, hashed_password: 'x' });
    const cid = randomUUID();
    competitors.create({ id: cid, user_id: uid, name: 'Temp' });
    users.del(uid);
    assert.equal(competitors.getById(cid), undefined);
  });
});
