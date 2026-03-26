import { getDb } from './init.js';

export function create({ id, email, hashed_password, name = null }) {
  getDb().prepare(
    `INSERT INTO users (id, email, hashed_password, name) VALUES (?, ?, ?, ?)`
  ).run(id, email, hashed_password, name);
  return getById(id);
}

export function getById(id) {
  return getDb().prepare(`SELECT * FROM users WHERE id = ?`).get(id);
}

export function getByEmail(email) {
  return getDb().prepare(`SELECT * FROM users WHERE email = ?`).get(email);
}

export function list() {
  return getDb().prepare(`SELECT * FROM users ORDER BY created_at DESC`).all();
}

export function update(id, fields) {
  const allowed = ['email', 'hashed_password', 'name'];
  const entries = Object.entries(fields).filter(([k]) => allowed.includes(k));
  if (entries.length === 0) return getById(id);
  const now = new Date().toISOString();
  const setClause = [...entries.map(([k]) => `${k} = ?`), 'updated_at = ?'].join(', ');
  const values = [...entries.map(([, v]) => v), now];
  getDb().prepare(`UPDATE users SET ${setClause} WHERE id = ?`).run(...values, id);
  return getById(id);
}

export function del(id) {
  return getDb().prepare(`DELETE FROM users WHERE id = ?`).run(id);
}
