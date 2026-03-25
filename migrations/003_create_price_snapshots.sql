-- Up
CREATE TABLE price_snapshots (
  id TEXT PRIMARY KEY,
  competitor_product_id TEXT NOT NULL REFERENCES competitor_products(id) ON DELETE CASCADE,
  price INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  availability_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (availability_status IN ('in_stock', 'out_of_stock', 'discontinued')),
  scraped_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Down
DROP TABLE IF EXISTS price_snapshots;
