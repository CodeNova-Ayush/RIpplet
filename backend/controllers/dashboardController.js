// ============================================================================
// Dashboard Controller — Aggregate Stats for the Dashboard
// ============================================================================
const pool = require('../config/db');

exports.getSummary = async (req, res, next) => {
  try {
    // Total orders (exclude cancelled)
    const [ordersResult] = await pool.query(
      `SELECT COUNT(*) AS totalOrders FROM \`order\` WHERE status != 'Cancelled'`
    );

    // Total revenue (only delivered/shipped/confirmed — actual revenue)
    const [revenueResult] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS totalRevenue
       FROM \`order\`
       WHERE status IN ('Delivered', 'Shipped', 'Confirmed')`
    );

    // Low stock products (stock <= 10)
    const [lowStockResult] = await pool.query(
      `SELECT COUNT(*) AS lowStockCount FROM product WHERE stock <= 10`
    );

    // Pending deliveries (orders that are Pending or Confirmed)
    const [pendingResult] = await pool.query(
      `SELECT COUNT(*) AS pendingDeliveries
       FROM \`order\`
       WHERE status IN ('Pending', 'Confirmed')`
    );

    // Total customers
    const [customersResult] = await pool.query(
      `SELECT COUNT(*) AS totalCustomers FROM customer`
    );

    // Total products
    const [productsResult] = await pool.query(
      `SELECT COUNT(*) AS totalProducts FROM product`
    );

    // Recent orders (last 5)
    const [recentOrders] = await pool.query(
      `SELECT o.order_id, o.order_date, o.total_amount, o.status,
              c.name AS customer_name
       FROM \`order\` o
       INNER JOIN customer c ON o.customer_id = c.customer_id
       ORDER BY o.order_date DESC
       LIMIT 5`
    );

    // Low stock products list
    const [lowStockProducts] = await pool.query(
      `SELECT p.product_id, p.product_name, p.stock, c.category_name
       FROM product p
       INNER JOIN category c ON p.category_id = c.category_id
       WHERE p.stock <= 10
       ORDER BY p.stock ASC
       LIMIT 10`
    );

    res.json({
      totalOrders: ordersResult[0].totalOrders,
      totalRevenue: parseFloat(revenueResult[0].totalRevenue),
      lowStockCount: lowStockResult[0].lowStockCount,
      pendingDeliveries: pendingResult[0].pendingDeliveries,
      totalCustomers: customersResult[0].totalCustomers,
      totalProducts: productsResult[0].totalProducts,
      recentOrders,
      lowStockProducts,
    });
  } catch (err) {
    next(err);
  }
};
