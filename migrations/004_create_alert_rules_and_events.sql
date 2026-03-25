-- Up
CREATE TABLE alert_rules (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tracked_product_id TEXT REFERENCES tracked_products(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('price_drop', 'price_increase', 'undercut', 'out_of_stock', 'new_competitor')),
  threshold_value INTEGER,
  threshold_unit TEXT CHECK (threshold_unit IS NULL OR threshold_unit IN ('percent', 'absolute')),
  is_enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE alert_events (
  id TEXT PRIMARY KEY,
  alert_rule_id TEXT NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
  competitor_product_id TEXT NOT NULL REFERENCES competitor_products(id) ON DELETE CASCADE,
  old_value INTEGER,
  new_value INTEGER,
  change_percent REAL,
  triggered_at TEXT NOT NULL DEFAULT (datetime('now')),
  acknowledged_at TEXT
);

-- Down
DROP TABLE IF EXISTS alert_events;
DROP TABLE IF EXISTS alert_rules;
