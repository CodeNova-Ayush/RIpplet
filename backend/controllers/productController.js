// ============================================================================
// Product Controller — CRUD with Category Filter
// ============================================================================
const pool = require('../config/db');

// GET /api/products
exports.getAll = async (req, res, next) => {
  try {
    const { category_id, search } = req.query;
    let query = `
      SELECT p.*, c.category_name, s.name AS supplier_name
      FROM product p
      INNER JOIN category c ON p.category_id = c.category_id
      INNER JOIN supplier s ON p.supplier_id = s.supplier_id
    `;
    const conditions = [];
    const params = [];

    if (category_id) {
      conditions.push('p.category_id = ?');
      params.push(category_id);
    }
    if (search) {
      conditions.push('p.product_name LIKE ?');
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.product_name';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.category_name, s.name AS supplier_name
       FROM product p
       INNER JOIN category c ON p.category_id = c.category_id
       INNER JOIN supplier s ON p.supplier_id = s.supplier_id
       WHERE p.product_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/products
exports.create = async (req, res, next) => {
  try {
    const { product_name, price, stock, category_id, supplier_id } = req.body;
    if (!product_name || price === undefined || !category_id || !supplier_id) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Product name, price, category_id, and supplier_id are required',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO product (product_name, price, stock, category_id, supplier_id) VALUES (?, ?, ?, ?, ?)',
      [product_name, price, stock || 0, category_id, supplier_id]
    );

    const [newProduct] = await pool.query(
      `SELECT p.*, c.category_name, s.name AS supplier_name
       FROM product p
       INNER JOIN category c ON p.category_id = c.category_id
       INNER JOIN supplier s ON p.supplier_id = s.supplier_id
       WHERE p.product_id = ?`,
      [result.insertId]
    );
    res.status(201).json(newProduct[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
exports.update = async (req, res, next) => {
  try {
    const { product_name, price, stock, category_id, supplier_id } = req.body;
    const [existing] = await pool.query(
      'SELECT * FROM product WHERE product_id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Product not found' });
    }

    await pool.query(
      `UPDATE product SET product_name = ?, price = ?, stock = ?,
       category_id = ?, supplier_id = ? WHERE product_id = ?`,
      [
        product_name || existing[0].product_name,
        price !== undefined ? price : existing[0].price,
        stock !== undefined ? stock : existing[0].stock,
        category_id || existing[0].category_id,
        supplier_id || existing[0].supplier_id,
        req.params.id,
      ]
    );

    const [updated] = await pool.query(
      `SELECT p.*, c.category_name, s.name AS supplier_name
       FROM product p
       INNER JOIN category c ON p.category_id = c.category_id
       INNER JOIN supplier s ON p.supplier_id = s.supplier_id
       WHERE p.product_id = ?`,
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
exports.remove = async (req, res, next) => {
  try {
    const [existing] = await pool.query(
      'SELECT * FROM product WHERE product_id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Not found', message: 'Product not found' });
    }

    await pool.query('DELETE FROM product WHERE product_id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};
