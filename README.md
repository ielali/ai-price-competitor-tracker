# AI Competitor Price Tracker

A Node.js/Express REST API for monitoring competitor pricing in real time. Track competitors, map their products to yours, record price observations, and define alert rules to stay ahead of market changes.

## Features

- **Competitor management** — store competitor details including website URL and platform (Shopify, Amazon, custom, etc.)
- **Product tracking** — manage your own product catalog with SKUs, prices, and categories
- **Competitor product mapping** — link each competitor's product listing to your own products
- **Price observations** — record historical competitor prices with sale flags and timestamps
- **Alert rules** — configure `undercut`, `threshold`, `price_drop`, and `price_increase` alerts per product
- **SQLite backend** — lightweight, file-based database with WAL mode and foreign key enforcement
- **Cascade deletes** — deleting a user automatically removes all related competitors, products, and observations

## Requirements

- Node.js 18+
- npm

## Installation

```bash
npm install
```

## Configuration

Copy the example environment file and edit as needed:

```bash
cp .env.example .env
```

| Variable        | Default             | Description                          |
|-----------------|---------------------|--------------------------------------|
| `PORT`          | `3000`              | Port the HTTP server listens on      |
| `DATABASE_PATH` | `./data/prices.db`  | Path to the SQLite database file     |

## Usage

### Start the server

```bash
npm start
```

The server starts on `http://localhost:3000` (or the configured port).

### Seed the database

Populate the database with sample data (1 user, 2 competitors, 3 products, 13 price observations, 2 alert rules):

```bash
npm run seed
```

### Run tests

```bash
npm test
```

Tests use Node.js's built-in test runner (`node:test`) and an in-memory SQLite database — no external services needed.

## API Endpoints

### `GET /health`

Returns server and database health status.

**Response `200 OK`:**
```json
{
  "status": "ok",
  "db": "connected"
}
```

**Response `503 Service Unavailable`** (database unreachable):
```json
{
  "status": "error",
  "db": "disconnected"
}
```

## Database Schema

The SQLite database is initialized automatically on first run with migrations applied via `src/db/init.js`.

```
users
  id            TEXT  PRIMARY KEY
  email         TEXT  UNIQUE NOT NULL
  hashed_password TEXT NOT NULL
  plan_tier     TEXT  DEFAULT 'free'
  created_at    TEXT  DEFAULT datetime('now')

competitors
  id            TEXT  PRIMARY KEY
  user_id       TEXT  → users(id) ON DELETE CASCADE
  name          TEXT  NOT NULL
  website_url   TEXT
  platform      TEXT  DEFAULT 'custom'   -- e.g. shopify, amazon, custom
  created_at    TEXT  DEFAULT datetime('now')

products
  id            TEXT     PRIMARY KEY
  user_id       TEXT     → users(id) ON DELETE CASCADE
  name          TEXT     NOT NULL
  sku           TEXT
  our_price     INTEGER  NOT NULL         -- stored in cents, e.g. 7999 = $79.99
  currency      TEXT     DEFAULT 'USD'
  category      TEXT
  created_at    TEXT     DEFAULT datetime('now')

competitor_products
  id                   TEXT  PRIMARY KEY
  competitor_id        TEXT  → competitors(id) ON DELETE CASCADE
  product_id           TEXT  → products(id)   ON DELETE CASCADE
  external_url         TEXT                    -- URL on competitor's site
  external_identifier  TEXT                    -- competitor's SKU / listing ID
  last_checked_at      TEXT                    -- ISO timestamp of last scrape

price_observations
  id                    TEXT     PRIMARY KEY
  competitor_product_id TEXT     → competitor_products(id) ON DELETE CASCADE
  price                 INTEGER  NOT NULL      -- stored in cents
  currency              TEXT     DEFAULT 'USD'
  was_on_sale           INTEGER  DEFAULT 0     -- 1 = on sale, 0 = regular price
  observed_at           TEXT     DEFAULT datetime('now')

alert_rules
  id              TEXT     PRIMARY KEY
  user_id         TEXT     → users(id)    ON DELETE CASCADE
  product_id      TEXT     → products(id) ON DELETE CASCADE
  rule_type       TEXT     NOT NULL       -- undercut | threshold | price_drop | price_increase
  threshold_value INTEGER                 -- relevant for threshold rules (in cents)
  is_active       INTEGER  DEFAULT 1      -- 1 = active, 0 = disabled
  created_at      TEXT     DEFAULT datetime('now')
```

Prices are stored as integers in **cents** (e.g. `7999` = $79.99).

### Indexes

The following indexes are created automatically for query performance:

| Index                    | Table                 | Column                |
|--------------------------|-----------------------|-----------------------|
| `idx_competitors_user`   | competitors           | user_id               |
| `idx_products_user`      | products              | user_id               |
| `idx_cp_competitor`      | competitor_products   | competitor_id         |
| `idx_cp_product`         | competitor_products   | product_id            |
| `idx_observations_cp`    | price_observations    | competitor_product_id |
| `idx_observations_time`  | price_observations    | observed_at           |
| `idx_alerts_user`        | alert_rules           | user_id               |
| `idx_alerts_product`     | alert_rules           | product_id            |

## Data Layer

Each entity has its own module under `src/db/` exposing a consistent CRUD interface:

| Module                      | Exports                                                                 |
|-----------------------------|-------------------------------------------------------------------------|
| `src/db/users.js`           | `create`, `getById`, `getByEmail`, `listByUser`, `update`, `del`        |
| `src/db/competitors.js`     | `create`, `getById`, `listByUser`, `update`, `del`                      |
| `src/db/products.js`        | `create`, `getById`, `listByUser`, `update`, `del`                      |
| `src/db/competitorProducts.js` | `create`, `getById`, `listByUser`, `listByCompetitor`, `listByProduct`, `update`, `del` |
| `src/db/priceObservations.js` | `create`, `getById`, `listByCompetitorProduct`, `listByUser`, `update`, `del` |
| `src/db/alertRules.js`      | `create`, `getById`, `listByUser`, `listByProduct`, `update`, `del`     |

### Alert rule types

| `rule_type`      | Description                                                          |
|------------------|----------------------------------------------------------------------|
| `undercut`       | Fire when a competitor's price drops below your price               |
| `threshold`      | Fire when a competitor's price drops below a fixed `threshold_value` |
| `price_drop`     | Fire on any decrease in a competitor's observed price               |
| `price_increase` | Fire on any increase in a competitor's observed price               |

## Project Structure

```
.
├── src/
│   ├── index.js          # Entry point — starts the HTTP server
│   ├── app.js            # Express app and route definitions
│   ├── config/
│   │   └── env.js        # Environment variable exports
│   ├── db/
│   │   ├── init.js       # Database connection, WAL/FK setup, and migrations
│   │   ├── users.js
│   │   ├── competitors.js
│   │   ├── products.js
│   │   ├── competitorProducts.js
│   │   ├── priceObservations.js
│   │   └── alertRules.js
│   └── tests/
│       ├── health.test.js  # HTTP health endpoint tests
│       └── db.test.js      # Full CRUD + constraint tests (in-memory SQLite)
├── scripts/
│   └── seed.js           # Database seed script
├── data/                 # SQLite database files (git-ignored)
├── .env.example
└── package.json
```
