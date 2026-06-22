# Normalization Analysis — Grocery Management System

> This document proves that every table in the `grocery_db` schema is normalized to **Third Normal Form (3NF)**. It identifies all functional dependencies, checks for violations, and documents one intentional denormalization with justification.

---

## Prerequisites: Normal Form Definitions

| Normal Form | Requirement |
|---|---|
| **1NF** | All columns contain atomic (indivisible) values; each row is unique (has a PK). |
| **2NF** | 1NF + No partial dependencies (every non-key attribute depends on the *entire* primary key). |
| **3NF** | 2NF + No transitive dependencies (non-key attributes depend *only* on the PK, not on other non-key attributes). |

---

## Table-by-Table Analysis

### 1. CUSTOMER

**Primary Key:** `customer_id`

**Functional Dependencies:**
```
customer_id → name, email, phone, address, registered_date
email       → customer_id  (candidate key — UNIQUE)
phone       → customer_id  (candidate key — UNIQUE)
```

| Check | Result | Reasoning |
|---|---|---|
| 1NF ✅ | All columns atomic, PK defined | name, email, phone, address are all scalar values |
| 2NF ✅ | Single-column PK | Partial dependency impossible with a single-column PK |
| 3NF ✅ | No transitive dependencies | No non-key attribute determines another non-key attribute |

---

### 2. CATEGORY

**Primary Key:** `category_id`

**Functional Dependencies:**
```
category_id   → category_name, description
category_name → category_id  (candidate key — UNIQUE)
```

| Check | Result | Reasoning |
|---|---|---|
| 1NF ✅ | Atomic values, PK defined | |
| 2NF ✅ | Single-column PK | |
| 3NF ✅ | No transitive dependencies | `description` depends only on `category_id` |

---

### 3. SUPPLIER

**Primary Key:** `supplier_id`

**Functional Dependencies:**
```
supplier_id → name, contact_no, address
```

| Check | Result | Reasoning |
|---|---|---|
| 1NF ✅ | Atomic values, PK defined | |
| 2NF ✅ | Single-column PK | |
| 3NF ✅ | No transitive dependencies | All attributes depend directly on the PK |

---

### 4. DELIVERY_AGENT

**Primary Key:** `agent_id`

**Functional Dependencies:**
```
agent_id   → name, phone, vehicle_no
vehicle_no → agent_id  (candidate key — UNIQUE)
```

| Check | Result | Reasoning |
|---|---|---|
| 1NF ✅ | Atomic values, PK defined | |
| 2NF ✅ | Single-column PK | |
| 3NF ✅ | No transitive dependencies | name and phone depend only on agent_id, not on vehicle_no transitively |

---

### 5. PRODUCT

**Primary Key:** `product_id`

**Functional Dependencies:**
```
product_id  → product_name, price, stock, category_id, supplier_id
category_id → category_name (but category_name is NOT stored in this table)
supplier_id → supplier name (but supplier name is NOT stored in this table)
```

| Check | Result | Reasoning |
|---|---|---|
| 1NF ✅ | Atomic values, PK defined | |
| 2NF ✅ | Single-column PK | |
| 3NF ✅ | No transitive dependencies | `category_id` and `supplier_id` are FKs (references), not transitive determinants. The category/supplier *names* are not stored here — they live in their own tables. |

> **Key 3NF Insight:** If we had stored `category_name` directly in the PRODUCT table, we would have a transitive dependency: `product_id → category_id → category_name`. By keeping category data in the CATEGORY table and using only the FK, we maintain 3NF.

---

### 6. ORDER

**Primary Key:** `order_id`

**Functional Dependencies:**
```
order_id    → order_date, total_amount, status, customer_id, agent_id
customer_id → customer name (NOT stored here — in CUSTOMER table)
agent_id    → agent name (NOT stored here — in DELIVERY_AGENT table)
```

| Check | Result | Reasoning |
|---|---|---|
| 1NF ✅ | Atomic values, PK defined | |
| 2NF ✅ | Single-column PK | |
| 3NF ✅ | No transitive dependencies | FKs reference other tables; no redundant non-key data |

