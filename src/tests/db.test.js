import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';
import { getDb, resetDb } from '../db/init.js';
import { runMigrations, rollbackAll, getApplied } from '../db/migrate.js';
import { encrypt, decrypt, hashApiKey } from '../db/encryption.js';
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

// Use in-memory DB for all tests
process.env.DATABASE_PATH = ':memory:';

let orgId, userId, competitorId, productId, cpId, snapshotId, alertRuleId, alertEventId;

// ── Migration runner ──────────────────────────────────────────────────────────

describe('Migration runner', () => {
  it('applies all 6 migrations in order', () => {
    const applied = getApplied(getDb());
    assert.equal(applied.length, 6);
    assert.ok(applied[0].startsWith('001_'));
    assert.ok(applied[5].startsWith('006_'));
  });

  it('is idempotent — re-running does not error or duplicate', () => {
    assert.doesNotThrow(() => runMigrations(getDb()));
    const applied = getApplied(getDb());
    assert.equal(applied.length, 6);
  });

  it('rolls back all migrations leaving only infrastructure tables', () => {
    const testDb = new Database(':memory:');
    testDb.pragma('foreign_keys = ON');
    runMigrations(testDb);

    const before = testDb.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
    ).all().map(r => r.name);
    assert.ok(before.length > 2, 'tables exist after migrations');

    rollbackAll(testDb);

    const after = testDb.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
    ).all().map(r => r.name);
    assert.deepEqual(after.sort(), ['migration_locks', 'schema_migrations'],
      'only infrastructure tables remain after rollback');

    testDb.close();
  });
});

// ── Schema structure ──────────────────────────────────────────────────────────

describe('Database initialization', () => {
  it('creates all application tables', () => {
    const db = getDb();
    const tables = db.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
    ).all().map(r => r.name);
    const expected = [
      'alert_events', 'alert_rules', 'api_keys',
      'competitor_products', 'competitors',
      'migration_locks',
      'organization_members', 'organizations',
      'platform_integrations', 'price_snapshots',
      'schema_migrations',
      'tracked_products', 'users',
    ];
    assert.deepEqual(tables, expected);
  });

  it('creates all required indexes', () => {
    const db = getDb();
    const indexes = db.prepare(
      `SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name`
    ).all().map(r => r.name);

    const required = [
      'idx_alert_events_rule_triggered',
      'idx_alert_events_triggered',
      'idx_alert_rules_org_enabled',
      'idx_alert_rules_product',
      'idx_api_keys_org',
      'idx_competitor_products_competitor',
      'idx_competitor_products_tracked_active',
      'idx_org_members_org',
      'idx_org_members_user',
      'idx_platform_integrations_org',
      'idx_price_snapshots_cp_scraped',
      'idx_price_snapshots_scraped',
      'idx_tracked_products_org_active',
      'idx_users_email',
    ];
    for (const idx of required) {
      assert.ok(indexes.includes(idx), `missing index: ${idx}`);
    }
  });

  it('enforces foreign keys', () => {
    assert.throws(() => {
      competitors.create({ id: randomUUID(), org_id: 'nonexistent', name: 'Bad' });
    });
  });
});

// ── Users ─────────────────────────────────────────────────────────────────────

describe('Users CRUD', () => {
  it('create', () => {
    userId = randomUUID();
    const user = users.create({ id: userId, email: 'alice@test.com', hashed_password: 'hash', name: 'Alice' });
    assert.equal(user.id, userId);
    assert.equal(user.email, 'alice@test.com');
    assert.equal(user.name, 'Alice');
    assert.ok(user.created_at);
    assert.ok(user.updated_at);
  });

  it('getByEmail', () => {
    const user = users.getByEmail('alice@test.com');
    assert.equal(user.id, userId);
  });

  it('enforces unique email', () => {
    assert.throws(() => {
      users.create({ id: randomUUID(), email: 'alice@test.com', hashed_password: 'x' });
    });
  });

  it('update sets updated_at', () => {
    const before = users.getById(userId).updated_at;
    const updated = users.update(userId, { name: 'Alice Updated' });
    assert.equal(updated.name, 'Alice Updated');
    assert.notEqual(updated.updated_at, before);
  });

  it('delete', () => {
    const tmpId = randomUUID();
    users.create({ id: tmpId, email: `tmp-${tmpId}@test.com`, hashed_password: 'x' });
    users.del(tmpId);
    assert.equal(users.getById(tmpId), undefined);
  });
});

