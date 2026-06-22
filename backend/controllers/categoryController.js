// ============================================================================
// Category Controller — CRUD
// ============================================================================
const pool = require('../config/db');

// GET /api/categories
exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM category ORDER BY category_name'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/categories/:id
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM category WHERE category_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Category not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/categories
exports.create = async (req, res, next) => {
  try {
    const { category_name, description } = req.body;
    if (!category_name) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Category name is required',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO category (category_name, description) VALUES (?, ?)',
      [category_name, description || null]
    );

    const [newCategory] = await pool.query(
      'SELECT * FROM category WHERE category_id = ?',
      [result.insertId]
    );
    res.status(201).json(newCategory[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/categories/:id
exports.update = async (req, res, next) => {
  try {
    const { category_name, description } = req.body;
    const [existing] = await pool.query(
      'SELECT * FROM category WHERE category_id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Category not found' });
    }

    await pool.query(
      'UPDATE category SET category_name = ?, description = ? WHERE category_id = ?',
      [
        category_name || existing[0].category_name,
        description !== undefined ? description : existing[0].description,
        req.params.id,
      ]
    );

    const [updated] = await pool.query(
      'SELECT * FROM category WHERE category_id = ?',
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/categories/:id
exports.remove = async (req, res, next) => {
  try {
    const [existing] = await pool.query(
      'SELECT * FROM category WHERE category_id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Category not found' });
    }

    await pool.query('DELETE FROM category WHERE category_id = ?', [req.params.id]);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
};
