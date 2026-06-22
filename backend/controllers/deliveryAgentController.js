// ============================================================================
// Delivery Agent Controller — CRUD
// ============================================================================
const pool = require('../config/db');

// GET /api/delivery-agents
exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM delivery_agent ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/delivery-agents/:id
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM delivery_agent WHERE agent_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Delivery agent not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/delivery-agents
exports.create = async (req, res, next) => {
  try {
    const { name, phone, vehicle_no } = req.body;
    if (!name || !phone || !vehicle_no) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Name, phone, and vehicle number are required',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO delivery_agent (name, phone, vehicle_no) VALUES (?, ?, ?)',
      [name, phone, vehicle_no]
    );

    const [newAgent] = await pool.query(
      'SELECT * FROM delivery_agent WHERE agent_id = ?',
      [result.insertId]
    );
    res.status(201).json(newAgent[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/delivery-agents/:id
exports.update = async (req, res, next) => {
  try {
    const { name, phone, vehicle_no } = req.body;
    const [existing] = await pool.query(
      'SELECT * FROM delivery_agent WHERE agent_id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Delivery agent not found' });
    }

    await pool.query(
      'UPDATE delivery_agent SET name = ?, phone = ?, vehicle_no = ? WHERE agent_id = ?',
      [
        name || existing[0].name,
        phone || existing[0].phone,
        vehicle_no || existing[0].vehicle_no,
        req.params.id,
      ]
    );

    const [updated] = await pool.query(
      'SELECT * FROM delivery_agent WHERE agent_id = ?',
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/delivery-agents/:id
exports.remove = async (req, res, next) => {
  try {
    const [existing] = await pool.query(
      'SELECT * FROM delivery_agent WHERE agent_id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Delivery agent not found' });
    }

    await pool.query('DELETE FROM delivery_agent WHERE agent_id = ?', [req.params.id]);
    res.json({ message: 'Delivery agent deleted successfully' });
  } catch (err) {
    next(err);
  }
};
