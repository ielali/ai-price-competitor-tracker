# AI Competitor Price Tracker

A Node.js/Express REST API for monitoring competitor pricing in real time. Track competitors, map their products to yours, record price observations, and define alert rules to stay ahead of market changes.

## Features

- **Competitor management** — store competitor details including website URL and platform (Shopify, Amazon, custom, etc.)
- **Product tracking** — manage your own product catalog with SKUs, prices, and categories
- **Price observations** — record historical competitor prices with sale flags and timestamps
- **Alert rules** — configure undercut and threshold-based alerts per product
- **SQLite backend** — lightweight, file-based database with WAL mode and foreign key enforcement

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

The SQLite database is initialized automatically on first run.

```
users
  id, email, hashed_password, plan_tier, created_at

competitors
  id, user_id → users, name, website_url, platform, created_at

products
  id, user_id → users, name, sku, our_price (cents), currency, category, created_at

competitor_products
  id, competitor_id → competitors, product_id → products,
  external_url, external_identifier, last_checked_at

price_observations
  id, competitor_product_id → competitor_products,
  price (cents), currency, was_on_sale, observed_at

alert_rules
  id, user_id → users, product_id → products,
  rule_type (undercut | threshold), threshold_value (cents), is_active, created_at
```

Prices are stored as integers in **cents** (e.g. `7999` = $79.99).

## Project Structure

```
.
├── src/
│   ├── index.js          # Entry point — starts the HTTP server
│   ├── app.js            # Express app and route definitions
│   ├── config/
│   │   └── env.js        # Environment variable exports
│   ├── db/
│   │   ├── init.js       # Database connection and migrations
│   │   ├── users.js
│   │   ├── competitors.js
│   │   ├── products.js
│   │   ├── competitorProducts.js
│   │   ├── priceObservations.js
│   │   └── alertRules.js
│   └── tests/
│       ├── health.test.js
│       └── db.test.js
├── scripts/
│   └── seed.js           # Database seed script
├── data/                 # SQLite database files (git-ignored)
├── .env.example
└── package.json
```