// ── Organizations ─────────────────────────────────────────────────────────────

describe('Organizations CRUD', () => {
  it('create', () => {
    orgId = randomUUID();
    const org = organizations.create({ id: orgId, name: 'Acme Corp', plan_tier: 'pro' });
    assert.equal(org.id, orgId);
    assert.equal(org.plan_tier, 'pro');
  });

  it('rejects invalid plan_tier', () => {
    assert.throws(() => {
      organizations.create({ id: randomUUID(), name: 'Bad', plan_tier: 'enterprise' });
    });
  });

  it('addMember as owner', () => {
    const member = organizations.addMember({ org_id: orgId, user_id: userId, role: 'owner' });
    assert.equal(member.role, 'owner');
  });

  it('listMembers includes user info', () => {
    const members = organizations.listMembers(orgId);
    assert.ok(members.some(m => m.user_id === userId));
  });

  it('listByUser returns orgs for a user', () => {
    const orgs = organizations.listByUser(userId);
    assert.ok(orgs.some(o => o.id === orgId));
  });

  it('update', () => {
    const updated = organizations.update(orgId, { plan_tier: 'basic' });
    assert.equal(updated.plan_tier, 'basic');
  });
});

// ── Competitors ───────────────────────────────────────────────────────────────

describe('Competitors CRUD', () => {
  it('create', () => {
    competitorId = randomUUID();
    const c = competitors.create({ id: competitorId, org_id: orgId, name: 'ShopRival', domain: 'shoprival.example.com', platform: 'shopify' });
    assert.equal(c.name, 'ShopRival');
    assert.equal(c.domain, 'shoprival.example.com');
    assert.equal(c.org_id, orgId);
  });

  it('listByOrg', () => {
    const list = competitors.listByOrg(orgId);
    assert.ok(list.some(c => c.id === competitorId));
  });

  it('rejects invalid platform', () => {
    assert.throws(() => {
      competitors.create({ id: randomUUID(), org_id: orgId, name: 'Bad', platform: 'ebay' });
    });
  });

  it('update', () => {
    const updated = competitors.update(competitorId, { platform: 'amazon' });
    assert.equal(updated.platform, 'amazon');
  });
});

// ── Tracked Products ──────────────────────────────────────────────────────────

describe('Tracked Products CRUD', () => {
  it('create stores price as integer cents', () => {
    productId = randomUUID();
    const p = trackedProducts.create({
      id: productId, org_id: orgId, name: 'Wireless Headphones',
      sku: 'WH-001', our_price: 1999, currency: 'USD', platform: 'shopify',
    });
    assert.equal(p.our_price, 1999);
    assert.equal(typeof p.our_price, 'number');
    assert.equal(p.is_active, 1);
  });

  it('price round-trips exactly without floating-point drift (AC-4)', () => {
    // $19.99 stored as 1999 cents
    const id = randomUUID();
    trackedProducts.create({ id, org_id: orgId, name: 'Test', our_price: 1999 });
    const retrieved = trackedProducts.getById(id);
    assert.equal(retrieved.our_price, 1999);
    assert.equal(typeof retrieved.our_price, 'number');
  });

  it('listByOrg activeOnly filter', () => {
    const id = randomUUID();
    trackedProducts.create({ id, org_id: orgId, name: 'Inactive', our_price: 100, is_active: 0 });
    const active = trackedProducts.listByOrg(orgId, { activeOnly: true });
    assert.ok(!active.some(p => p.id === id));
  });

  it('update sets updated_at', () => {
    const before = trackedProducts.getById(productId).updated_at;
    const updated = trackedProducts.update(productId, { our_price: 2499 });
    assert.equal(updated.our_price, 2499);
    assert.notEqual(updated.updated_at, before);
  });
});

// ── Competitor Products ───────────────────────────────────────────────────────

