-- Up

-- Add auth fields to users table
ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN verification_token TEXT;
ALTER TABLE users ADD COLUMN verification_expires TEXT;
ALTER TABLE users ADD COLUMN oauth_provider TEXT;
ALTER TABLE users ADD COLUMN oauth_provider_id TEXT;
ALTER TABLE users ADD COLUMN trial_start_date TEXT;
ALTER TABLE users ADD COLUMN trial_end_date TEXT;

-- Create business_profiles table
CREATE TABLE business_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT,
  business_type TEXT CHECK (business_type IN ('dropshipper', 'reseller', 'retailer', 'other')),
  primary_platform TEXT CHECK (primary_platform IN ('shopify', 'amazon', 'ebay', 'other')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create password_reset_tokens table
CREATE TABLE password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create request_logs table (used by metrics service)
CREATE TABLE IF NOT EXISTS request_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status INTEGER,
  duration_ms INTEGER,
  provider TEXT,
  model TEXT,
  stream INTEGER DEFAULT 0,
  key_id TEXT,
  error_type TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for auth tables
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_provider_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_user ON business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_request_logs_timestamp ON request_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_request_logs_error_type ON request_logs(error_type);

-- Down
DROP INDEX IF EXISTS idx_request_logs_error_type;
DROP INDEX IF EXISTS idx_request_logs_timestamp;
DROP INDEX IF EXISTS idx_password_reset_tokens_hash;
DROP INDEX IF EXISTS idx_password_reset_tokens_user;
DROP INDEX IF EXISTS idx_business_profiles_user;
DROP INDEX IF EXISTS idx_users_oauth;
DROP INDEX IF EXISTS idx_users_verification_token;
DROP TABLE IF EXISTS request_logs;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS business_profiles;
