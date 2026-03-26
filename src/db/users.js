import { getDb } from './init.js';

export function create({ id, email, hashed_password, name = null, oauth_provider = null, oauth_provider_id = null }) {
  const now = new Date().toISOString();
  const trialStart = now;
  const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  getDb().prepare(`
    INSERT INTO users (id, email, hashed_password, name, oauth_provider, oauth_provider_id, trial_start_date, trial_end_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, email, hashed_password, name, oauth_provider, oauth_provider_id, trialStart, trialEnd, now, now);
  return getById(id);
}

export function getById(id) {
  return getDb().prepare(`SELECT * FROM users WHERE id = ?`).get(id);
}

export function getByEmail(email) {
  return getDb().prepare(`SELECT * FROM users WHERE email = ?`).get(email);
}

export function getByOAuth(provider, providerId) {
  return getDb().prepare(
    `SELECT * FROM users WHERE oauth_provider = ? AND oauth_provider_id = ?`
  ).get(provider, providerId);
}

export function getByVerificationToken(token) {
  return getDb().prepare(`SELECT * FROM users WHERE verification_token = ?`).get(token);
}

export function list() {
  return getDb().prepare(`SELECT * FROM users ORDER BY created_at DESC`).all();
}

export function update(id, fields) {
  const allowed = [
    'email', 'hashed_password', 'name',
    'email_verified', 'verification_token', 'verification_expires',
    'oauth_provider', 'oauth_provider_id',
    'trial_start_date', 'trial_end_date',
  ];
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
