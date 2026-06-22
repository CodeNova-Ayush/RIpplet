-- ============================================================================
-- GROCERY MANAGEMENT APPLICATION — SQL QUERY DEMONSTRATIONS
-- ============================================================================
-- This file contains all required query demonstrations for the DBMS viva.
-- Every query has:
--   1. A plain-English explanation of WHAT it does
--   2. WHY it's useful in a grocery store context
--   3. WHICH SQL concepts it demonstrates
--
-- Run these in TablePlus against grocery_db after schema + seed data are loaded.
-- ============================================================================

USE grocery_db;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CATEGORY 1: JOINS                                                     ║
-- ║  Joins combine rows from two or more tables based on a related column. ║
-- ║  INNER JOIN = only matching rows; LEFT JOIN = all from left + matches. ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ────────────────────────────────────────────────────────────────────────────
-- QUERY 1.1: Full Order Details (4-table INNER JOIN)
-- ────────────────────────────────────────────────────────────────────────────
-- WHAT: Shows every item in every order along with the customer who placed it
--       and the product name. Each row = one product line in one order.
--
-- WHY:  This is the most common query in any e-commerce system. When a
--       customer calls about their order, the support team needs to see
--       exactly what was ordered, quantities, and prices.
--
-- HOW:  We chain 4 tables together:
--       customer → order (via customer_id)
--       order → order_item (via order_id)
--       order_item → product (via product_id)
-- ────────────────────────────────────────────────────────────────────────────
SELECT
    c.name              AS customer_name,
    o.order_id,
    o.order_date,
    o.status            AS order_status,
    p.product_name,
    oi.quantity,
    oi.price            AS unit_price,
    (oi.quantity * oi.price) AS line_total,
    o.total_amount      AS order_total
FROM customer c
    INNER JOIN `order` o        ON c.customer_id  = o.customer_id
    INNER JOIN order_item oi    ON o.order_id     = oi.order_id
    INNER JOIN product p        ON oi.product_id  = p.product_id
ORDER BY o.order_id, p.product_name;
-- Expected: One row per product per order. For example, Order #1 by Aarav
-- will show 4 rows (Milk, Butter, Bread, NutriChoice).


-- ────────────────────────────────────────────────────────────────────────────
-- QUERY 1.2: Supplier Product Performance (4-table JOIN with LEFT JOIN)
-- ────────────────────────────────────────────────────────────────────────────
-- WHAT: For each supplier, shows all their products and how much revenue
--       each product generated from non-cancelled orders.
--
-- WHY:  Helps the store owner evaluate which suppliers are bringing in the
--       most revenue. Useful for renegotiating contracts or dropping
--       underperforming suppliers.
--
-- HOW:  supplier → product (INNER: every product has a supplier)
--       product → order_item (LEFT: some products may never have been ordered)
--       order_item → order (LEFT: to filter out cancelled orders)
--       We use LEFT JOIN on order_item so even unsold products appear with 0.
-- ────────────────────────────────────────────────────────────────────────────
SELECT
    s.name              AS supplier_name,
    p.product_name,
    p.price             AS current_price,
    COALESCE(SUM(oi.quantity), 0)            AS total_units_sold,
    COALESCE(SUM(oi.quantity * oi.price), 0) AS total_revenue
FROM supplier s
    INNER JOIN product p        ON s.supplier_id  = p.supplier_id
    LEFT  JOIN order_item oi    ON p.product_id   = oi.product_id
    LEFT  JOIN `order` o        ON oi.order_id    = o.order_id
                                AND o.status != 'Cancelled'
GROUP BY s.supplier_id, s.name, p.product_id, p.product_name, p.price
ORDER BY supplier_name, total_revenue DESC;
-- Expected: Every product listed under its supplier. COALESCE handles NULLs
-- for products with no sales, showing 0 instead of NULL.


-- ────────────────────────────────────────────────────────────────────────────
-- QUERY 1.3: Orders with Payment and Delivery Agent (5-table JOIN)
-- ────────────────────────────────────────────────────────────────────────────
-- WHAT: For each order, shows customer name, payment mode & status, and
--       which delivery agent is assigned (if any).
--
-- WHY:  This is the "order tracking" query. An operations manager would
--       use this to see: Who ordered? Is payment done? Who's delivering?
--
-- HOW:  order → customer (INNER: every order has a customer)
--       order → payment (LEFT: some orders may not have payment yet)
--       order → delivery_agent (LEFT: some orders have no agent assigned)
-- ────────────────────────────────────────────────────────────────────────────
SELECT
    o.order_id,
    c.name                          AS customer_name,
    o.order_date,
    o.total_amount,
    o.status                        AS order_status,
    COALESCE(pay.payment_mode, 'N/A')       AS payment_mode,
    COALESCE(pay.payment_status, 'No Payment') AS payment_status,
    COALESCE(da.name, 'Unassigned')         AS delivery_agent,
    COALESCE(da.vehicle_no, 'N/A')          AS vehicle_no
