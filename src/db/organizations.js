import { getDb } from './init.js';

const VALID_PLAN_TIERS = ['free_trial', 'basic', 'pro'];
const VALID_ROLES = ['owner', 'member'];

export function create({ id, name, plan_tier = 'free_trial', trial_ends_at = null }) {
  if (!VALID_PLAN_TIERS.includes(plan_tier)) {
    throw new Error(`Invalid plan_tier "${plan_tier}". Must be one of: ${VALID_PLAN_TIERS.join(', ')}`);
  }
  getDb().prepare(
    `INSERT INTO organizations (id, name, plan_tier, trial_ends_at) VALUES (?, ?, ?, ?)`
  ).run(id, name, plan_tier, trial_ends_at);
  return getById(id);
}

export function getById(id) {
  return getDb().prepare(`SELECT * FROM organizations WHERE id = ?`).get(id);
}

export function list() {
  return getDb().prepare(`SELECT * FROM organizations ORDER BY created_at DESC`).all();
}

export function update(id, fields) {
  const allowed = ['name', 'plan_tier', 'trial_ends_at'];
  if (fields.plan_tier && !VALID_PLAN_TIERS.includes(fields.plan_tier)) {
    throw new Error(`Invalid plan_tier "${fields.plan_tier}"`);
  }
  const entries = Object.entries(fields).filter(([k]) => allowed.includes(k));
  if (entries.length === 0) return getById(id);
  const setClause = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([, v]) => v);
  getDb().prepare(`UPDATE organizations SET ${setClause} WHERE id = ?`).run(...values, id);
  return getById(id);
}

export function del(id) {
  return getDb().prepare(`DELETE FROM organizations WHERE id = ?`).run(id);
}

export function addMember({ org_id, user_id, role = 'member' }) {
  if (!VALID_ROLES.includes(role)) {
    throw new Error(`Invalid role "${role}". Must be one of: ${VALID_ROLES.join(', ')}`);
  }
  getDb().prepare(
    `INSERT INTO organization_members (org_id, user_id, role) VALUES (?, ?, ?)`
  ).run(org_id, user_id, role);
  return getMember(org_id, user_id);
}

export function getMember(org_id, user_id) {
  return getDb().prepare(
    `SELECT * FROM organization_members WHERE org_id = ? AND user_id = ?`
  ).get(org_id, user_id);
}

export function listMembers(org_id) {
  return getDb().prepare(
    `SELECT om.*, u.email, u.name FROM organization_members om
     JOIN users u ON u.id = om.user_id
     WHERE om.org_id = ? ORDER BY om.joined_at ASC`
  ).all(org_id);
}

export function listByUser(user_id) {
  return getDb().prepare(
    `SELECT o.* FROM organizations o
     JOIN organization_members om ON om.org_id = o.id
     WHERE om.user_id = ? ORDER BY o.created_at DESC`
  ).all(user_id);
}

export function removeMember(org_id, user_id) {
  return getDb().prepare(
    `DELETE FROM organization_members WHERE org_id = ? AND user_id = ?`
  ).run(org_id, user_id);
}
