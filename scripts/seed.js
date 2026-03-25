import { randomUUID } from 'crypto';
import { getDb } from '../src/db/init.js';
import * as users from '../src/db/users.js';
import * as competitors from '../src/db/competitors.js';
import * as products from '../src/db/products.js';
import * as competitorProducts from '../src/db/competitorProducts.js';
import * as priceObservations from '../src/db/priceObservations.js';
import * as alertRules from '../src/db/alertRules.js';

const db = getDb();

// Clear existing seed data in dependency order
db.exec(`
  DELETE FROM alert_rules;
  DELETE FROM price_observations;
  DELETE FROM competitor_products;
  DELETE FROM products;
  DELETE FROM competitors;
  DELETE FROM users;
`);

// 1 user
const userId = randomUUID();
users.create({
  id: userId,
  email: 'demo@example.com',
  hashed_password: '$2b$10$placeholderhashedpassword',
  plan_tier: 'pro',
});

// 2 competitors
const comp1Id = randomUUID();
const comp2Id = randomUUID();
competitors.create({ id: comp1Id, user_id: userId, name: 'ShopRival', website_url: 'https://shoprival.example.com', platform: 'shopify' });
competitors.create({ id: comp2Id, user_id: userId, name: 'MegaStore', website_url: 'https://megastore.example.com', platform: 'amazon' });

// 3 products (prices in cents)
const prod1Id = randomUUID();
const prod2Id = randomUUID();
const prod3Id = randomUUID();
products.create({ id: prod1Id, user_id: userId, name: 'Wireless Headphones', sku: 'WH-001', our_price: 7999, currency: 'USD', category: 'Electronics' });
products.create({ id: prod2Id, user_id: userId, name: 'Laptop Stand', sku: 'LS-002', our_price: 4999, currency: 'USD', category: 'Accessories' });
products.create({ id: prod3Id, user_id: userId, name: 'USB-C Hub', sku: 'UC-003', our_price: 3499, currency: 'USD', category: 'Accessories' });

// 6 competitor_products (2 competitors × 3 products)
const cp1Id = randomUUID(); // ShopRival × Headphones
const cp2Id = randomUUID(); // ShopRival × Laptop Stand
const cp3Id = randomUUID(); // ShopRival × USB-C Hub
const cp4Id = randomUUID(); // MegaStore × Headphones
const cp5Id = randomUUID(); // MegaStore × Laptop Stand
const cp6Id = randomUUID(); // MegaStore × USB-C Hub

competitorProducts.create({ id: cp1Id, competitor_id: comp1Id, product_id: prod1Id, external_url: 'https://shoprival.example.com/headphones', external_identifier: 'SR-WH-9' });
competitorProducts.create({ id: cp2Id, competitor_id: comp1Id, product_id: prod2Id, external_url: 'https://shoprival.example.com/laptop-stand', external_identifier: 'SR-LS-3' });
competitorProducts.create({ id: cp3Id, competitor_id: comp1Id, product_id: prod3Id, external_url: 'https://shoprival.example.com/usb-hub', external_identifier: 'SR-UC-7' });
competitorProducts.create({ id: cp4Id, competitor_id: comp2Id, product_id: prod1Id, external_url: 'https://megastore.example.com/dp/B001', external_identifier: 'B001WH' });
competitorProducts.create({ id: cp5Id, competitor_id: comp2Id, product_id: prod2Id, external_url: 'https://megastore.example.com/dp/B002', external_identifier: 'B002LS' });
competitorProducts.create({ id: cp6Id, competitor_id: comp2Id, product_id: prod3Id, external_url: 'https://megastore.example.com/dp/B003', external_identifier: 'B003UC' });

// 10+ price observations spread across competitor_products
const observations = [
  // ShopRival headphones — trending down
  { cp: cp1Id, price: 8199, sale: 0, daysAgo: 10 },
  { cp: cp1Id, price: 7999, sale: 0, daysAgo: 7 },
  { cp: cp1Id, price: 7499, sale: 1, daysAgo: 3 },
  // ShopRival laptop stand
  { cp: cp2Id, price: 5299, sale: 0, daysAgo: 8 },
  { cp: cp2Id, price: 4899, sale: 0, daysAgo: 2 },
  // ShopRival USB-C hub
  { cp: cp3Id, price: 3299, sale: 0, daysAgo: 5 },
  // MegaStore headphones — undercutting
  { cp: cp4Id, price: 7799, sale: 0, daysAgo: 9 },
  { cp: cp4Id, price: 7599, sale: 0, daysAgo: 4 },
  { cp: cp4Id, price: 7299, sale: 1, daysAgo: 1 },
  // MegaStore laptop stand
  { cp: cp5Id, price: 5099, sale: 0, daysAgo: 6 },
  { cp: cp5Id, price: 4799, sale: 1, daysAgo: 1 },
  // MegaStore USB-C hub
  { cp: cp6Id, price: 3599, sale: 0, daysAgo: 7 },
  { cp: cp6Id, price: 3399, sale: 0, daysAgo: 2 },
];

for (const obs of observations) {
  const date = new Date();
  date.setDate(date.getDate() - obs.daysAgo);
  priceObservations.create({
    id: randomUUID(),
    competitor_product_id: obs.cp,
    price: obs.price,
    currency: 'USD',
    was_on_sale: obs.sale,
    observed_at: date.toISOString(),
  });
}

// 2 alert rules
alertRules.create({
  id: randomUUID(),
  user_id: userId,
  product_id: prod1Id,
  rule_type: 'undercut',
  threshold_value: null,
  is_active: 1,
});
alertRules.create({
  id: randomUUID(),
  user_id: userId,
  product_id: prod2Id,
  rule_type: 'threshold',
  threshold_value: 4500,
  is_active: 1,
});

console.log('Seed complete:');
console.log('  1 user:', userId);
console.log('  2 competitors');
console.log('  3 products');
console.log('  6 competitor_products');
console.log(`  ${observations.length} price observations`);
console.log('  2 alert rules');