FROM `order` o
    INNER JOIN customer c           ON o.customer_id = c.customer_id
    LEFT  JOIN payment pay          ON o.order_id    = pay.order_id
    LEFT  JOIN delivery_agent da    ON o.agent_id    = da.agent_id
ORDER BY o.order_date DESC;
-- Expected: 20 rows (one per order). Pending orders show 'Unassigned' agent.
-- COALESCE replaces NULL with a readable default.


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CATEGORY 2: NESTED / SUBQUERIES                                       ║
-- ║  A subquery is a SELECT inside another SELECT. It can appear in WHERE,  ║
-- ║  HAVING, or FROM clauses. Used for comparisons against computed values. ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ────────────────────────────────────────────────────────────────────────────
-- QUERY 2.1: Customers Who Spent Above the Average Order Value
-- ────────────────────────────────────────────────────────────────────────────
-- WHAT: Finds customers whose TOTAL spending across all their orders is
--       greater than the average single-order value across all orders.
--
-- WHY:  Identifies high-value customers for loyalty programs or VIP offers.
--
-- HOW:  The subquery calculates the average order total across all orders.
--       The outer query groups by customer, sums their spending, and uses
--       HAVING to compare against that average.
--       This is a SCALAR SUBQUERY (returns one value) used in HAVING.
-- ────────────────────────────────────────────────────────────────────────────
SELECT
    c.customer_id,
    c.name,
    c.email,
    SUM(o.total_amount) AS total_spent
FROM customer c
    INNER JOIN `order` o ON c.customer_id = o.customer_id
WHERE o.status != 'Cancelled'
GROUP BY c.customer_id, c.name, c.email
HAVING total_spent > (
    -- Subquery: What is the average order value across all non-cancelled orders?
    SELECT AVG(total_amount)
    FROM `order`
    WHERE status != 'Cancelled'
)
ORDER BY total_spent DESC;
-- Expected: Customers who spent more than ~₹540 (the approximate average).


-- ────────────────────────────────────────────────────────────────────────────
-- QUERY 2.2: Products That Have NEVER Been Ordered
-- ────────────────────────────────────────────────────────────────────────────
-- WHAT: Finds products that exist in inventory but have never appeared in
--       any order_item record. These are dead stock.
--
-- WHY:  Dead inventory ties up capital. The store owner should consider
--       discounting or removing these products.
--
-- HOW:  The subquery gets all product_ids that appear in order_item.
--       The outer query selects products whose ID is NOT IN that list.
--       This is a SET SUBQUERY with NOT IN operator.
-- ────────────────────────────────────────────────────────────────────────────
SELECT
    p.product_id,
    p.product_name,
    p.price,
    p.stock,
    c.category_name
FROM product p
    INNER JOIN category c ON p.category_id = c.category_id
WHERE p.product_id NOT IN (
    -- Subquery: Which product_ids have been ordered at least once?
    SELECT DISTINCT product_id
    FROM order_item
)
ORDER BY p.product_name;
-- Expected: Products with no sales. If seed data covers all products,
-- this may return empty — that means all products are selling!


-- ────────────────────────────────────────────────────────────────────────────
-- QUERY 2.3: Customers Who Ordered the Most Expensive Product
-- ────────────────────────────────────────────────────────────────────────────
-- WHAT: Finds which customers purchased the single most expensive product
--       in the catalog (by current price).
--
-- WHY:  Useful for premium customer targeting or understanding who buys
--       high-ticket items.
--
-- HOW:  Inner subquery finds the product_id with the highest price.
--       Outer query traces back through order_item → order → customer
--       to find who ordered it. Uses DISTINCT to avoid duplicates if a
--       customer ordered it multiple times.
-- ────────────────────────────────────────────────────────────────────────────
SELECT DISTINCT
    c.customer_id,
    c.name,
    c.email
