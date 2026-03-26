import { getDb } from './init.js';
import { createHash } from 'crypto';

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function create({ id, user_id, raw_token, expires_at }) {
  const token_hash = hashToken(raw_token);
  const now = new Date().toISOString();
  // Invalidate any existing unused tokens for this user
  getDb().prepare(
    `UPDATE password_reset_tokens SET used_at = ? WHERE user_id = ? AND used_at IS NULL`
  ).run(now, user_id);

  getDb().prepare(`
    INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, user_id, token_hash, expires_at, now);
  return getById(id);
}

export function getById(id) {
  return getDb().prepare(`SELECT * FROM password_reset_tokens WHERE id = ?`).get(id);
}

export function findByToken(raw_token) {
  const token_hash = hashToken(raw_token);
  return getDb().prepare(
    `SELECT * FROM password_reset_tokens WHERE token_hash = ? AND used_at IS NULL`
  ).get(token_hash);
}

export function markUsed(id) {
  const now = new Date().toISOString();
  getDb().prepare(`UPDATE password_reset_tokens SET used_at = ? WHERE id = ?`).run(now, id);
}
