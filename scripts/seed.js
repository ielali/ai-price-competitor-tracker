import { randomUUID } from 'crypto';
import { unlinkSync, existsSync } from 'fs';
import { getDb } from '../src/db/init.js';
import * as users from '../src/db/users.js';
import * as organizations from '../src/db/organizations.js';
import * as competitors from '../src/db/competitors.js';
import * as trackedProducts from '../src/db/trackedProducts.js';
import * as competitorProducts from '../src/db/competitorProducts.js';
import * as priceSnapshots from '../src/db/priceSnapshots.js';
import * as alertRules from '../src/db/alertRules.js';

// Delete existing DB file so migrations always run on a clean slate
const dbPath = process.env.DATABASE_PATH || './data/prices.db';
if (dbPath !== ':memory:' && existsSync(dbPath)) {
  if (process.env.NODE_ENV === 'production') {
    console.error('ERROR: Refusing to delete database in production. Set a non-production DATABASE_PATH or NODE_ENV.');
    process.exit(1);
  }
  unlinkSync(dbPath);
}

const db = getDb();

// Clear existing data in dependency order
db.exec(`
  DELETE FROM alert_events;
  DELETE FROM alert_rules;
  DELETE FROM price_snapshots;
  DELETE FROM competitor_products;
  DELETE FROM competitors;
  DELETE FROM tracked_products;
  DELETE FROM organization_members;
  DELETE FROM organizations;
  DELETE FROM users;
  DELETE FROM platform_integrations;
  DELETE FROM api_keys;
`);

// ── Users ─────────────────────────────────────────────────────────────────────
const aliceId = randomUUID();
const bobId = randomUUID();

users.create({ id: aliceId, email: 'alice@acme-electronics.example.com', hashed_password: '$2b$10$placeholderhashedpasswordalice', name: 'Alice Chen' });
users.create({ id: bobId,   email: 'bob@betagadgets.example.com',        hashed_password: '$2b$10$placeholderhashedpasswordbob',   name: 'Bob Smith' });

// ── Organizations ─────────────────────────────────────────────────────────────
const org1Id = randomUUID(); // Acme Electronics
const org2Id = randomUUID(); // Beta Gadgets

organizations.create({ id: org1Id, name: 'Acme Electronics', plan_tier: 'pro' });
organizations.create({ id: org2Id, name: 'Beta Gadgets',     plan_tier: 'basic' });

organizations.addMember({ org_id: org1Id, user_id: aliceId, role: 'owner' });
organizations.addMember({ org_id: org2Id, user_id: bobId,   role: 'owner' });

// ── Tracked Products (10 total: 5 per org) ────────────────────────────────────
const org1Products = [
  { id: randomUUID(), name: 'Wireless Headphones',  sku: 'WH-001', our_price: 7999,  platform: 'shopify' },
  { id: randomUUID(), name: 'Laptop Stand',          sku: 'LS-002', our_price: 4999,  platform: 'shopify' },
  { id: randomUUID(), name: 'USB-C Hub',             sku: 'UC-003', our_price: 3499,  platform: 'shopify' },
  { id: randomUUID(), name: 'Bluetooth Speaker',     sku: 'BS-004', our_price: 5999,  platform: 'amazon'  },
  { id: randomUUID(), name: 'Smart Watch',           sku: 'SW-005', our_price: 19999, platform: 'amazon'  },
];

const org2Products = [
  { id: randomUUID(), name: 'Wireless Keyboard',    sku: 'WK-101', our_price: 6999,  platform: 'shopify' },
  { id: randomUUID(), name: 'Gaming Mouse',          sku: 'GM-102', our_price: 4499,  platform: 'shopify' },
  { id: randomUUID(), name: 'Monitor Stand',         sku: 'MS-103', our_price: 3999,  platform: 'custom'  },
  { id: randomUUID(), name: 'Webcam',                sku: 'WC-104', our_price: 8999,  platform: 'amazon'  },
  { id: randomUUID(), name: 'LED Strip Lights',      sku: 'LL-105', our_price: 2499,  platform: 'amazon'  },
];

for (const p of org1Products) {
  trackedProducts.create({ ...p, org_id: org1Id, currency: 'USD' });
}
for (const p of org2Products) {
  trackedProducts.create({ ...p, org_id: org2Id, currency: 'USD' });
}

// ── Competitors (5 total: 3 for org1, 2 for org2) ────────────────────────────
const shopRivalId = randomUUID();
const megaStoreId = randomUUID();
const techBayId   = randomUUID();
const priceKingId = randomUUID();
const fastShopId  = randomUUID();