describe('Competitor Products CRUD', () => {
  it('create', () => {
    cpId = randomUUID();
    const cp = competitorProducts.create({
      id: cpId, competitor_id: competitorId, tracked_product_id: productId,
      external_url: 'https://shoprival.example.com/wh', external_sku: 'SR-WH-9',
    });
    assert.equal(cp.id, cpId);
    assert.equal(cp.tracked_product_id, productId);
    assert.equal(cp.is_active, 1);
  });

  it('listByOrg', () => {
    const list = competitorProducts.listByOrg(orgId);
    assert.ok(list.some(cp => cp.id === cpId));
  });

  it('listByTrackedProduct', () => {
    const list = competitorProducts.listByTrackedProduct(productId);
    assert.ok(list.some(cp => cp.id === cpId));
  });

  it('update last_scraped_at', () => {
    const now = new Date().toISOString();
    const updated = competitorProducts.update(cpId, { last_scraped_at: now });
    assert.equal(updated.last_scraped_at, now);
  });
});

// ── Price Snapshots ───────────────────────────────────────────────────────────

describe('Price Snapshots CRUD', () => {
  it('create stores price as integer cents', () => {
    snapshotId = randomUUID();
    const snap = priceSnapshots.create({
      id: snapshotId, competitor_product_id: cpId, price: 8499, currency: 'USD',
      availability_status: 'in_stock',
    });
    assert.equal(snap.price, 8499);
    assert.equal(typeof snap.price, 'number');
    assert.equal(snap.availability_status, 'in_stock');
  });

  it('rejects invalid availability_status', () => {
    assert.throws(() => {
      priceSnapshots.create({ id: randomUUID(), competitor_product_id: cpId, price: 100, availability_status: 'unknown' });
    });
  });

  it('getLatestByCompetitorProduct returns most recent', () => {
    // Insert an older and newer snapshot
    const older = randomUUID();
    const newer = randomUUID();
    const t1 = '2024-01-01T00:00:00.000Z';
    const t2 = '2024-06-01T00:00:00.000Z';
    priceSnapshots.create({ id: older, competitor_product_id: cpId, price: 7000, scraped_at: t1 });
    priceSnapshots.create({ id: newer, competitor_product_id: cpId, price: 7500, scraped_at: t2 });
    const latest = priceSnapshots.getLatestByCompetitorProduct(cpId);
    assert.equal(latest.id, snapshotId); // snapshotId was created most recently (no scraped_at = now)
  });

  it('bulk insert 1000 rows completes in under 2 seconds (AC-5)', () => {
    const rows = Array.from({ length: 1000 }, (_, i) => ({
      id: randomUUID(),
      competitor_product_id: cpId,
      price: 5000 + i,
      currency: 'USD',
      availability_status: 'in_stock',
      scraped_at: new Date(Date.now() - i * 1000).toISOString(),
    }));
    const start = Date.now();
    priceSnapshots.bulkCreate(rows);
    const elapsed = Date.now() - start;
    assert.ok(elapsed < 2000, `Bulk insert took ${elapsed}ms, expected < 2000ms`);
  });

  it('uses index scan for latest-price query (AC-6)', () => {
    const plan = getDb().prepare(
      `EXPLAIN QUERY PLAN SELECT * FROM price_snapshots WHERE competitor_product_id = ? ORDER BY scraped_at DESC LIMIT 1`
    ).all(cpId);
    const planText = plan.map(r => r.detail || r.opcode || JSON.stringify(r)).join(' ');
    assert.ok(
      planText.toLowerCase().includes('index'),
      `Expected index usage in query plan: ${planText}`
    );
  });

  it('listByCompetitorProduct', () => {
    const list = priceSnapshots.listByCompetitorProduct(cpId, { limit: 5 });
    assert.ok(list.length === 5);
  });
});

// ── Alert Rules ───────────────────────────────────────────────────────────────

