import { getDb } from './init.js';

const VALID_RULE_TYPES = ['price_drop', 'price_increase', 'undercut', 'out_of_stock', 'new_competitor'];
const VALID_THRESHOLD_UNITS = ['percent', 'absolute'];

export function create({ id, org_id, tracked_product_id = null, rule_type, threshold_value = null, threshold_unit = null, is_enabled = 1 }) {
  if (!VALID_RULE_TYPES.includes(rule_type)) {
    throw new Error(`Invalid rule_type "${rule_type}". Must be one of: ${VALID_RULE_TYPES.join(', ')}`);
  }
  if (threshold_unit && !VALID_THRESHOLD_UNITS.includes(threshold_unit)) {
    throw new Error(`Invalid threshold_unit "${threshold_unit}". Must be one of: ${VALID_THRESHOLD_UNITS.join(', ')}`);
  }
  getDb().prepare(
    `INSERT INTO alert_rules (id, org_id, tracked_product_id, rule_type, threshold_value, threshold_unit, is_enabled)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, org_id, tracked_product_id, rule_type, threshold_value ?? null, threshold_unit ?? null, is_enabled ? 1 : 0);
  return getById(id);
}

export function getById(id) {
  return getDb().prepare(`SELECT * FROM alert_rules WHERE id = ?`).get(id);
}

export function listByOrg(org_id) {
  return getDb().prepare(
    `SELECT * FROM alert_rules WHERE org_id = ? ORDER BY created_at DESC`
  ).all(org_id);
}

export function listEnabledByOrg(org_id) {
  return getDb().prepare(
    `SELECT * FROM alert_rules WHERE org_id = ? AND is_enabled = 1 ORDER BY created_at DESC`
  ).all(org_id);
}

export function listByProduct(tracked_product_id) {
  return getDb().prepare(
    `SELECT * FROM alert_rules WHERE tracked_product_id = ? AND is_enabled = 1`
  ).all(tracked_product_id);
}

export function update(id, fields) {
  if (fields.rule_type && !VALID_RULE_TYPES.includes(fields.rule_type)) {
    throw new Error(`Invalid rule_type "${fields.rule_type}"`);
  }
  if (fields.threshold_unit && !VALID_THRESHOLD_UNITS.includes(fields.threshold_unit)) {
    throw new Error(`Invalid threshold_unit "${fields.threshold_unit}"`);
  }
  const allowed = ['rule_type', 'tracked_product_id', 'threshold_value', 'threshold_unit', 'is_enabled'];
  const entries = Object.entries(fields).filter(([k]) => allowed.includes(k));
  if (entries.length === 0) return getById(id);
  const now = new Date().toISOString();
  const setClause = [...entries.map(([k]) => `${k} = ?`), 'updated_at = ?'].join(', ');
  const values = [...entries.map(([, v]) => v), now];
  getDb().prepare(`UPDATE alert_rules SET ${setClause} WHERE id = ?`).run(...values, id);
  return getById(id);
}

export function del(id) {
  return getDb().prepare(`DELETE FROM alert_rules WHERE id = ?`).run(id);
}
