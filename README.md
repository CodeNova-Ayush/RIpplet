# 🛒 Grocery Management Application

A full-stack **Grocery Management System** built as a DBMS capstone project. Features a normalized MySQL database (3NF), Node.js/Express REST API, and a modern React frontend.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [TablePlus Connection](#tableplus-connection)
- [ER Diagram Description](#er-diagram-description)
- [Normalization (3NF)](#normalization-3nf)
- [Database Views](#database-views)
- [Indexes](#indexes)
- [Key SQL Queries](#key-sql-queries)
- [API Endpoints](#api-endpoints)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Database | MySQL 8.0 (Docker) |
| Backend | Node.js + Express + mysql2 |
| Frontend | React (Vite) |
| Container | Docker + Docker Compose |

---

## Project Structure

```
├── db/
│   ├── schema.sql                  # DDL: tables, constraints, views, indexes
│   ├── seed.sql                    # 100+ rows of realistic sample data
│   ├── queries.sql                 # Demonstrated queries (joins, subqueries, etc.)
│   ├── init/                       # Auto-mounted into MySQL container
│   │   ├── 01_schema.sql
│   │   └── 02_seed.sql
│   └── docs/
│       ├── data_dictionary.md      # Column-level documentation
│       └── normalization.md        # FD analysis + 3NF proof
├── backend/                        # Express REST API
├── frontend/                       # React (Vite) UI
├── docker-compose.yml
├── .env.example                    # Required environment variables
└── README.md
```

---

## Setup Instructions

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Node.js](https://nodejs.org/) v18+ with npm
- [TablePlus](https://tableplus.com/) (optional, for direct DB inspection)

### 1. Clone & Configure Environment

```bash
# Clone the repository
git clone <repo-url>
cd "Grocery Management DBMS Project"

# Create .env from template
cp .env.example .env
# Edit .env if you want to change default credentials
```

### 2. Start MySQL Database

```bash
# Start the MySQL container (schema + seed data auto-load on first run)
docker-compose up -d

# Verify the container is healthy
docker-compose ps

# Check logs if needed
docker-compose logs mysql
```

### 3. Start Backend API

```bash
cd backend
npm install
npm run dev
# API runs on http://localhost:5000
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
# UI runs on http://localhost:5173
```

### Reset Database

To drop and recreate the database with fresh data:

```bash
docker-compose down -v   # -v removes the named volume
docker-compose up -d     # Recreates with init scripts
```

---

## TablePlus Connection

| Field | Value |
|-------|-------|
| Host | `localhost` (or `127.0.0.1`) |
| Port | `3306` (or whatever `MYSQL_PORT` is set to in `.env`) |
| User | `grocery_user` |
| Password | `grocery_pass` |
| Database | `grocery_db` |

> You can also connect as `root` / `rootpassword` for admin access.

---

## ER Diagram Description

The system models a grocery store's operations with **8 entities**:

```
CUSTOMER ──(1:N)──> ORDER ──(1:N)──> ORDER_ITEM <──(N:1)── PRODUCT
                      │                                        │
                      │ (1:1)                          (N:1)   │   (N:1)
                      ▼                                        ▼         ▼
                   PAYMENT                               CATEGORY   SUPPLIER
                      
                DELIVERY_AGENT ──(1:N)──> ORDER
```

**Relationships:**
- One **Customer** places many **Orders** (1:N)
- One **Order** contains many **Order_Items** (1:N)
- One **Product** appears in many **Order_Items** (1:N)
- One **Category** contains many **Products** (1:N)
- One **Supplier** supplies many **Products** (1:N)
- One **Order** has exactly one **Payment** (1:1, enforced via UNIQUE on Payment.Order_ID)
- One **Delivery_Agent** delivers many **Orders** (1:N, nullable FK on Order.Agent_ID)

---

## Normalization (3NF)

All 8 tables are verified to be in **Third Normal Form**. See [`db/docs/normalization.md`](db/docs/normalization.md) for the complete functional dependency analysis.

**Key points:**
- No partial dependencies (2NF): composite PK in ORDER_ITEM — both `quantity` and `price` depend on the full composite key
- No transitive dependencies (3NF): category/supplier names are stored in their own tables, referenced only by FK
- **Intentional denormalization:** `ORDER.total_amount` is a cached aggregate field (SUM of line items). Justified for query performance and maintained atomically via transactions in the backend.

---

## Database Views

| View | Description |
|------|-------------|
| `vw_order_details` | Orders with customer info, item count, payment status, and delivery agent |
| `vw_product_stock` | Products with category, supplier, and stock status (In Stock / Low Stock / Out of Stock) |
| `vw_top_selling_products` | Products ranked by total quantity sold with revenue |
| `vw_revenue_per_agent` | Delivery agents with total deliveries, revenue, and avg order value |

---

## Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| `order` | `idx_order_customer` | customer_id | FK lookup |
| `order` | `idx_order_agent` | agent_id | FK lookup |
| `order` | `idx_order_status` | status | Filter by status |
| `order` | `idx_order_date` | order_date | Date range queries |
| `product` | `idx_product_category` | category_id | FK lookup + category filter |
| `product` | `idx_product_supplier` | supplier_id | FK lookup |
| `product` | `idx_product_name` | product_name | Product search |
| `customer` | `idx_customer_name` | name | Customer search |
| `payment` | `idx_payment_status` | payment_status | Filter by status |
| `payment` | `idx_payment_date` | payment_date | Date range queries |
| `order_item` | `idx_order_item_product_qty` | (product_id, quantity) | Product sales reporting |

---

## Key SQL Queries

See [`db/queries.sql`](db/queries.sql) for the full, commented query file.

| # | Category | Query | Description |
|---|----------|-------|-------------|
| 1.1 | JOIN | 4-table join | Full order details: Customer → Order → Item → Product |
| 1.2 | JOIN | 4-table join | Supplier product performance with revenue |
| 1.3 | JOIN | 5-table join | Orders with payment and delivery agent info |
| 2.1 | Subquery | Correlated | Customers spending above average order value |
| 2.2 | Subquery | NOT IN | Products never ordered |
| 2.3 | Subquery | Scalar | Customers who ordered the most expensive product |
| 3.1 | Aggregate | SUM | Total revenue per category |
| 3.2 | Aggregate | AVG | Average order value per customer |
| 3.3 | Aggregate | MAX/MIN | Products with highest/lowest stock |
| 3.4 | Aggregate | COUNT | Order count by status |
| 3.5 | Aggregate | Mixed | Overall business summary |
| 4.1 | GROUP BY/HAVING | — | Suppliers with revenue > ₹500 |
| 4.2 | GROUP BY/HAVING | — | Categories with 3+ products |
| 4.3 | GROUP BY/HAVING | — | Repeat customers (2+ orders) |
| 5.1 | View | vw_top_selling | Top products by units sold |
| 5.2 | View | vw_order_details | Orders with pending payment |
| 5.3 | View | vw_product_stock | Low stock products |
| 5.4 | View | vw_revenue_per_agent | Agent delivery performance |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Dashboard** | | |
| GET | `/api/dashboard/summary` | Summary stats (total orders, revenue, low stock, pending) |
| **Customers** | | |
| GET | `/api/customers` | List all customers |
| GET | `/api/customers/:id` | Get customer by ID |
| POST | `/api/customers` | Create new customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |
| GET | `/api/customers/:id/orders` | Get customer's order history |
| **Products** | | |
| GET | `/api/products` | List products (supports `?category_id=` filter) |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| **Categories** | | |
| GET | `/api/categories` | List all categories |
| GET | `/api/categories/:id` | Get category by ID |
| POST | `/api/categories` | Create new category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |
| **Suppliers** | | |
| GET | `/api/suppliers` | List all suppliers |
| GET | `/api/suppliers/:id` | Get supplier by ID |
| POST | `/api/suppliers` | Create new supplier |
| PUT | `/api/suppliers/:id` | Update supplier |
| DELETE | `/api/suppliers/:id` | Delete supplier |
| **Orders** | | |
| GET | `/api/orders` | List all orders |
| GET | `/api/orders/:id` | Get order with items |
| POST | `/api/orders` | Create order (with items, validates stock) |
| PUT | `/api/orders/:id` | Update order status/agent |
| DELETE | `/api/orders/:id` | Delete order (cascades) |

