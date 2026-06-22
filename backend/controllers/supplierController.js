// ============================================================================
// Supplier Controller — CRUD
// ============================================================================
const pool = require('../config/db');

// GET /api/suppliers
exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM supplier ORDER BY name');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/suppliers/:id
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM supplier WHERE supplier_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Supplier not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/suppliers
exports.create = async (req, res, next) => {
  try {
    const { name, contact_no, address } = req.body;
    if (!name || !contact_no) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Name and contact number are required',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO supplier (name, contact_no, address) VALUES (?, ?, ?)',
      [name, contact_no, address || null]
    );

    const [newSupplier] = await pool.query(
      'SELECT * FROM supplier WHERE supplier_id = ?',
      [result.insertId]
    );
    res.status(201).json(newSupplier[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/suppliers/:id
exports.update = async (req, res, next) => {
  try {
    const { name, contact_no, address } = req.body;
    const [existing] = await pool.query(
      'SELECT * FROM supplier WHERE supplier_id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Supplier not found' });
    }

    await pool.query(
      'UPDATE supplier SET name = ?, contact_no = ?, address = ? WHERE supplier_id = ?',
      [
        name || existing[0].name,
        contact_no || existing[0].contact_no,
        address !== undefined ? address : existing[0].address,
        req.params.id,
      ]
    );

    const [updated] = await pool.query(
      'SELECT * FROM supplier WHERE supplier_id = ?',
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/suppliers/:id
exports.remove = async (req, res, next) => {
  try {
    const [existing] = await pool.query(
      'SELECT * FROM supplier WHERE supplier_id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Supplier not found' });
    }

    await pool.query('DELETE FROM supplier WHERE supplier_id = ?', [req.params.id]);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    next(err);
  }
};
