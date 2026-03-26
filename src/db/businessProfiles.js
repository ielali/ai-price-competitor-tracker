import { getDb } from './init.js';

export function create({ id, user_id, business_name = null, business_type = null, primary_platform = null }) {
  const now = new Date().toISOString();
  getDb().prepare(`
    INSERT INTO business_profiles (id, user_id, business_name, business_type, primary_platform, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, user_id, business_name, business_type, primary_platform, now, now);
  return getByUserId(user_id);
}

export function getByUserId(user_id) {
  return getDb().prepare(`SELECT * FROM business_profiles WHERE user_id = ?`).get(user_id);
}

export function getById(id) {
  return getDb().prepare(`SELECT * FROM business_profiles WHERE id = ?`).get(id);
}

export function update(user_id, fields) {
  const allowed = ['business_name', 'business_type', 'primary_platform'];
  const entries = Object.entries(fields).filter(([k]) => allowed.includes(k));
  if (entries.length === 0) return getByUserId(user_id);
  const now = new Date().toISOString();
  const setClause = [...entries.map(([k]) => `${k} = ?`), 'updated_at = ?'].join(', ');
  const values = [...entries.map(([, v]) => v), now];
  getDb().prepare(`UPDATE business_profiles SET ${setClause} WHERE user_id = ?`).run(...values, user_id);
  return getByUserId(user_id);
}

export function upsert({ id, user_id, business_name = null, business_type = null, primary_platform = null }) {
  const existing = getByUserId(user_id);
  if (existing) {
    return update(user_id, { business_name, business_type, primary_platform });
  }
  return create({ id, user_id, business_name, business_type, primary_platform });
}