> ⚠️ **Intentional Denormalization — `total_amount`**
>
> `total_amount` is a **derived/cached field**. Its value equals:
> ```sql
> SUM(order_item.quantity * order_item.price) WHERE order_item.order_id = this.order_id
> ```
>
> **Why this is technically a violation:** `total_amount` is functionally determined by the set of order_items, not solely by `order_id` in a strict sense — it's a calculated aggregate.
>
> **Why we accept it:**
> 1. **Performance:** Avoids expensive JOIN + SUM on every order list/display query. The dashboard, order listing, and reporting all need this value frequently.
> 2. **Historical accuracy:** Once an order is finalized, its total should be immutable even if product prices change later.
> 3. **Common industry practice:** E-commerce platforms (Amazon, Flipkart) universally cache order totals.
> 4. **Consistency maintained by application logic:** The backend calculates this value from order_items at order creation time and updates it atomically within a transaction.

---

### 7. ORDER_ITEM

**Primary Key:** `(order_id, product_id)` — Composite PK

**Functional Dependencies:**
```
(order_id, product_id) → quantity, price
order_id               → (order details — but stored in ORDER table, not here)
product_id             → (product details — but stored in PRODUCT table, not here)
```

| Check | Result | Reasoning |
|---|---|---|
| 1NF ✅ | Atomic values, composite PK defined | |
| 2NF ✅ | No partial dependencies | `quantity` depends on the *combination* of order+product (how many of this product in this order). `price` also depends on the combination (price at purchase time for this specific order). Neither depends on just `order_id` or just `product_id` alone. |
| 3NF ✅ | No transitive dependencies | `quantity` and `price` are independent of each other — neither determines the other |

> **Key 2NF Insight:** `price` here is the *historical purchase price*, not the current product price. It specifically captures "what price was this product sold at in this order" — a fact that requires both `order_id` and `product_id` to determine.

---

### 8. PAYMENT

**Primary Key:** `payment_id`
**Candidate Key:** `order_id` (UNIQUE constraint — enforces 1:1 with ORDER)

**Functional Dependencies:**
```
payment_id → order_id, amount, payment_mode, payment_status, payment_date
order_id   → payment_id, amount, payment_mode, payment_status, payment_date  (candidate key)
```

| Check | Result | Reasoning |
|---|---|---|
| 1NF ✅ | Atomic values, PK defined | |
| 2NF ✅ | Single-column PK | |
| 3NF ✅ | No transitive dependencies | All attributes depend directly on payment_id. The UNIQUE constraint on order_id makes it an alternate key, not a transitive dependency source. |

> **Design Decision — Why PAYMENT is a separate table (not merged into ORDER):**
> 1. An order may exist without a payment (e.g., COD orders await delivery).
> 2. Payment has its own lifecycle (Pending → Completed/Failed/Refunded) independent of order status.
> 3. Separating concerns follows the Single Responsibility Principle.
> 4. The 1:1 relationship is cleanly enforced via the UNIQUE constraint on `order_id`.

---

## Summary

| Table | PK Type | 1NF | 2NF | 3NF | Notes |
|---|---|---|---|---|---|
| CUSTOMER | Single | ✅ | ✅ | ✅ | |
| CATEGORY | Single | ✅ | ✅ | ✅ | |
| SUPPLIER | Single | ✅ | ✅ | ✅ | |
| DELIVERY_AGENT | Single | ✅ | ✅ | ✅ | |
| PRODUCT | Single | ✅ | ✅ | ✅ | FKs only — no redundant names |
| ORDER | Single | ✅ | ✅ | ✅ | `total_amount` is intentionally denormalized (justified above) |
| ORDER_ITEM | Composite | ✅ | ✅ | ✅ | `price` is a historical snapshot, not a partial dependency |
| PAYMENT | Single | ✅ | ✅ | ✅ | `order_id` UNIQUE enforces 1:1 |

**Conclusion:** All 8 tables satisfy Third Normal Form (3NF). The only denormalization (`ORDER.total_amount`) is a deliberate, justified caching optimization that does not compromise data integrity when maintained by application-level transaction logic.
