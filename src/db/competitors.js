import { getDb } from './init.js';

export function create({ id, user_id, name, website_url, platform = 'custom' }) {
  const db = getDb();
  db.prepare(
    `INSERT INTO competitors (id, user_id, name, website_url, platform) VALUES (?, ?, ?, ?, ?)`
  ).run(id, user_id, name, website_url ?? null, platform);
  return getById(id);
}

export function getById(id) {
  return getDb().prepare(`SELECT * FROM competitors WHERE id = ?`).get(id);
}

export function listByUser(user_id) {
  return getDb().prepare(`SELECT * FROM competitors WHERE user_id = ? ORDER BY created_at DESC`).all(user_id);
}

export function update(id, fields) {
  const allowed = ['name', 'website_url', 'platform'];
  const entries = Object.entries(fields).filter(([k]) => allowed.includes(k));
  if (entries.length === 0) return getById(id);
  const setClause = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([, v]) => v);
  getDb().prepare(`UPDATE competitors SET ${setClause} WHERE id = ?`).run(...values, id);
  return getById(id);
}

export function del(id) {
  return getDb().prepare(`DELETE FROM competitors WHERE id = ?`).run(id);
}