describe('Alert Rules CRUD', () => {
  it('create with tracked_product_id (product-scoped rule)', () => {
    alertRuleId = randomUUID();
    const rule = alertRules.create({
      id: alertRuleId, org_id: orgId, tracked_product_id: productId,
      rule_type: 'undercut', threshold_value: 10, threshold_unit: 'percent',
    });
    assert.equal(rule.rule_type, 'undercut');
    assert.equal(rule.threshold_unit, 'percent');
    assert.equal(rule.is_enabled, 1);
  });

  it('create without tracked_product_id (org-wide rule)', () => {
    const rule = alertRules.create({
      id: randomUUID(), org_id: orgId,
      rule_type: 'out_of_stock',
    });
    assert.equal(rule.tracked_product_id, null);
    assert.equal(rule.rule_type, 'out_of_stock');
  });

  it('rejects invalid rule_type', () => {
    assert.throws(() => {
      alertRules.create({ id: randomUUID(), org_id: orgId, rule_type: 'invalid' });
    });
  });

  it('rejects invalid threshold_unit', () => {
    assert.throws(() => {
      alertRules.create({ id: randomUUID(), org_id: orgId, rule_type: 'price_drop', threshold_unit: 'bps' });
    });
  });

  it('listEnabledByOrg', () => {
    const list = alertRules.listEnabledByOrg(orgId);
    assert.ok(list.some(r => r.id === alertRuleId));
  });

  it('update is_enabled', () => {
    const updated = alertRules.update(alertRuleId, { is_enabled: 0 });
    assert.equal(updated.is_enabled, 0);
    alertRules.update(alertRuleId, { is_enabled: 1 }); // restore
  });

  it('delete', () => {
    const tmpId = randomUUID();
    alertRules.create({ id: tmpId, org_id: orgId, rule_type: 'price_drop' });
    alertRules.del(tmpId);
    assert.equal(alertRules.getById(tmpId), undefined);
  });
});

// ── Alert Events ──────────────────────────────────────────────────────────────

describe('Alert Events CRUD', () => {
  it('create', () => {
    alertEventId = randomUUID();
    const ev = alertEvents.create({
      id: alertEventId, alert_rule_id: alertRuleId, competitor_product_id: cpId,
      old_value: 8000, new_value: 7500, change_percent: -6.25,
    });
    assert.equal(ev.old_value, 8000);
    assert.equal(ev.new_value, 7500);
    assert.ok(Math.abs(ev.change_percent - (-6.25)) < 0.001);
    assert.equal(ev.acknowledged_at, null);
  });

  it('listByRule', () => {
    const list = alertEvents.listByRule(alertRuleId);
    assert.ok(list.some(e => e.id === alertEventId));
  });

  it('listByOrg', () => {
    const list = alertEvents.listByOrg(orgId);
    assert.ok(list.some(e => e.id === alertEventId));
  });

  it('acknowledge sets acknowledged_at', () => {
    const ev = alertEvents.acknowledge(alertEventId);
    assert.ok(ev.acknowledged_at !== null);
  });
});

// ── Platform Integrations (encryption) ───────────────────────────────────────

describe('Platform Integrations — encryption', () => {
  it('stores access_token as encrypted ciphertext (AC-8)', () => {
    const id = randomUUID();
    platformIntegrations.create({
      id, org_id: orgId, platform: 'shopify',
      access_token: 'shpat_plaintext_token_123',
      shop_domain: 'mystore.myshopify.com',
    });
    const raw = getDb().prepare(`SELECT access_token_encrypted FROM platform_integrations WHERE id = ?`).get(id);
    assert.ok(raw.access_token_encrypted !== null, 'token should be stored');
    assert.ok(raw.access_token_encrypted !== 'shpat_plaintext_token_123', 'token must not be plaintext');
    assert.ok(raw.access_token_encrypted.includes(':'), 'stored value should be iv:tag:ciphertext format');
  });

  it('getByIdDecrypted returns original plaintext token', () => {
    const id = randomUUID();
    platformIntegrations.create({
      id, org_id: orgId, platform: 'amazon',
      access_token: 'amzn_secret_token_xyz',
    });
    const decrypted = platformIntegrations.getByIdDecrypted(id);
    assert.equal(decrypted.access_token, 'amzn_secret_token_xyz');
  });

  it('null token stored as null', () => {
    const id = randomUUID();
    platformIntegrations.create({ id, org_id: orgId, platform: 'custom' });
    const raw = getDb().prepare(`SELECT access_token_encrypted FROM platform_integrations WHERE id = ?`).get(id);
    assert.equal(raw.access_token_encrypted, null);
  });
});

// ── Encryption unit tests ─────────────────────────────────────────────────────

