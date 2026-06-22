// ============================================================================
// Customer Controller — CRUD + Order History
// ============================================================================
const pool = require('../config/db');

// GET /api/customers
exports.getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM customer';
    const params = [];

    if (search) {
      query += ' WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?';
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    query += ' ORDER BY registered_date DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/customers/:id
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM customer WHERE customer_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Customer not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/customers
exports.create = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Name, email, and phone are required',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO customer (name, email, phone, address) VALUES (?, ?, ?, ?)',
      [name, email, phone, address || null]
    );

    const [newCustomer] = await pool.query(
      'SELECT * FROM customer WHERE customer_id = ?',
      [result.insertId]
    );
    res.status(201).json(newCustomer[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/customers/:id
exports.update = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;
    const [existing] = await pool.query(
      'SELECT * FROM customer WHERE customer_id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Customer not found' });
    }

    await pool.query(
      'UPDATE customer SET name = ?, email = ?, phone = ?, address = ? WHERE customer_id = ?',
      [
        name || existing[0].name,
        email || existing[0].email,
        phone || existing[0].phone,
        address !== undefined ? address : existing[0].address,
        req.params.id,
      ]
    );

    const [updated] = await pool.query(
      'SELECT * FROM customer WHERE customer_id = ?',
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/customers/:id
exports.remove = async (req, res, next) => {
  try {
    const [existing] = await pool.query(
      'SELECT * FROM customer WHERE customer_id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Customer not found' });
    }

    await pool.query('DELETE FROM customer WHERE customer_id = ?', [req.params.id]);
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /api/customers/:id/orders
exports.getOrders = async (req, res, next) => {
  try {
    const [customer] = await pool.query(
      'SELECT * FROM customer WHERE customer_id = ?',
      [req.params.id]
    );
    if (customer.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Customer not found' });
    }

    const [orders] = await pool.query(
      `SELECT o.order_id, o.order_date, o.total_amount, o.status,
              COALESCE(p.payment_status, 'No Payment') AS payment_status,
              COALESCE(da.name, 'Unassigned') AS agent_name
       FROM \`order\` o
       LEFT JOIN payment p ON o.order_id = p.order_id
       LEFT JOIN delivery_agent da ON o.agent_id = da.agent_id
       WHERE o.customer_id = ?
       ORDER BY o.order_date DESC`,
      [req.params.id]
    );

    res.json({ customer: customer[0], orders });
  } catch (err) {
    next(err);
  }
};