FROM customer c
    INNER JOIN `order` o      ON c.customer_id = o.customer_id
    INNER JOIN order_item oi  ON o.order_id    = oi.order_id
WHERE oi.product_id = (
    -- Subquery: What is the most expensive product?
    SELECT product_id
    FROM product
    ORDER BY price DESC
    LIMIT 1
);
-- Expected: Customers who ordered "India Gate Basmati Rice 5kg" (₹450, the
-- most expensive product in our seed data).


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CATEGORY 3: AGGREGATE FUNCTIONS                                       ║
-- ║  Aggregates compute a single value from a set of rows:                 ║
-- ║  SUM = total, COUNT = number, AVG = average, MAX/MIN = extremes        ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ────────────────────────────────────────────────────────────────────────────
-- QUERY 3.1: Total Revenue Per Category (SUM)
-- ────────────────────────────────────────────────────────────────────────────
-- WHAT: Calculates how much money each product category has generated.
--       Revenue = quantity × price for each order item, summed by category.
--
-- WHY:  Tells the store which categories are most profitable. Should we
--       expand Dairy? Cut back on Frozen Foods?
-- ────────────────────────────────────────────────────────────────────────────
SELECT
    c.category_name,
    SUM(oi.quantity * oi.price) AS total_revenue,
    SUM(oi.quantity)            AS total_units_sold
FROM category c
    INNER JOIN product p        ON c.category_id  = p.category_id
    INNER JOIN order_item oi    ON p.product_id   = oi.product_id
    INNER JOIN `order` o        ON oi.order_id    = o.order_id
WHERE o.status != 'Cancelled'
GROUP BY c.category_id, c.category_name
ORDER BY total_revenue DESC;
-- Expected: Categories like "Grains & Pulses" (Rice + Atta) will likely
-- top the list because they have the highest per-unit price.


-- ────────────────────────────────────────────────────────────────────────────
-- QUERY 3.2: Average Order Value Per Customer (AVG)
-- ────────────────────────────────────────────────────────────────────────────
-- WHAT: For each customer, shows how many orders they placed, what their
--       average order size was, and their total lifetime spending.
--
-- WHY:  Identifies high-value vs low-value customers. A customer with
--       high AVG order value is a premium shopper.
-- ────────────────────────────────────────────────────────────────────────────
SELECT
    c.name              AS customer_name,
    COUNT(o.order_id)   AS total_orders,
    AVG(o.total_amount) AS avg_order_value,
    SUM(o.total_amount) AS total_spent
FROM customer c
    INNER JOIN `order` o ON c.customer_id = o.customer_id
WHERE o.status != 'Cancelled'
GROUP BY c.customer_id, c.name
ORDER BY avg_order_value DESC;
-- Expected: Sneha Iyer likely has the highest avg (₹1180 order for Rice+Atta+Coffee).


-- ────────────────────────────────────────────────────────────────────────────
-- QUERY 3.3: Product with Highest and Lowest Stock (MAX, MIN)
-- ────────────────────────────────────────────────────────────────────────────
-- WHAT: Finds which product has the most units in stock and which has the
--       fewest. Simple but important for inventory management.
-- ────────────────────────────────────────────────────────────────────────────

-- Highest stock product
SELECT product_name, stock
FROM product
WHERE stock = (SELECT MAX(stock) FROM product);
-- Expected: "Fresh Tomatoes 1kg" with 200 units

-- Lowest stock product
SELECT product_name, stock
FROM product
WHERE stock = (SELECT MIN(stock) FROM product);
-- Expected: "McCain Smileys 450g" with 30 units


-- ────────────────────────────────────────────────────────────────────────────
-- QUERY 3.4: Total Number of Orders Per Status (COUNT)
-- ────────────────────────────────────────────────────────────────────────────
-- WHAT: Counts how many orders are in each status (Pending, Confirmed,
--       Shipped, Delivered, Cancelled).
--
-- WHY:  Gives an operational snapshot. Too many "Pending"? Warehouse is slow.
--       Too many "Cancelled"? Something's wrong with the customer experience.
-- ────────────────────────────────────────────────────────────────────────────
SELECT
    status,
    COUNT(*) AS order_count
FROM `order`
GROUP BY status
ORDER BY order_count DESC;
-- Expected: Delivered (10), Pending (4), Shipped (3), Confirmed (2), Cancelled (1)


