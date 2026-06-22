import { useState, useEffect } from 'react';
import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchCategories, fetchSuppliers } from '../api/client';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ product_name: '', price: '', stock: '', category_id: '', supplier_id: '' });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search, filterCat]);

  const loadData = async () => {
    try {
      const [catRes, supRes] = await Promise.all([fetchCategories(), fetchSuppliers()]);
      setCategories(catRes.data);
      setSuppliers(supRes.data);
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetchProducts({ search, category_id: filterCat });
      setProducts(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ product_name: '', price: '', stock: '0', category_id: '', supplier_id: '' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      product_name: p.product_name,
      price: p.price,
      stock: p.stock,
      category_id: p.category_id,
      supplier_id: p.supplier_id,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateProduct(editing.product_id, form);
      } else {
        await createProduct(form);
      }
      setShowModal(false);
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Cannot delete — product may have existing orders');
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', class: 'low', badge: 'badge-red', pct: 0 };
    if (stock <= 10) return { label: `${stock} left`, class: 'low', badge: 'badge-red', pct: (stock / 200) * 100 };
    if (stock <= 50) return { label: `${stock}`, class: 'medium', badge: 'badge-amber', pct: (stock / 200) * 100 };
    return { label: `${stock}`, class: 'high', badge: 'badge-green', pct: Math.min((stock / 200) * 100, 100) };
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h2>Products</h2>
            <p>Manage your grocery inventory</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
        </div>
      </div>

      {error && <div className="error-message">{error} <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '0.5rem' }}>✕</button></div>}

      {/* ── Filters ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="search-bar">
          <span className="search-bar-icon">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="form-control" style={{ width: 'auto', minWidth: '180px' }} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
          ))}
        </select>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="table-container">
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="6"><div className="empty-state"><div className="empty-state-icon">📦</div><p>No products found</p></div></td></tr>
              ) : (
                products.map((p) => {
                  const stock = getStockStatus(p.stock);
                  return (
                    <tr key={p.product_id}>
                      <td style={{ fontWeight: 500 }}>{p.product_name}</td>
                      <td><span className="badge badge-blue">{p.category_name}</span></td>
                      <td className="text-muted">{p.supplier_name}</td>
                      <td>₹{parseFloat(p.price).toLocaleString('en-IN')}</td>
                      <td>
                        <div className="stock-bar">
                          <div className="stock-level">
                            <div className={`stock-fill ${stock.class}`} style={{ width: `${stock.pct}%` }} />
                          </div>
                          <span className={`badge ${stock.badge}`}>{stock.label}</span>
                        </div>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.product_id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal ──────────────────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Product Name</label>
                  <input className="form-control" required value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} placeholder="e.g., Amul Butter 500g" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input className="form-control" type="number" step="0.01" min="0" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input className="form-control" type="number" min="0" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select className="form-control" required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Supplier</label>
                    <select className="form-control" required value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}>
                      <option value="">Select supplier</option>
                      {suppliers.map((s) => (
                        <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
