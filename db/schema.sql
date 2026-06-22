-- ============================================================================
-- GROCERY MANAGEMENT APPLICATION — DATABASE SCHEMA
-- ============================================================================
-- Database Engine : MySQL 8.0
-- Normalization   : Third Normal Form (3NF)
-- Author          : Ayush Mishra
-- Description     : Complete DDL script for the Grocery Management System.
--                   Creates all 8 tables with PK/FK constraints, CHECK
--                   constraints, indexes, views, and sample DML operations.
-- ============================================================================

-- Use the target database
USE grocery_db;

-- ============================================================================
-- SECTION 1: TABLE CREATION (in dependency order)
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. CUSTOMER — Independent entity; no foreign key dependencies.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customer (
    customer_id     INT             AUTO_INCREMENT,
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL,
    phone           VARCHAR(15)     NOT NULL,
    address         VARCHAR(255)    DEFAULT NULL,
    registered_date DATE            NOT NULL DEFAULT (CURRENT_DATE),

    -- Constraints
    CONSTRAINT pk_customer          PRIMARY KEY (customer_id),
    CONSTRAINT uq_customer_email    UNIQUE (email),
    CONSTRAINT uq_customer_phone    UNIQUE (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────────────────
-- 2. CATEGORY — Independent entity; groups products by type.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS category (
    category_id     INT             AUTO_INCREMENT,
    category_name   VARCHAR(100)    NOT NULL,
    description     VARCHAR(255)    DEFAULT NULL,

    -- Constraints
    CONSTRAINT pk_category              PRIMARY KEY (category_id),
    CONSTRAINT uq_category_name         UNIQUE (category_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────────────────
-- 3. SUPPLIER — Independent entity; provides products to the store.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS supplier (
    supplier_id     INT             AUTO_INCREMENT,
    name            VARCHAR(100)    NOT NULL,
    contact_no      VARCHAR(15)     NOT NULL,
    address         VARCHAR(255)    DEFAULT NULL,

    -- Constraints
    CONSTRAINT pk_supplier              PRIMARY KEY (supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────────────────
-- 4. DELIVERY_AGENT — Independent entity; delivers orders to customers.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS delivery_agent (
    agent_id        INT             AUTO_INCREMENT,
    name            VARCHAR(100)    NOT NULL,
    phone           VARCHAR(15)     NOT NULL,
    vehicle_no      VARCHAR(20)     NOT NULL,

    -- Constraints
    CONSTRAINT pk_delivery_agent            PRIMARY KEY (agent_id),
    CONSTRAINT uq_delivery_agent_vehicle    UNIQUE (vehicle_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────────────────
-- 5. PRODUCT — Depends on CATEGORY and SUPPLIER.
--    Each product belongs to exactly one category and is supplied by one
--    supplier. Price and Stock must be non-negative.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product (
    product_id      INT             AUTO_INCREMENT,
    product_name    VARCHAR(150)    NOT NULL,
    price           DECIMAL(10,2)   NOT NULL,
    stock           INT             NOT NULL DEFAULT 0,
    category_id     INT             NOT NULL,
    supplier_id     INT             NOT NULL,

    -- Constraints
    CONSTRAINT pk_product               PRIMARY KEY (product_id),
    CONSTRAINT chk_product_price        CHECK (price >= 0),
    CONSTRAINT chk_product_stock        CHECK (stock >= 0),

    -- Foreign Keys
    --   RESTRICT: cannot delete a category/supplier that still has products
    --   CASCADE on UPDATE: if a category/supplier ID changes, propagate
    CONSTRAINT fk_product_category      FOREIGN KEY (category_id)
        REFERENCES category (category_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_product_supplier      FOREIGN KEY (supplier_id)
        REFERENCES supplier (supplier_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────────────────
-- 6. ORDER — Depends on CUSTOMER and DELIVERY_AGENT.
--    Agent_ID is nullable because an agent may not yet be assigned.
--    Total_Amount is a cached/derived field (denormalized for performance):
--      it equals SUM(order_item.quantity * order_item.price) for this order.
--    Note: `order` is a MySQL reserved word, so we backtick-quote it.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `order` (
    order_id        INT             AUTO_INCREMENT,
    order_date      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount    DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    status          VARCHAR(20)     NOT NULL DEFAULT 'Pending',
    customer_id     INT             NOT NULL,
    agent_id        INT             DEFAULT NULL,

    -- Constraints
    CONSTRAINT pk_order                 PRIMARY KEY (order_id),
    CONSTRAINT chk_order_total          CHECK (total_amount >= 0),

    -- Foreign Keys
    --   RESTRICT: cannot delete a customer who has orders
    --   SET NULL on agent delete: if an agent is removed, orders keep history
    CONSTRAINT fk_order_customer        FOREIGN KEY (customer_id)
        REFERENCES customer (customer_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_order_agent           FOREIGN KEY (agent_id)
        REFERENCES delivery_agent (agent_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────────────────
-- 7. ORDER_ITEM — Junction table between ORDER and PRODUCT.
--    Composite primary key (order_id, product_id) ensures a product appears
--    at most once per order (quantity handles multiples).
--    Price is stored here to capture the price at the time of purchase
--    (historical pricing), not the current product price.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_item (
    order_id        INT             NOT NULL,
    product_id      INT             NOT NULL,
    quantity        INT             NOT NULL,
    price           DECIMAL(10,2)   NOT NULL,

    -- Constraints
    CONSTRAINT pk_order_item            PRIMARY KEY (order_id, product_id),
    CONSTRAINT chk_order_item_qty       CHECK (quantity > 0),
    CONSTRAINT chk_order_item_price     CHECK (price >= 0),

    -- Foreign Keys
    --   CASCADE on order delete: if an order is deleted, its items go too
    --   RESTRICT on product delete: cannot delete a product that's been ordered
    CONSTRAINT fk_order_item_order      FOREIGN KEY (order_id)
        REFERENCES `order` (order_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_order_item_product    FOREIGN KEY (product_id)
        REFERENCES product (product_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────────────────
-- 8. PAYMENT — One-to-one relationship with ORDER.
--    The UNIQUE constraint on order_id enforces that each order has at most
--    one payment record.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment (
    payment_id      INT             AUTO_INCREMENT,
    order_id        INT             NOT NULL,
    amount          DECIMAL(12,2)   NOT NULL,
    payment_mode    VARCHAR(30)     NOT NULL,
    payment_status  VARCHAR(20)     NOT NULL DEFAULT 'Pending',
    payment_date    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT pk_payment               PRIMARY KEY (payment_id),
    CONSTRAINT uq_payment_order         UNIQUE (order_id),          -- enforces 1:1
    CONSTRAINT chk_payment_amount       CHECK (amount >= 0),
    CONSTRAINT chk_payment_mode         CHECK (payment_mode IN ('UPI', 'Card', 'COD', 'Net Banking')),
    CONSTRAINT chk_payment_status       CHECK (payment_status IN ('Pending', 'Completed', 'Failed', 'Refunded')),

    -- Foreign Keys
    --   CASCADE: if the order is deleted, its payment is deleted too
    CONSTRAINT fk_payment_order         FOREIGN KEY (order_id)
        REFERENCES `order` (order_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- SECTION 2: ALTER TABLE DEMONSTRATIONS
-- ============================================================================
-- These ALTER TABLE statements demonstrate schema modification after initial
-- table creation, as required by the project specification.

-- 2a. Add a composite index on order_item for faster product sales reporting.
--     This index supports queries that look up order items by product and then
--     aggregate quantity (e.g., top-selling products view).
ALTER TABLE order_item
    ADD INDEX idx_order_item_product_qty (product_id, quantity);

-- 2b. Add a CHECK constraint on order.status after table creation.
--     This ensures only valid status values can be stored.
ALTER TABLE `order`
    ADD CONSTRAINT chk_order_status
    CHECK (status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'));


-- ============================================================================
-- SECTION 3: INDEXES
-- ============================================================================
-- Indexes on foreign key columns and frequently filtered/searched columns.
-- MySQL automatically creates indexes for PRIMARY KEY and UNIQUE constraints,
-- and for FK columns in InnoDB. We add explicit indexes for query performance.

-- Order table indexes
CREATE INDEX idx_order_customer      ON `order` (customer_id);
CREATE INDEX idx_order_agent         ON `order` (agent_id);
CREATE INDEX idx_order_status        ON `order` (status);
CREATE INDEX idx_order_date          ON `order` (order_date);

-- Product table indexes
CREATE INDEX idx_product_category    ON product (category_id);
CREATE INDEX idx_product_supplier    ON product (supplier_id);
CREATE INDEX idx_product_name        ON product (product_name);

-- Customer table index (email is already UNIQUE/indexed)
CREATE INDEX idx_customer_name       ON customer (name);

-- Payment table index
CREATE INDEX idx_payment_status      ON payment (payment_status);
CREATE INDEX idx_payment_date        ON payment (payment_date);


-- ============================================================================
-- SECTION 4: VIEWS
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- View 1: vw_order_details
-- Shows comprehensive order information: customer details, item count,
-- total amount, payment status, and assigned delivery agent.
-- Useful for the Orders page and customer order history.
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_order_details AS
SELECT
    o.order_id,
    o.order_date,
    o.status                    AS order_status,
    o.total_amount,
    c.customer_id,
    c.name                      AS customer_name,
    c.email                     AS customer_email,
    COUNT(oi.product_id)        AS total_items,
    COALESCE(p.payment_status, 'No Payment')   AS payment_status,
    COALESCE(p.payment_mode, 'N/A')            AS payment_mode,
    COALESCE(da.name, 'Unassigned')            AS agent_name
FROM `order` o
    INNER JOIN customer c           ON o.customer_id = c.customer_id
    LEFT  JOIN order_item oi        ON o.order_id    = oi.order_id
    LEFT  JOIN payment p            ON o.order_id    = p.order_id
    LEFT  JOIN delivery_agent da    ON o.agent_id    = da.agent_id
GROUP BY
    o.order_id, o.order_date, o.status, o.total_amount,
    c.customer_id, c.name, c.email,
    p.payment_status, p.payment_mode, da.name;


-- ────────────────────────────────────────────────────────────────────────────
-- View 2: vw_product_stock
-- Shows each product with its category, supplier, and stock level.
-- Products with stock <= 10 are flagged as 'Low Stock'.
-- Useful for the Products page and low-stock dashboard alerts.
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_product_stock AS
SELECT
    p.product_id,
    p.product_name,
    p.price,
    p.stock,
    CASE
        WHEN p.stock = 0  THEN 'Out of Stock'
        WHEN p.stock <= 10 THEN 'Low Stock'
        ELSE 'In Stock'
    END                         AS stock_status,
    c.category_id,
    c.category_name,
    s.supplier_id,
    s.name                      AS supplier_name
FROM product p
    INNER JOIN category c       ON p.category_id = c.category_id
    INNER JOIN supplier s       ON p.supplier_id = s.supplier_id;


-- ────────────────────────────────────────────────────────────────────────────
-- View 3: vw_top_selling_products
-- Ranks products by total quantity sold across all orders.
-- Useful for business analytics and dashboard highlights.
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_top_selling_products AS
SELECT
    p.product_id,
    p.product_name,
    c.category_name,
    SUM(oi.quantity)            AS total_quantity_sold,
    SUM(oi.quantity * oi.price) AS total_revenue,
    COUNT(DISTINCT oi.order_id) AS number_of_orders
FROM product p
    INNER JOIN order_item oi    ON p.product_id  = oi.product_id
    INNER JOIN category c       ON p.category_id = c.category_id
GROUP BY p.product_id, p.product_name, c.category_name
ORDER BY total_quantity_sold DESC;


-- ────────────────────────────────────────────────────────────────────────────
-- View 4: vw_revenue_per_agent
-- Shows total revenue delivered by each delivery agent, along with the
-- number of orders they've handled and average order value.
-- Only counts orders that have been delivered (status = 'Delivered').
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_revenue_per_agent AS
SELECT
    da.agent_id,
    da.name                     AS agent_name,
    da.phone                    AS agent_phone,
    da.vehicle_no,
    COUNT(o.order_id)           AS total_deliveries,
    COALESCE(SUM(o.total_amount), 0)    AS total_revenue,
    COALESCE(AVG(o.total_amount), 0)    AS avg_order_value
FROM delivery_agent da
    LEFT JOIN `order` o         ON da.agent_id = o.agent_id
                                AND o.status = 'Delivered'
GROUP BY da.agent_id, da.name, da.phone, da.vehicle_no
ORDER BY total_revenue DESC;


-- ============================================================================
-- SECTION 5: SAMPLE DML STATEMENTS
-- ============================================================================
-- These are example operations demonstrating INSERT, UPDATE, and DELETE.
-- They are commented out to avoid conflicts with the seed data.
-- Uncomment and run individually in TablePlus to test.

-- ── INSERT examples ─────────────────────────────────────────────────────────

-- Insert a new customer
-- INSERT INTO customer (name, email, phone, address)
-- VALUES ('Test Customer', 'test@example.com', '9999999999', '123 Test Lane, Delhi');

-- Insert a new category
-- INSERT INTO category (category_name, description)
-- VALUES ('Organic', 'Certified organic grocery products');

-- ── UPDATE examples ─────────────────────────────────────────────────────────

-- Update a product's price (10% price increase)
-- UPDATE product SET price = price * 1.10 WHERE product_id = 1;

-- Mark an order as delivered and assign a delivery agent
-- UPDATE `order` SET status = 'Delivered', agent_id = 1 WHERE order_id = 1;

-- ── DELETE examples ─────────────────────────────────────────────────────────

-- Delete a customer (will fail with RESTRICT if customer has orders — expected)
-- DELETE FROM customer WHERE customer_id = 99;

-- Delete an order (cascades to order_items and payment)
-- DELETE FROM `order` WHERE order_id = 99;