competitors.create({ id: shopRivalId, org_id: org1Id, name: 'ShopRival',  domain: 'shoprival.example.com',  platform: 'shopify' });
competitors.create({ id: megaStoreId, org_id: org1Id, name: 'MegaStore',  domain: 'megastore.example.com',  platform: 'amazon'  });
competitors.create({ id: techBayId,   org_id: org1Id, name: 'TechBay',    domain: 'techbay.example.com',    platform: 'custom'  });
competitors.create({ id: priceKingId, org_id: org2Id, name: 'PriceKing',  domain: 'priceking.example.com',  platform: 'shopify' });
competitors.create({ id: fastShopId,  org_id: org2Id, name: 'FastShop',   domain: 'fastshop.example.com',   platform: 'custom'  });

// ── Competitor Products ───────────────────────────────────────────────────────
// Org 1: 3 competitors × 5 products = 15 competitor_products
const org1CPs = [];
for (const comp of [shopRivalId, megaStoreId, techBayId]) {
  for (const prod of org1Products) {
    const cpId = randomUUID();
    competitorProducts.create({
      id: cpId,
      competitor_id: comp,
      tracked_product_id: prod.id,
      external_url: `https://example.com/product/${prod.sku.toLowerCase()}`,
      external_sku: `EXT-${prod.sku}`,
    });
    org1CPs.push(cpId);
  }
}

// Org 2: 2 competitors × 5 products = 10 competitor_products
const org2CPs = [];
for (const comp of [priceKingId, fastShopId]) {
  for (const prod of org2Products) {
    const cpId = randomUUID();
    competitorProducts.create({
      id: cpId,
      competitor_id: comp,
      tracked_product_id: prod.id,
      external_url: `https://example.com/product/${prod.sku.toLowerCase()}`,
      external_sku: `EXT-${prod.sku}`,
    });
    org2CPs.push(cpId);
  }
}

// ── Price Snapshots (500 total) ───────────────────────────────────────────────
// Distribute ~500 snapshots across 25 competitor_products (~20 each)
const allCPs = [...org1CPs, ...org2CPs]; // 25 entries
const snapshotsPerCP = Math.ceil(500 / allCPs.length); // ~20

const allSnapshots = [];
for (const cpId of allCPs) {
  for (let i = 0; i < snapshotsPerCP; i++) {
    const daysAgo = snapshotsPerCP - i;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    // Simulate slight price variation
    const basePrice = 5000 + Math.floor(Math.random() * 5000);
    const drift = Math.floor((Math.random() - 0.5) * 500 * i);
    const status = Math.random() < 0.05 ? 'out_of_stock' : 'in_stock';
    allSnapshots.push({
      id: randomUUID(),
      competitor_product_id: cpId,
      price: Math.max(100, basePrice + drift),
      currency: 'USD',
      availability_status: status,
      scraped_at: date.toISOString(),
    });
  }
}

priceSnapshots.bulkCreate(allSnapshots.slice(0, 500));

// ── Alert Rules (5 total) ─────────────────────────────────────────────────────
alertRules.create({
  id: randomUUID(), org_id: org1Id,
  tracked_product_id: org1Products[0].id,
  rule_type: 'undercut',
  threshold_value: 5, threshold_unit: 'percent',
});

alertRules.create({
  id: randomUUID(), org_id: org1Id,
  tracked_product_id: org1Products[1].id,
  rule_type: 'price_drop',
  threshold_value: 500, threshold_unit: 'absolute',
});

alertRules.create({
  id: randomUUID(), org_id: org1Id,
  // org-wide rule — no tracked_product_id
  rule_type: 'out_of_stock',
});

alertRules.create({
  id: randomUUID(), org_id: org2Id,
  tracked_product_id: org2Products[0].id,
  rule_type: 'price_increase',
  threshold_value: 10, threshold_unit: 'percent',
});

alertRules.create({
  id: randomUUID(), org_id: org2Id,
  rule_type: 'new_competitor',
});

console.log('Seed complete:');
console.log(`  2 organizations`);
console.log(`  2 users`);
console.log(`  ${org1Products.length + org2Products.length} tracked products`);
console.log(`  5 competitors`);
console.log(`  ${org1CPs.length + org2CPs.length} competitor_products`);
console.log(`  ${allSnapshots.slice(0, 500).length} price snapshots`);
console.log(`  5 alert rules`);
