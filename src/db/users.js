import { getDb } from './init.js';

export function create({ id, email, hashed_password, plan_tier = 'free' }) {
  const db = getDb();
  db.prepare(
    `INSERT INTO users (id, email, hashed_password, plan_tier) VALUES (?, ?, ?, ?)`
  ).run(id, email, hashed_password, plan_tier);
  return getById(id);
}

export function getById(id) {
  return getDb().prepare(`SELECT * FROM users WHERE id = ?`).get(id);
}

export function getByEmail(email) {
  return getDb().prepare(`SELECT * FROM users WHERE email = ?`).get(email);
}

export function listByUser() {
  return getDb().prepare(`SELECT * FROM users ORDER BY created_at DESC`).all();
}

export function update(id, fields) {
  const allowed = ['email', 'hashed_password', 'plan_tier'];
  const entries = Object.entries(fields).filter(([k]) => allowed.includes(k));
  if (entries.length === 0) return getById(id);
  const setClause = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([, v]) => v);
  getDb().prepare(`UPDATE users SET ${setClause} WHERE id = ?`).run(...values, id);
  return getById(id);
}

export function del(id) {
  return getDb().prepare(`DELETE FROM users WHERE id = ?`).run(id);
}
