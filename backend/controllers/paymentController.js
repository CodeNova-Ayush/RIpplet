// ============================================================================
// Payment Controller — CRUD with 1:1 Enforcement
// ============================================================================
// Creating a payment checks if a payment already exists for the given order_id.
// If one exists, returns 409 Conflict. This enforces the 1:1 relationship
// at the application layer (in addition to the DB UNIQUE constraint).
// ============================================================================
const pool = require('../config/db');

// GET /api/payments
exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, o.status AS order_status, c.name AS customer_name
       FROM payment p
       INNER JOIN \`order\` o ON p.order_id = o.order_id
       INNER JOIN customer c ON o.customer_id = c.customer_id
       ORDER BY p.payment_date DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/payments/:id
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, o.status AS order_status, c.name AS customer_name
       FROM payment p
       INNER JOIN \`order\` o ON p.order_id = o.order_id
       INNER JOIN customer c ON o.customer_id = c.customer_id
       WHERE p.payment_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Payment not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/payments
exports.create = async (req, res, next) => {
  try {
    const { order_id, amount, payment_mode, payment_status } = req.body;

    // Validate required fields
    if (!order_id || amount === undefined || !payment_mode) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'order_id, amount, and payment_mode are required',
      });
    }

    // Verify the order exists
    const [order] = await pool.query(
      'SELECT order_id, total_amount FROM `order` WHERE order_id = ?',
      [order_id]
    );
    if (order.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Order not found' });
    }

    // ── Enforce 1:1 relationship ────────────────────────────────────────
    // Check if a payment already exists for this order
    const [existingPayment] = await pool.query(
      'SELECT payment_id FROM payment WHERE order_id = ?',
      [order_id]
    );
    if (existingPayment.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: `Payment already exists for order ${order_id} (payment_id: ${existingPayment[0].payment_id}). Each order can have only one payment.`,
      });
    }

    const [result] = await pool.query(
      `INSERT INTO payment (order_id, amount, payment_mode, payment_status)
       VALUES (?, ?, ?, ?)`,
      [order_id, amount, payment_mode, payment_status || 'Pending']
    );

    const [newPayment] = await pool.query(
      `SELECT p.*, o.status AS order_status, c.name AS customer_name
       FROM payment p
       INNER JOIN \`order\` o ON p.order_id = o.order_id
       INNER JOIN customer c ON o.customer_id = c.customer_id
       WHERE p.payment_id = ?`,
      [result.insertId]
    );
    res.status(201).json(newPayment[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/payments/:id — Update payment status
exports.update = async (req, res, next) => {
  try {
    const { payment_status, payment_mode } = req.body;
    const [existing] = await pool.query(
      'SELECT * FROM payment WHERE payment_id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Payment not found' });
    }

    await pool.query(
      'UPDATE payment SET payment_status = ?, payment_mode = ? WHERE payment_id = ?',
      [
        payment_status || existing[0].payment_status,
        payment_mode || existing[0].payment_mode,
        req.params.id,
      ]
    );

    const [updated] = await pool.query(
      `SELECT p.*, o.status AS order_status, c.name AS customer_name
       FROM payment p
       INNER JOIN \`order\` o ON p.order_id = o.order_id
       INNER JOIN customer c ON o.customer_id = c.customer_id
       WHERE p.payment_id = ?`,
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (err) {
    next(err);
  }
};