-- ────────────────────────────────────────────────────────────────────────────
-- QUERY 3.5: Overall Business Summary (Multiple Aggregates in One Query)
-- ────────────────────────────────────────────────────────────────────────────
-- WHAT: A single query that gives a bird's-eye view of the entire business:
--       total customers, total orders, total revenue, average/max/min order.
--
-- WHY:  This is what a CEO dashboard would show. One glance = full picture.
-- ────────────────────────────────────────────────────────────────────────────
SELECT
    COUNT(DISTINCT c.customer_id)   AS total_customers,
    COUNT(DISTINCT o.order_id)      AS total_orders,
    SUM(o.total_amount)             AS total_revenue,
    AVG(o.total_amount)             AS avg_order_value,
    MAX(o.total_amount)             AS largest_order,
    MIN(o.total_amount)             AS smallest_order
FROM customer c
    LEFT JOIN `order` o ON c.customer_id = o.customer_id
WHERE o.status != 'Cancelled' OR o.status IS NULL;
-- Expected: ~15 customers, ~19 non-cancelled orders, revenue ~₹10K


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CATEGORY 4: GROUP BY / HAVING                                         ║
-- ║  GROUP BY groups rows that share a value into summary rows.            ║
-- ║  HAVING filters groups (like WHERE but for aggregated results).        ║
-- ║  Key difference: WHERE filters BEFORE grouping, HAVING filters AFTER.  ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ────────────────────────────────────────────────────────────────────────────
-- QUERY 4.1: Suppliers Whose Products Generated Revenue Above ₹500
-- ────────────────────────────────────────────────────────────────────────────
-- WHAT: Groups all order_items by supplier, sums up the revenue from each
--       supplier's products, then keeps only suppliers above ₹500.
--
-- WHY:  Identifies which suppliers are commercially significant. Suppliers
--       below ₹500 total revenue may not be worth the relationship overhead.
--
-- HOW:  GROUP BY supplier_id → SUM revenue → HAVING filters the groups.
--       HAVING is needed because we can't use WHERE on an aggregate (SUM).
-- ────────────────────────────────────────────────────────────────────────────
SELECT
    s.name                          AS supplier_name,
    COUNT(DISTINCT p.product_id)    AS products_count,
    SUM(oi.quantity * oi.price)     AS total_revenue
FROM supplier s
    INNER JOIN product p        ON s.supplier_id  = p.supplier_id
    INNER JOIN order_item oi    ON p.product_id   = oi.product_id
    INNER JOIN `order` o        ON oi.order_id    = o.order_id
WHERE o.status != 'Cancelled'
GROUP BY s.supplier_id, s.name
HAVING total_revenue > 500
ORDER BY total_revenue DESC;
-- Expected: India Gate Foods (Rice at ₹450 × multiple orders) and
-- Amul Industries (Butter at ₹270 × multiple orders) will be high.


-- ────────────────────────────────────────────────────────────────────────────
-- QUERY 4.2: Categories with More Than 3 Products
-- ────────────────────────────────────────────────────────────────────────────
-- WHAT: Finds which product categories have a large product assortment
--       (more than 3 different products).
--
-- WHY:  Shows which categories are well-diversified. Categories with few
--       products might need expansion.
-- ────────────────────────────────────────────────────────────────────────────
SELECT
    c.category_name,
    COUNT(p.product_id) AS product_count
FROM category c
    INNER JOIN product p ON c.category_id = p.category_id
GROUP BY c.category_id, c.category_name
HAVING product_count > 3
ORDER BY product_count DESC;
-- Expected: "Snacks" (4 products) and maybe "Dairy" (3, just under threshold).


-- ────────────────────────────────────────────────────────────────────────────
-- QUERY 4.3: Repeat Customers (Customers with More Than 1 Order)
-- ────────────────────────────────────────────────────────────────────────────
-- WHAT: Finds customers who have placed 2 or more orders (excluding
--       cancelled ones). These are repeat/loyal customers.
--
-- WHY:  Repeat customers are 5x cheaper to retain than acquiring new ones.
--       This query helps identify them for loyalty rewards.
-- ────────────────────────────────────────────────────────────────────────────
SELECT
    c.name              AS customer_name,
    COUNT(o.order_id)   AS order_count,
    SUM(o.total_amount) AS total_spent
FROM customer c
    INNER JOIN `order` o ON c.customer_id = o.customer_id
