# Data Dictionary — Grocery Management System

> **Database:** `grocery_db` &nbsp;|&nbsp; **Engine:** MySQL 8.0 (InnoDB) &nbsp;|&nbsp; **Charset:** utf8mb4

---

## 1. CUSTOMER

Stores registered customer information.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `customer_id` | INT | PK, AUTO_INCREMENT | Unique customer identifier |
| `name` | VARCHAR(100) | NOT NULL | Full name of the customer |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE | Email address (used for login/contact) |
| `phone` | VARCHAR(15) | NOT NULL, UNIQUE | Phone number |
| `address` | VARCHAR(255) | DEFAULT NULL | Delivery/residential address |
| `registered_date` | DATE | NOT NULL, DEFAULT CURRENT_DATE | Date customer registered in the system |

---

## 2. CATEGORY

Product categories for organizing the grocery inventory.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `category_id` | INT | PK, AUTO_INCREMENT | Unique category identifier |
| `category_name` | VARCHAR(100) | NOT NULL, UNIQUE | Name of the category (e.g., Dairy, Produce) |
| `description` | VARCHAR(255) | DEFAULT NULL | Brief description of the category |

---

## 3. SUPPLIER

Suppliers who provide products to the grocery store.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `supplier_id` | INT | PK, AUTO_INCREMENT | Unique supplier identifier |
| `name` | VARCHAR(100) | NOT NULL | Supplier company/business name |
| `contact_no` | VARCHAR(15) | NOT NULL | Primary contact phone number |
| `address` | VARCHAR(255) | DEFAULT NULL | Business address of the supplier |

---

## 4. DELIVERY_AGENT

Delivery personnel who transport orders to customers.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `agent_id` | INT | PK, AUTO_INCREMENT | Unique agent identifier |
| `name` | VARCHAR(100) | NOT NULL | Full name of the delivery agent |
| `phone` | VARCHAR(15) | NOT NULL | Agent's contact phone number |
| `vehicle_no` | VARCHAR(20) | NOT NULL, UNIQUE | Vehicle registration number (ensures one vehicle per agent) |

---

## 5. PRODUCT

Grocery products available for purchase. Each product belongs to one category and is supplied by one supplier.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `product_id` | INT | PK, AUTO_INCREMENT | Unique product identifier |
| `product_name` | VARCHAR(150) | NOT NULL | Name of the product |
| `price` | DECIMAL(10,2) | NOT NULL, CHECK (≥ 0) | Current selling price (₹) |
| `stock` | INT | NOT NULL, DEFAULT 0, CHECK (≥ 0) | Current quantity in inventory |
| `category_id` | INT | NOT NULL, FK → category | Category this product belongs to |
| `supplier_id` | INT | NOT NULL, FK → supplier | Supplier who provides this product |

**FK Behaviors:**
- `category_id`: ON DELETE RESTRICT, ON UPDATE CASCADE
- `supplier_id`: ON DELETE RESTRICT, ON UPDATE CASCADE

---

## 6. ORDER

Customer orders. Each order belongs to one customer and may be assigned to a delivery agent.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `order_id` | INT | PK, AUTO_INCREMENT | Unique order identifier |
| `order_date` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp when order was placed |
| `total_amount` | DECIMAL(12,2) | NOT NULL, DEFAULT 0.00, CHECK (≥ 0) | Cached total = Σ(order_item.qty × price). Denormalized for performance. |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'Pending', CHECK IN (...) | Order lifecycle status: Pending, Confirmed, Shipped, Delivered, Cancelled |
| `customer_id` | INT | NOT NULL, FK → customer | Customer who placed the order |
| `agent_id` | INT | DEFAULT NULL, FK → delivery_agent | Assigned delivery agent (NULL if unassigned) |

**FK Behaviors:**
- `customer_id`: ON DELETE RESTRICT, ON UPDATE CASCADE
- `agent_id`: ON DELETE SET NULL, ON UPDATE CASCADE

---

## 7. ORDER_ITEM

Junction table between ORDER and PRODUCT. Each row represents one product line in an order.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `order_id` | INT | PK (composite), FK → order | Order this item belongs to |
| `product_id` | INT | PK (composite), FK → product | Product being ordered |
| `quantity` | INT | NOT NULL, CHECK (> 0) | Number of units ordered |
| `price` | DECIMAL(10,2) | NOT NULL, CHECK (≥ 0) | Price per unit at time of purchase (historical snapshot) |

**FK Behaviors:**
- `order_id`: ON DELETE CASCADE, ON UPDATE CASCADE
- `product_id`: ON DELETE RESTRICT, ON UPDATE CASCADE

> **Note:** `price` is stored here (not just on PRODUCT) because product prices may change over time. This captures the price the customer actually paid.

---

## 8. PAYMENT

Payment records for orders. Enforces a one-to-one relationship with ORDER via a UNIQUE constraint on `order_id`.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `payment_id` | INT | PK, AUTO_INCREMENT | Unique payment identifier |
| `order_id` | INT | NOT NULL, FK → order, UNIQUE | Associated order (UNIQUE enforces 1:1) |
| `amount` | DECIMAL(12,2) | NOT NULL, CHECK (≥ 0) | Payment amount (₹) |
| `payment_mode` | VARCHAR(30) | NOT NULL, CHECK IN (...) | Payment method: UPI, Card, COD, Net Banking |
| `payment_status` | VARCHAR(20) | NOT NULL, DEFAULT 'Pending', CHECK IN (...) | Status: Pending, Completed, Failed, Refunded |
| `payment_date` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp of the payment |

**FK Behaviors:**
- `order_id`: ON DELETE CASCADE, ON UPDATE CASCADE

---

## Relationship Summary

| Relationship | Cardinality | Enforcement |
|---|---|---|
| Customer → Order | 1:N | FK on `order.customer_id` (NOT NULL) |
| Order → Order_Item | 1:N | FK on `order_item.order_id` (NOT NULL, CASCADE) |
| Product → Order_Item | 1:N | FK on `order_item.product_id` (NOT NULL, RESTRICT) |
| Category → Product | 1:N | FK on `product.category_id` (NOT NULL, RESTRICT) |
| Supplier → Product | 1:N | FK on `product.supplier_id` (NOT NULL, RESTRICT) |
| Order → Payment | 1:1 | FK on `payment.order_id` (NOT NULL, UNIQUE) |
| Delivery_Agent → Order | 1:N | FK on `order.agent_id` (NULLABLE, SET NULL) |
