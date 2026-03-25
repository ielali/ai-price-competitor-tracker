-- Up
CREATE INDEX IF NOT EXISTS idx_tracked_products_org_active ON tracked_products(org_id, is_active);
CREATE INDEX IF NOT EXISTS idx_competitor_products_tracked_active ON competitor_products(tracked_product_id, is_active);
CREATE INDEX IF NOT EXISTS idx_competitor_products_competitor ON competitor_products(competitor_id);
CREATE INDEX IF NOT EXISTS idx_price_snapshots_cp_scraped ON price_snapshots(competitor_product_id, scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_snapshots_scraped ON price_snapshots(scraped_at);
CREATE INDEX IF NOT EXISTS idx_alert_rules_org_enabled ON alert_rules(org_id, is_enabled);
CREATE INDEX IF NOT EXISTS idx_alert_rules_product ON alert_rules(tracked_product_id);
CREATE INDEX IF NOT EXISTS idx_alert_events_rule_triggered ON alert_events(alert_rule_id, triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_events_triggered ON alert_events(triggered_at);
CREATE INDEX IF NOT EXISTS idx_platform_integrations_org ON platform_integrations(org_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(org_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash_org ON api_keys(key_hash, org_id);

-- Down
DROP INDEX IF EXISTS idx_api_keys_hash_org;
DROP INDEX IF EXISTS idx_api_keys_hash;
DROP INDEX IF EXISTS idx_api_keys_org;
DROP INDEX IF EXISTS idx_platform_integrations_org;
DROP INDEX IF EXISTS idx_alert_events_triggered;
DROP INDEX IF EXISTS idx_alert_events_rule_triggered;
DROP INDEX IF EXISTS idx_alert_rules_product;
DROP INDEX IF EXISTS idx_alert_rules_org_enabled;
DROP INDEX IF EXISTS idx_price_snapshots_scraped;
DROP INDEX IF EXISTS idx_price_snapshots_cp_scraped;
DROP INDEX IF EXISTS idx_competitor_products_competitor;
DROP INDEX IF EXISTS idx_competitor_products_tracked_active;
DROP INDEX IF EXISTS idx_tracked_products_org_active;
