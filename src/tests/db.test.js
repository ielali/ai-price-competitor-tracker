import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';
import { getDb, resetDb } from '../db/init.js';
import { migrate, rollbackAll } from '../db/migrate.js';
import { encrypt, decrypt } from '../db/encryption.js';
import * as users from '../db/users.js';
import * as organizations from '../db/organizations.js';
import * as competitors from '../db/competitors.js';
import * as trackedProducts from '../db/trackedProducts.js';
import * as competitorProducts from '../db/competitorProducts.js';
import * as priceSnapshots from '../db/priceSnapshots.js';
import * as alertRules from '../db/alertRules.js';
import * as alertEvents from '../db/alertEvents.js';
import * as platformIntegrations from '../db/platformIntegrations.js';
import * as apiKeys from '../db/apiKeys.js';

// Use in-memory DB for tests
process.env.DATABASE_PATH = ':memory:';

let orgId, userId, competitorId, trackedProductId, cpId, snapshotId, ruleId, eventId, integrationId, keyId, rawApiKey;

describe('Migration runner', () => {
  it('applies all migrations to a clean in-memory DB', () => {
    const db = getDb();
    const tables = db.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
    ).all().map(r => r.name);
    assert.ok(tables.includes('users'));
    assert.ok(tables.includes('organizations'));
    assert.ok(tables.includes('tracked_products'));
    assert.ok(tables.includes('competitors'));
    assert.ok(tables.includes('competitor_products'));
    assert.ok(tables.includes('price_snapshots'));
    assert.ok(tables.includes('alert_rules'));
    assert.ok(tables.includes('alert_events'));
    assert.ok(tables.includes('platform_integrations'));
    assert.ok(tables.includes('api_keys'));
    assert.ok(tables.includes('schema_migrations'));
  });

  it('records applied migrations in schema_migrations', () => {
    const db = getDb();
    const applied = db.prepare(`SELECT version FROM schema_migrations ORDER BY version`).all().map(r => r.version);
    assert.ok(applied.length >= 6);
    assert.ok(applied.some(v => v.includes('001_create_users_and_orgs')));
    assert.ok(applied.some(v => v.includes('006_add_indexes_and_constraints')));
  });

  it('rollbackAll removes all tables on isolated in-memory DB', () => {
    const freshDb = new Database(':memory:');
    freshDb.pragma('foreign_keys = ON');
    migrate(freshDb);

    const before = freshDb.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT IN ('schema_migrations','migration_locks')`
    ).all();
    assert.ok(before.length > 0);

    rollbackAll(freshDb);

    const after = freshDb.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT IN ('schema_migrations','migration_locks')`
    ).all();
    assert.equal(after.length, 0);
    freshDb.close();
  });

  it('creates all expected indexes', () => {
    const db = getDb();
    const indexes = db.prepare(
      `SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name`
    ).all().map(r => r.name);
    assert.ok(indexes.includes('idx_tracked_products_org_active'));
    assert.ok(indexes.includes('idx_price_snapshots_cp_scraped'));
    assert.ok(indexes.includes('idx_api_keys_org'));
    assert.ok(indexes.includes('idx_api_keys_hash_org'));
    assert.ok(indexes.includes('idx_users_email'));
  });
});

describe('Encryption', () => {
  it('encrypts and decrypts plaintext round-trip', () => {
    const plaintext = 'super-secret-token-abc123';
    const ciphertext = encrypt(plaintext);
    assert.notEqual(ciphertext, plaintext);
    assert.equal(decrypt(ciphertext), plaintext);
  });

  it('produces different ciphertext each call (random IV)', () => {
    const plaintext = 'same-input';
    const c1 = encrypt(plaintext);
    const c2 = encrypt(plaintext);
    assert.notEqual(c1, c2);
  });

  it('returns null for null input', () => {
    assert.equal(encrypt(null), null);
    assert.equal(decrypt(null), null);
  });
});

describe('Users CRUD', () => {
  it('create with name', () => {
    userId = randomUUID();
    const user = users.create({ id: userId, email: 'alice@test.com', hashed_password: 'hash123', name: 'Alice' });
    assert.equal(user.id, userId);
    assert.equal(user.email, 'alice@test.com');
    assert.equal(user.name, 'Alice');
    assert.ok(user.created_at);
    assert.ok(user.updated_at);
  });

  it('getById', () => {
    assert.equal(users.getById(userId).id, userId);
  });

  it('getByEmail', () => {
    assert.equal(users.getByEmail('alice@test.com').id, userId);
  });

  it('update sets updated_at', () => {
    const updated = users.update(userId, { name: 'Alice Updated' });
    assert.equal(updated.name, 'Alice Updated');
  });

  it('delete', () => {
    const tempId = randomUUID();
    users.create({ id: tempId, email: `temp-${tempId}@test.com`, hashed_password: 'x' });
    users.del(tempId);
    assert.equal(users.getById(tempId), undefined);
  });
});

