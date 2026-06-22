import { useState, useEffect } from 'react';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../api/client';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ category_name: '', description: '' });

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetchCategories();
      setCategories(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setEditing(null); setForm({ category_name: '', description: '' }); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ category_name: c.category_name, description: c.description || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await updateCategory(editing.category_id, form); }
      else { await createCategory(form); }
      setShowModal(false);
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Cannot delete — category has products');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-actions">
          <div><h2>Categories</h2><p>Organize products into categories</p></div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Category</button>
        </div>
      </div>

      {error && <div className="error-message">{error} <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '0.5rem' }}>✕</button></div>}

      <div className="table-container">
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : (
          <table>
            <thead>
              <tr><th>ID</th><th>Category Name</th><th>Description</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan="4"><div className="empty-state"><div className="empty-state-icon">🏷️</div><p>No categories found</p></div></td></tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.category_id}>
                    <td className="text-muted">#{c.category_id}</td>
                    <td style={{ fontWeight: 500 }}>{c.category_name}</td>
                    <td className="text-muted">{c.description || '—'}</td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.category_id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Category' : 'Add Category'}</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Category Name</label>
                  <input className="form-control" required value={form.category_name} onChange={(e) => setForm({ ...form, category_name: e.target.value })} placeholder="e.g., Dairy" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : 'Add Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
