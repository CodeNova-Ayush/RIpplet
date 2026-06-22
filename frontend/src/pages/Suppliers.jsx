import { useState, useEffect } from 'react';
import { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/client';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', contact_no: '', address: '' });

  useEffect(() => { loadSuppliers(); }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetchSuppliers();
      setSuppliers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setEditing(null); setForm({ name: '', contact_no: '', address: '' }); setShowModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, contact_no: s.contact_no, address: s.address || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await updateSupplier(editing.supplier_id, form); }
      else { await createSupplier(form); }
      setShowModal(false);
      await loadSuppliers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save supplier');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this supplier?')) return;
    try {
      await deleteSupplier(id);
      await loadSuppliers();
    } catch (err) {
      setError(err.response?.data?.message || 'Cannot delete — supplier has products');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-actions">
          <div><h2>Suppliers</h2><p>Manage your product suppliers</p></div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Supplier</button>
        </div>
      </div>

      {error && <div className="error-message">{error} <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '0.5rem' }}>✕</button></div>}

      <div className="table-container">
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : (
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Contact</th><th>Address</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr><td colSpan="5"><div className="empty-state"><div className="empty-state-icon">🏭</div><p>No suppliers found</p></div></td></tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.supplier_id}>
                    <td className="text-muted">#{s.supplier_id}</td>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td>{s.contact_no}</td>
                    <td className="text-muted">{s.address || '—'}</td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.supplier_id)}>Delete</button>
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
              <h3>{editing ? 'Edit Supplier' : 'Add Supplier'}</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Supplier Name</label>
                  <input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input className="form-control" required value={form.contact_no} onChange={(e) => setForm({ ...form, contact_no: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input className="form-control" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : 'Add Supplier'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