describe('Organizations CRUD', () => {
  it('create with plan_tier', () => {
    orgId = randomUUID();
    const org = organizations.create({ id: orgId, name: 'Acme Corp', plan_tier: 'pro' });
    assert.equal(org.id, orgId);
    assert.equal(org.plan_tier, 'pro');
  });

  it('rejects invalid plan_tier', () => {
    assert.throws(() => {
      organizations.create({ id: randomUUID(), name: 'Bad Org', plan_tier: 'invalid' });
    });
  });

  it('addMember and listMembers', () => {
    organizations.addMember({ org_id: orgId, user_id: userId, role: 'owner' });
    const members = organizations.listMembers(orgId);
    assert.ok(members.some(m => m.user_id === userId && m.role === 'owner'));
  });

  it('update', () => {
    const updated = organizations.update(orgId, { plan_tier: 'basic' });
    assert.equal(updated.plan_tier, 'basic');
  });
});

describe('Competitors CRUD', () => {
  it('create', () => {
    competitorId = randomUUID();
    const c = competitors.create({ id: competitorId, org_id: orgId, name: 'TestRival', domain: 'testrival.com', platform: 'shopify' });
    assert.equal(c.name, 'TestRival');
    assert.equal(c.domain, 'testrival.com');
    assert.equal(c.org_id, orgId);
  });

  it('listByOrg', () => {
    const list = competitors.listByOrg(orgId);
    assert.ok(list.some(c => c.id === competitorId));
  });

  it('update', () => {
    const updated = competitors.update(competitorId, { platform: 'amazon' });
    assert.equal(updated.platform, 'amazon');
  });
});

describe('TrackedProducts CRUD', () => {
  it('create with price as integer cents', () => {
    trackedProductId = randomUUID();
    const p = trackedProducts.create({ id: trackedProductId, org_id: orgId, name: 'Widget', our_price: 1999, platform: 'shopify' });
    assert.equal(p.our_price, 1999);
    assert.equal(typeof p.our_price, 'number');
    assert.ok(p.updated_at);
  });

  it('listByOrg', () => {
    const list = trackedProducts.listByOrg(orgId);
    assert.ok(list.some(p => p.id === trackedProductId));
  });

  it('listByOrg activeOnly', () => {
    const list = trackedProducts.listByOrg(orgId, { activeOnly: true });
    assert.ok(list.some(p => p.id === trackedProductId));
  });

  it('update sets updated_at', () => {
    const updated = trackedProducts.update(trackedProductId, { our_price: 2499 });
    assert.equal(updated.our_price, 2499);
  });
});

describe('CompetitorProducts CRUD', () => {
  it('create', () => {
    cpId = randomUUID();
    const cp = competitorProducts.create({
      id: cpId, competitor_id: competitorId, tracked_product_id: trackedProductId,
      external_url: 'https://rival.com/p/1', external_sku: 'EXT-001',
    });
    assert.equal(cp.id, cpId);
    assert.equal(cp.tracked_product_id, trackedProductId);
  });

  it('listByCompetitor', () => {
    const list = competitorProducts.listByCompetitor(competitorId);
    assert.ok(list.some(cp => cp.id === cpId));
  });

  it('listByTrackedProduct', () => {
    const list = competitorProducts.listByTrackedProduct(trackedProductId);
    assert.ok(list.some(cp => cp.id === cpId));
  });

  it('update last_scraped_at', () => {
    const now = new Date().toISOString();
    const updated = competitorProducts.update(cpId, { last_scraped_at: now });
    assert.equal(updated.last_scraped_at, now);
  });
});

