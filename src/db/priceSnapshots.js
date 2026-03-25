import { getDb } from './init.js';

const VALID_STATUSES = ['in_stock', 'out_of_stock', 'discontinued'];

export function create({ id, competitor_product_id, price, currency = 'USD', availability_status = 'in_stock', scraped_at = null }) {
  if (!VALID_STATUSES.includes(availability_status)) {
    throw new Error(`Invalid availability_status "${availability_status}". Must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  const db = getDb();
  if (scraped_at) {
    db.prepare(
      `INSERT INTO price_snapshots (id, competitor_product_id, price, currency, availability_status, scraped_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, competitor_product_id, price, currency, availability_status, scraped_at);
  } else {
    db.prepare(
      `INSERT INTO price_snapshots (id, competitor_product_id, price, currency, availability_status)
       VALUES (?, ?, ?, ?, ?)`
    ).run(id, competitor_product_id, price, currency, availability_status);
  }
  return getById(id);
}

/**
 * Bulk insert many price snapshots in a single transaction.
 * Each item: { id, competitor_product_id, price, currency?, availability_status?, scraped_at? }
 */
export function bulkCreate(snapshots) {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO price_snapshots (id, competitor_product_id, price, currency, availability_status, scraped_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      stmt.run(
        row.id,
        row.competitor_product_id,
        row.price,
        row.currency ?? 'USD',
        row.availability_status ?? 'in_stock',
        row.scraped_at ?? new Date().toISOString()
      );
    }
  });
  insertMany(snapshots);
}

export function getById(id) {
  return getDb().prepare(`SELECT * FROM price_snapshots WHERE id = ?`).get(id);
}

export function getLatestByCompetitorProduct(competitor_product_id) {
  return getDb().prepare(
    `SELECT * FROM price_snapshots WHERE competitor_product_id = ?
     ORDER BY scraped_at DESC LIMIT 1`
  ).get(competitor_product_id);
}

export function listByCompetitorProduct(competitor_product_id, { limit = 100 } = {}) {
  return getDb().prepare(
    `SELECT * FROM price_snapshots WHERE competitor_product_id = ?
     ORDER BY scraped_at DESC LIMIT ?`
  ).all(competitor_product_id, limit);
}

export function listByOrg(org_id, { limit = 500 } = {}) {
  return getDb().prepare(`
    SELECT ps.* FROM price_snapshots ps
    JOIN competitor_products cp ON cp.id = ps.competitor_product_id
    JOIN competitors c ON c.id = cp.competitor_id
    WHERE c.org_id = ?
    ORDER BY ps.scraped_at DESC
    LIMIT ?
  `).all(org_id, limit);
}

export function del(id) {
  return getDb().prepare(`DELETE FROM price_snapshots WHERE id = ?`).run(id);
}