WHERE o.status != 'Cancelled'
GROUP BY c.customer_id, c.name
HAVING order_count > 1
ORDER BY order_count DESC;
-- Expected: Aarav Sharma, Rohit Verma, Amit Kumar, Vikram Singh
-- (each placed 2 orders in the seed data).


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CATEGORY 5: QUERIES USING VIEWS                                       ║
-- ║  Views are pre-defined virtual tables (saved SELECT queries).          ║
-- ║  They simplify complex queries by encapsulating JOIN logic.            ║
-- ║  Our 4 views are defined in schema.sql.                               ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ────────────────────────────────────────────────────────────────────────────
-- QUERY 5.1: Top-Selling Products with More Than 3 Units Sold
-- ────────────────────────────────────────────────────────────────────────────
-- WHAT: Uses the vw_top_selling_products view (which already joins
--       product → order_item → category and aggregates) to find the
--       best sellers.
--
-- WHY:  The view hides the complex JOIN. The analyst just queries the view
--       like a simple table. This is the power of views — abstraction.
-- ────────────────────────────────────────────────────────────────────────────
SELECT
    product_name,
    category_name,
    total_quantity_sold,
    total_revenue
FROM vw_top_selling_products
WHERE total_quantity_sold > 3
ORDER BY total_quantity_sold DESC;
-- Expected: Products like Amul Milk (ordered in multiple orders) and
-- India Gate Rice (popular staple) will appear.


-- ────────────────────────────────────────────────────────────────────────────
-- QUERY 5.2: Orders with Pending Payment Status
-- ────────────────────────────────────────────────────────────────────────────
-- WHAT: Uses the vw_order_details view to find orders where payment is
--       still pending (not yet completed).
--
-- WHY:  Finance team needs to follow up on unpaid orders. The view makes
--       this a one-line query instead of a 5-table JOIN.
-- ────────────────────────────────────────────────────────────────────────────
SELECT
    order_id,
    customer_name,
    order_date,
    total_amount,
    order_status,
    payment_status,
    agent_name
FROM vw_order_details
WHERE payment_status = 'Pending'
ORDER BY order_date;
-- Expected: Orders #16-19 (the 4 pending orders in seed data).


-- ────────────────────────────────────────────────────────────────────────────
-- QUERY 5.3: Low Stock Products (Using vw_product_stock)
-- ────────────────────────────────────────────────────────────────────────────
-- WHAT: Uses the vw_product_stock view to find products running low.
--       The view automatically classifies stock as "In Stock", "Low Stock",
--       or "Out of Stock" using a CASE statement.
--
-- WHY:  Procurement team runs this daily to decide what to reorder.
-- ────────────────────────────────────────────────────────────────────────────
SELECT
    product_name,
    stock,
    stock_status,
    category_name,
    supplier_name
FROM vw_product_stock
WHERE stock_status IN ('Low Stock', 'Out of Stock')
ORDER BY stock ASC;
-- Expected: Products with stock ≤ 10 (if any after seed data).


-- ────────────────────────────────────────────────────────────────────────────
-- QUERY 5.4: Delivery Agent Performance (Using vw_revenue_per_agent)
-- ────────────────────────────────────────────────────────────────────────────
-- WHAT: Uses the vw_revenue_per_agent view to see each agent's workload:
--       how many deliveries, total revenue handled, and average order value.
--
-- WHY:  Operations manager evaluates agent efficiency. An agent with high
--       deliveries but low avg value might be handling too many small orders.
-- ────────────────────────────────────────────────────────────────────────────
SELECT
    agent_name,
    total_deliveries,
    total_revenue,
    ROUND(avg_order_value, 2) AS avg_order_value,
    vehicle_no
FROM vw_revenue_per_agent
ORDER BY total_deliveries DESC;
-- Expected: 5 agents. Each has ~2 delivered orders in seed data.
-- Agents with 0 deliveries appear thanks to LEFT JOIN in the view.


-- ============================================================================
-- END OF QUERY DEMONSTRATIONS
-- ============================================================================
-- Summary:
--   Category 1 (Joins):           3 queries — 4-table, LEFT JOIN, 5-table
--   Category 2 (Subqueries):      3 queries — scalar, NOT IN, nested
--   Category 3 (Aggregates):      5 queries — SUM, AVG, MAX/MIN, COUNT, multi
--   Category 4 (GROUP BY/HAVING): 3 queries — revenue threshold, product count, repeats
--   Category 5 (View queries):    4 queries — one per view
--   TOTAL: 18 queries covering all mandatory categories
-- ============================================================================