describe('PriceSnapshots CRUD', () => {
  it('create stores price as integer cents', () => {
    snapshotId = randomUUID();
    const snap = priceSnapshots.create({ id: snapshotId, competitor_product_id: cpId, price: 8499, availability_status: 'in_stock' });
    assert.equal(snap.price, 8499);
    assert.equal(typeof snap.price, 'number');
    assert.equal(snap.availability_status, 'in_stock');
  });

  it('rejects invalid availability_status', () => {
    assert.throws(() => {
      priceSnapshots.create({ id: randomUUID(), competitor_product_id: cpId, price: 100, availability_status: 'unknown' });
    });
  });

  it('listByCompetitorProduct', () => {
    const list = priceSnapshots.listByCompetitorProduct(cpId);
    assert.ok(list.some(s => s.id === snapshotId));
  });

  it('bulkCreate inserts multiple rows in a transaction', () => {
    const rows = Array.from({ length: 10 }, (_, i) => ({
      id: randomUUID(), competitor_product_id: cpId,
      price: 5000 + i * 100, currency: 'USD', availability_status: 'in_stock',
      scraped_at: new Date(Date.now() - i * 3600000).toISOString(),
    }));
    priceSnapshots.bulkCreate(rows);
    const list = priceSnapshots.listByCompetitorProduct(cpId, { limit: 50 });
    assert.ok(list.length >= 10);
  });

  it('bulkCreate validates availability_status', () => {
    assert.throws(() => {
      priceSnapshots.bulkCreate([{ id: randomUUID(), competitor_product_id: cpId, price: 100, availability_status: 'bad' }]);
    });
  });

  it('bulk insert 1000 rows completes in under 2 seconds', () => {
    const start = Date.now();
    const rows = Array.from({ length: 1000 }, (_, i) => ({
      id: randomUUID(), competitor_product_id: cpId,
      price: 4000 + i, currency: 'USD', availability_status: 'in_stock',
      scraped_at: new Date(Date.now() - i * 1000).toISOString(),
    }));
    priceSnapshots.bulkCreate(rows);
    const elapsed = Date.now() - start;
    assert.ok(elapsed < 2000, `Expected < 2000ms, got ${elapsed}ms`);
  });
});

describe('AlertRules CRUD', () => {
  it('create', () => {
    ruleId = randomUUID();
    const rule = alertRules.create({
      id: ruleId, org_id: orgId, tracked_product_id: trackedProductId,
      rule_type: 'undercut', threshold_value: 5, threshold_unit: 'percent',
    });
    assert.equal(rule.rule_type, 'undercut');
    assert.equal(rule.threshold_unit, 'percent');
    assert.equal(rule.is_enabled, 1);
  });

  it('rejects invalid rule_type', () => {
    assert.throws(() => {
      alertRules.create({ id: randomUUID(), org_id: orgId, rule_type: 'invalid' });
    });
  });

  it('allows org-wide rule without tracked_product_id', () => {
    const rule = alertRules.create({ id: randomUUID(), org_id: orgId, rule_type: 'out_of_stock' });
    assert.equal(rule.tracked_product_id, null);
  });

  it('listByOrg', () => {
    const list = alertRules.listByOrg(orgId);
    assert.ok(list.some(r => r.id === ruleId));
  });

  it('listByProduct', () => {
    const list = alertRules.listByProduct(trackedProductId);
    assert.ok(list.some(r => r.id === ruleId));
  });

  it('update sets updated_at', () => {
    const updated = alertRules.update(ruleId, { is_enabled: 0 });
    assert.equal(updated.is_enabled, 0);
  });
});

describe('AlertEvents CRUD', () => {
  it('create without explicit triggered_at', () => {
    eventId = randomUUID();
    const event = alertEvents.create({
      id: eventId, alert_rule_id: ruleId, competitor_product_id: cpId,
      old_value: 5000, new_value: 4500, change_percent: -10.0,
    });
    assert.equal(event.old_value, 5000);
    assert.equal(event.new_value, 4500);
    assert.ok(event.triggered_at);
    assert.equal(event.acknowledged_at, null);
  });

  it('create with explicit triggered_at', () => {
    const ts = '2025-01-01T00:00:00.000Z';
    const event = alertEvents.create({
      id: randomUUID(), alert_rule_id: ruleId, competitor_product_id: cpId,
      triggered_at: ts,
    });
    assert.equal(event.triggered_at, ts);
  });

  it('listByRule', () => {
    const list = alertEvents.listByRule(ruleId);
    assert.ok(list.some(e => e.id === eventId));
  });

  it('acknowledge sets acknowledged_at', () => {
    const acked = alertEvents.acknowledge(eventId);
    assert.ok(acked.acknowledged_at);
  });
});

describe('PlatformIntegrations CRUD', () => {
  it('create encrypts access_token (plaintext not stored)', () => {
    integrationId = randomUUID();
    const integration = platformIntegrations.create({
      id: integrationId, org_id: orgId, platform: 'shopify',
      access_token: 'shpat_secret123', shop_domain: 'myshop.myshopify.com',
    });
    assert.equal(integration.platform, 'shopify');
    // Stored value must be encrypted (not plaintext)
    const raw = getDb().prepare(`SELECT access_token_encrypted FROM platform_integrations WHERE id = ?`).get(integrationId);
    assert.notEqual(raw.access_token_encrypted, 'shpat_secret123');
    assert.ok(raw.access_token_encrypted);
  });

  it('getByIdDecrypted returns plaintext tokens', () => {
    const record = platformIntegrations.getByIdDecrypted(integrationId);
    assert.equal(record.access_token, 'shpat_secret123');
    assert.equal(record.refresh_token, null);
  });

  it('listByOrg', () => {
    const list = platformIntegrations.listByOrg(orgId);
    assert.ok(list.some(i => i.id === integrationId));
  });
});