describe('Encryption module', () => {
  it('encrypt/decrypt round-trips correctly', () => {
    const plain = 'super-secret-value';
    const cipher = encrypt(plain);
    assert.notEqual(cipher, plain);
    assert.ok(cipher.includes(':'));
    assert.equal(decrypt(cipher), plain);
  });

  it('returns null for null input', () => {
    assert.equal(encrypt(null), null);
    assert.equal(decrypt(null), null);
  });

  it('hashApiKey produces consistent hex output', () => {
    const hash1 = hashApiKey('my-api-key');
    const hash2 = hashApiKey('my-api-key');
    assert.equal(hash1, hash2);
    assert.equal(hash1.length, 64); // SHA-256 hex
    assert.notEqual(hashApiKey('different-key'), hash1);
  });
});

// ── API Keys ──────────────────────────────────────────────────────────────────

describe('API Keys', () => {
  it('create returns rawKey and record with key_hash', () => {
    const id = randomUUID();
    const { record, rawKey } = apiKeys.create({ id, org_id: orgId, label: 'CI/CD Key' });
    assert.ok(rawKey.startsWith('sk_'));
    assert.ok(record.key_hash);
    assert.notEqual(record.key_hash, rawKey);
    assert.equal(record.label, 'CI/CD Key');
  });

  it('key_hash is not the raw key (never stored in plaintext)', () => {
    const id = randomUUID();
    const { record, rawKey } = apiKeys.create({ id, org_id: orgId });
    assert.notEqual(record.key_hash, rawKey);
    assert.ok(!record.key_hash.startsWith('sk_'));
  });

  it('verify returns record for valid key', () => {
    const id = randomUUID();
    const { rawKey } = apiKeys.create({ id, org_id: orgId, label: 'Verify Test' });
    const found = apiKeys.verify(rawKey, orgId);
    assert.ok(found);
    assert.equal(found.id, id);
  });

  it('verify returns null for wrong key', () => {
    assert.equal(apiKeys.verify('sk_wrongkey', orgId), null);
  });

  it('listByOrg excludes key_hash column', () => {
    const list = apiKeys.listByOrg(orgId);
    assert.ok(list.length > 0);
    assert.ok(!('key_hash' in list[0]), 'key_hash should not be returned in list');
  });
});

// ── Referential integrity ─────────────────────────────────────────────────────

describe('Referential integrity (AC-3)', () => {
  it('rejects tracked_product with non-existent org_id', () => {
    assert.throws(() => {
      trackedProducts.create({
        id: randomUUID(), org_id: 'non-existent-org', name: 'Bad Product', our_price: 100,
      });
    });
  });

  it('rejects price_snapshot with non-existent competitor_product_id', () => {
    assert.throws(() => {
      priceSnapshots.create({
        id: randomUUID(), competitor_product_id: 'non-existent', price: 100,
      });
    });
  });
});

// ── Cascade deletes ───────────────────────────────────────────────────────────

describe('Cascade deletes', () => {
  it('deleting org cascades to tracked_products and competitors', () => {
    const oid = randomUUID();
    organizations.create({ id: oid, name: 'Temp Org' });
    const pid = randomUUID();
    trackedProducts.create({ id: pid, org_id: oid, name: 'Temp Product', our_price: 500 });
    const cid = randomUUID();
    competitors.create({ id: cid, org_id: oid, name: 'Temp Comp' });

    organizations.del(oid);

    assert.equal(trackedProducts.getById(pid), undefined);
    assert.equal(competitors.getById(cid), undefined);
  });

  it('deleting competitor cascades to competitor_products', () => {
    const oid = randomUUID();
    organizations.create({ id: oid, name: 'Temp2' });
    const uid = randomUUID();
    users.create({ id: uid, email: `u-${uid}@test.com`, hashed_password: 'x' });

    const pid = randomUUID();
    trackedProducts.create({ id: pid, org_id: oid, name: 'TP', our_price: 100 });
    const cid = randomUUID();
    competitors.create({ id: cid, org_id: oid, name: 'TC' });
    const cpid = randomUUID();
    competitorProducts.create({ id: cpid, competitor_id: cid, tracked_product_id: pid });

    competitors.del(cid);
    assert.equal(competitorProducts.getById(cpid), undefined);
  });
});
