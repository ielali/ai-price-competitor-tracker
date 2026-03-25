-- Up
CREATE TABLE tracked_products (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  url TEXT,
  platform TEXT NOT NULL DEFAULT 'custom' CHECK (platform IN ('shopify', 'amazon', 'custom')),
  our_price INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE competitors (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT,
  platform TEXT NOT NULL DEFAULT 'custom' CHECK (platform IN ('shopify', 'amazon', 'custom')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE competitor_products (
  id TEXT PRIMARY KEY,
  competitor_id TEXT NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  tracked_product_id TEXT NOT NULL REFERENCES tracked_products(id) ON DELETE CASCADE,
  external_url TEXT,
  external_sku TEXT,
  last_scraped_at TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Down
DROP TABLE IF EXISTS competitor_products;
DROP TABLE IF EXISTS competitors;
DROP TABLE IF EXISTS tracked_products;
