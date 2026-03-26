import { getDb } from './init.js';

export function create({ id, alert_rule_id, competitor_product_id, old_value = null, new_value = null, change_percent = null, triggered_at = null }) {
  const db = getDb();
  // Always pass triggered_at explicitly to avoid duplicated SQL branches
  db.prepare(
    `INSERT INTO alert_events (id, alert_rule_id, competitor_product_id, old_value, new_value, change_percent, triggered_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, alert_rule_id, competitor_product_id, old_value, new_value, change_percent,
    triggered_at ?? new Date().toISOString());
  return getById(id);
}

export function getById(id) {
  return getDb().prepare(`SELECT * FROM alert_events WHERE id = ?`).get(id);
}

export function listByRule(alert_rule_id, { limit = 100 } = {}) {
  return getDb().prepare(
    `SELECT * FROM alert_events WHERE alert_rule_id = ? ORDER BY triggered_at DESC LIMIT ?`
  ).all(alert_rule_id, limit);
}

export function listByOrg(org_id, { limit = 100 } = {}) {
  return getDb().prepare(`
    SELECT ae.* FROM alert_events ae
    JOIN alert_rules ar ON ar.id = ae.alert_rule_id
    WHERE ar.org_id = ?
    ORDER BY ae.triggered_at DESC
    LIMIT ?
  `).all(org_id, limit);
}

export function acknowledge(id) {
  const now = new Date().toISOString();
  getDb().prepare(`UPDATE alert_events SET acknowledged_at = ? WHERE id = ?`).run(now, id);
  return getById(id);
}

export function del(id) {
  return getDb().prepare(`DELETE FROM alert_events WHERE id = ?`).run(id);
}