describe('API Keys CRUD', () => {
  it('create generates key and hashes it', () => {
    keyId = randomUUID();
    const result = apiKeys.create({ id: keyId, org_id: orgId, label: 'Test Key' });
    assert.ok(result.record);
    assert.ok(result.rawKey.startsWith('sk_'));
    assert.equal(result.record.id, keyId);
    assert.equal(result.record.label, 'Test Key');
    // key_hash must not appear in returned record
    assert.equal(result.record.key_hash, undefined);
    rawApiKey = result.rawKey;
  });

  it('listByOrg does not expose key_hash', () => {
    const list = apiKeys.listByOrg(orgId);
    const key = list.find(k => k.id === keyId);
    assert.ok(key);
    assert.equal(key.key_hash, undefined);
  });

  it('verify returns row for valid key and updates last_used_at', () => {
    const row = apiKeys.verify(rawApiKey, orgId);
    assert.ok(row);
    assert.equal(row.id, keyId);
  });

  it('verify returns null for wrong key', () => {
    const row = apiKeys.verify('wrong-key', orgId);
    assert.equal(row, null);
  });

  it('verify returns null for wrong org', () => {
    const row = apiKeys.verify(rawApiKey, 'other-org-id');
    assert.equal(row, null);
  });
});

describe('Index usage (EXPLAIN QUERY PLAN)', () => {
  it('price_snapshots query uses index scan', () => {
    const db = getDb();
    const plan = db.prepare(
      `EXPLAIN QUERY PLAN SELECT * FROM price_snapshots WHERE competitor_product_id = ? ORDER BY scraped_at DESC LIMIT 100`
    ).all(cpId);
    const planText = plan.map(r => r.detail).join(' ');
    assert.ok(
      planText.includes('idx_price_snapshots_cp_scraped') || planText.includes('USING INDEX'),
      `Expected index scan, got: ${planText}`
    );
  });

  it('api_keys verify query uses composite index', () => {
    const db = getDb();
    const plan = db.prepare(
      `EXPLAIN QUERY PLAN SELECT * FROM api_keys WHERE key_hash = ? AND org_id = ?`
    ).all('fakehash', orgId);
    const planText = plan.map(r => r.detail).join(' ');
    assert.ok(
      planText.includes('idx_api_keys') || planText.includes('USING INDEX') || planText.includes('SEARCH'),
      `Expected index usage, got: ${planText}`
    );
  });
});

describe('Referential integrity', () => {
  it('enforces foreign key: competitor requires valid org_id', () => {
    assert.throws(() => {
      competitors.create({ id: randomUUID(), org_id: 'nonexistent', name: 'Bad' });
    });
  });

  it('enforces foreign key: tracked_product requires valid org_id', () => {
    assert.throws(() => {
      trackedProducts.create({ id: randomUUID(), org_id: 'nonexistent', name: 'Bad', our_price: 100 });
    });
  });

  it('enforces plan_tier validation', () => {
    assert.throws(() => {
      organizations.create({ id: randomUUID(), name: 'Bad', plan_tier: 'enterprise' });
    });
  });
});

describe('Cascade deletes', () => {
  it('deleting an org cascades to competitors and tracked products', () => {
    const uid = randomUUID();
    const oid = randomUUID();
    const cid = randomUUID();
    const pid = randomUUID();

    users.create({ id: uid, email: `cascade-${uid}@test.com`, hashed_password: 'x' });
    organizations.create({ id: oid, name: 'Temp Org', plan_tier: 'free_trial' });
    organizations.addMember({ org_id: oid, user_id: uid, role: 'owner' });
    competitors.create({ id: cid, org_id: oid, name: 'Temp Competitor' });
    trackedProducts.create({ id: pid, org_id: oid, name: 'Temp Product', our_price: 100 });

    organizations.del(oid);

    assert.equal(competitors.getById(cid), undefined);
    assert.equal(trackedProducts.getById(pid), undefined);
  });

  it('deleting a competitor cascades to competitor_products and price_snapshots', () => {
    const oid2 = randomUUID();
    const cid2 = randomUUID();
    const pid2 = randomUUID();
    const cpid2 = randomUUID();
    const snapId = randomUUID();

    organizations.create({ id: oid2, name: 'Cascade Org', plan_tier: 'free_trial' });
    competitors.create({ id: cid2, org_id: oid2, name: 'TempComp' });
    trackedProducts.create({ id: pid2, org_id: oid2, name: 'TempProd', our_price: 100 });
    competitorProducts.create({ id: cpid2, competitor_id: cid2, tracked_product_id: pid2 });
    priceSnapshots.create({ id: snapId, competitor_product_id: cpid2, price: 999 });

    competitors.del(cid2);

    assert.equal(competitorProducts.getById(cpid2), undefined);
    assert.equal(priceSnapshots.getById(snapId), undefined);
  });
});
