import { getDb } from './init.js';

const VALID_RULE_TYPES = ['price_drop', 'price_increase', 'undercut', 'threshold'];

export function create({ id, user_id, product_id, rule_type, threshold_value, is_active = 1 }) {
  if (!VALID_RULE_TYPES.includes(rule_type)) {
    throw new Error(`Invalid rule_type "${rule_type}". Must be one of: ${VALID_RULE_TYPES.join(', ')}`);
  }
  const db = getDb();
  db.prepare(
    `INSERT INTO alert_rules (id, user_id, product_id, rule_type, threshold_value, is_active) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, user_id, product_id, rule_type, threshold_value ?? null, is_active ? 1 : 0);
  return getById(id);
}

export function getById(id) {
  return getDb().prepare(`SELECT * FROM alert_rules WHERE id = ?`).get(id);
}

export function listByUser(user_id) {
  return getDb().prepare(`SELECT * FROM alert_rules WHERE user_id = ? ORDER BY created_at DESC`).all(user_id);
}

export function listByProduct(product_id) {
  return getDb().prepare(`SELECT * FROM alert_rules WHERE product_id = ? AND is_active = 1`).all(product_id);
}

export function update(id, fields) {
  if (fields.rule_type && !VALID_RULE_TYPES.includes(fields.rule_type)) {
    throw new Error(`Invalid rule_type "${fields.rule_type}". Must be one of: ${VALID_RULE_TYPES.join(', ')}`);
  }
  const allowed = ['rule_type', 'threshold_value', 'is_active'];
  const entries = Object.entries(fields).filter(([k]) => allowed.includes(k));
  if (entries.length === 0) return getById(id);
  const setClause = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([, v]) => v);
  getDb().prepare(`UPDATE alert_rules SET ${setClause} WHERE id = ?`).run(...values, id);
  return getById(id);
}

export function del(id) {
  return getDb().prepare(`DELETE FROM alert_rules WHERE id = ?`).run(id);
}
