// ============================================================================
// Order Controller — CRUD with Transaction-Based Business Logic
// ============================================================================
// Creating an order:
// 1. Validates stock availability for all items
// 2. Inserts ORDER record
// 3. Inserts ORDER_ITEM records
// 4. Decrements PRODUCT stock
// 5. Calculates and sets Total_Amount
// All within a single database transaction (rollback on failure).
// ============================================================================
const pool = require('../config/db');

// GET /api/orders
exports.getAll = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT o.order_id, o.order_date, o.total_amount, o.status,
             c.customer_id, c.name AS customer_name,
             COALESCE(p.payment_status, 'No Payment') AS payment_status,
             COALESCE(da.name, 'Unassigned') AS agent_name
      FROM \`order\` o
      INNER JOIN customer c ON o.customer_id = c.customer_id
      LEFT JOIN payment p ON o.order_id = p.order_id
      LEFT JOIN delivery_agent da ON o.agent_id = da.agent_id
    `;
    const params = [];

    if (status) {
      query += ' WHERE o.status = ?';
      params.push(status);
    }

    query += ' ORDER BY o.order_date DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
exports.getById = async (req, res, next) => {
  try {
    // Get order with customer and agent info
    const [orders] = await pool.query(
      `SELECT o.*, c.name AS customer_name, c.email AS customer_email,
              c.phone AS customer_phone, c.address AS customer_address,
              COALESCE(da.name, 'Unassigned') AS agent_name,
              COALESCE(da.phone, '') AS agent_phone,
              COALESCE(da.vehicle_no, '') AS agent_vehicle
       FROM \`order\` o
       INNER JOIN customer c ON o.customer_id = c.customer_id
       LEFT JOIN delivery_agent da ON o.agent_id = da.agent_id
       WHERE o.order_id = ?`,
      [req.params.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Order not found' });
    }

    // Get order items with product details
    const [items] = await pool.query(
      `SELECT oi.*, p.product_name, c.category_name
       FROM order_item oi
       INNER JOIN product p ON oi.product_id = p.product_id
       INNER JOIN category c ON p.category_id = c.category_id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );

    // Get payment info
    const [payment] = await pool.query(
      'SELECT * FROM payment WHERE order_id = ?',
      [req.params.id]
    );

    res.json({
      ...orders[0],
      items,
      payment: payment.length > 0 ? payment[0] : null,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/orders
// Body: { customer_id, agent_id?, items: [{ product_id, quantity }] }
exports.create = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { customer_id, agent_id, items } = req.body;

    // ── Validation ──────────────────────────────────────────────────────
    if (!customer_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'customer_id and items (non-empty array) are required',
      });
    }

    // Verify customer exists
    const [customer] = await connection.query(
      'SELECT customer_id FROM customer WHERE customer_id = ?',
      [customer_id]
    );
    if (customer.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Customer not found' });
    }

    // Verify agent exists (if provided)
    if (agent_id) {
      const [agent] = await connection.query(
        'SELECT agent_id FROM delivery_agent WHERE agent_id = ?',
        [agent_id]
      );
      if (agent.length === 0) {
        return res.status(404).json({ error: 'Not found', message: 'Delivery agent not found' });
      }
    }

    // ── Begin Transaction ───────────────────────────────────────────────
    await connection.beginTransaction();

    // Validate stock availability for ALL items before proceeding
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        await connection.rollback();
        return res.status(400).json({
          error: 'Validation failed',
          message: `Invalid item: product_id and quantity (> 0) are required`,
        });
      }

      // Lock the product row for update (prevents race conditions)
      const [products] = await connection.query(
        'SELECT product_id, product_name, price, stock FROM product WHERE product_id = ? FOR UPDATE',
        [item.product_id]
      );

      if (products.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          error: 'Not found',
          message: `Product with ID ${item.product_id} not found`,
        });
      }

      const product = products[0];
      if (product.stock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({
          error: 'Insufficient stock',
          message: `Product "${product.product_name}" has only ${product.stock} units in stock, but ${item.quantity} were requested`,
        });
      }

      const lineTotal = product.price * item.quantity;
      totalAmount += lineTotal;
      validatedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: product.price,
        stock: product.stock,
      });
    }

    // Insert the order
    const [orderResult] = await connection.query(
      'INSERT INTO `order` (order_date, total_amount, status, customer_id, agent_id) VALUES (NOW(), ?, ?, ?, ?)',
      [totalAmount, 'Pending', customer_id, agent_id || null]
    );
    const orderId = orderResult.insertId;

    // Insert order items and decrement stock
    for (const item of validatedItems) {
      await connection.query(
        'INSERT INTO order_item (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );

      await connection.query(
        'UPDATE product SET stock = stock - ? WHERE product_id = ?',
        [item.quantity, item.product_id]
      );
    }

    // ── Commit Transaction ──────────────────────────────────────────────
    await connection.commit();

    // Fetch the complete order to return
    const [newOrder] = await pool.query(
      `SELECT o.*, c.name AS customer_name
       FROM \`order\` o
       INNER JOIN customer c ON o.customer_id = c.customer_id
       WHERE o.order_id = ?`,
      [orderId]
    );

    const [newItems] = await pool.query(
      `SELECT oi.*, p.product_name
       FROM order_item oi
       INNER JOIN product p ON oi.product_id = p.product_id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    res.status(201).json({ ...newOrder[0], items: newItems });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

// PUT /api/orders/:id — Update status and/or agent
exports.update = async (req, res, next) => {
  try {
    const { status, agent_id } = req.body;
    const [existing] = await pool.query(
      'SELECT * FROM `order` WHERE order_id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Order not found' });
    }

    await pool.query(
      'UPDATE `order` SET status = ?, agent_id = ? WHERE order_id = ?',
      [
        status || existing[0].status,
        agent_id !== undefined ? agent_id : existing[0].agent_id,
        req.params.id,
      ]
    );

    const [updated] = await pool.query(
      `SELECT o.*, c.name AS customer_name
       FROM \`order\` o
       INNER JOIN customer c ON o.customer_id = c.customer_id
       WHERE o.order_id = ?`,
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/orders/:id
exports.remove = async (req, res, next) => {
  try {
    const [existing] = await pool.query(
      'SELECT * FROM `order` WHERE order_id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Order not found' });
    }

    // CASCADE will handle order_items and payment
    await pool.query('DELETE FROM `order` WHERE order_id = ?', [req.params.id]);
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    next(err);
  }
};
