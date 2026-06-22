import { useState, useEffect } from 'react';
import { fetchAgents, createAgent, updateAgent, deleteAgent } from '../api/client';

export default function DeliveryAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', vehicle_no: '' });

  useEffect(() => { loadAgents(); }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const res = await fetchAgents();
      setAgents(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setEditing(null); setForm({ name: '', phone: '', vehicle_no: '' }); setShowModal(true); };
  const openEdit = (a) => { setEditing(a); setForm({ name: a.name, phone: a.phone, vehicle_no: a.vehicle_no }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await updateAgent(editing.agent_id, form); }
      else { await createAgent(form); }
      setShowModal(false);
      await loadAgents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save agent');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this delivery agent?')) return;
    try {
      await deleteAgent(id);
      await loadAgents();
    } catch (err) {
      setError(err.response?.data?.message || 'Cannot delete — agent has assigned orders');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-actions">
          <div><h2>Delivery Agents</h2><p>Manage delivery personnel</p></div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Agent</button>
        </div>
      </div>

      {error && <div className="error-message">{error} <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '0.5rem' }}>✕</button></div>}

      <div className="table-container">
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : (
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Phone</th><th>Vehicle No.</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {agents.length === 0 ? (
                <tr><td colSpan="5"><div className="empty-state"><div className="empty-state-icon">🚚</div><p>No delivery agents found</p></div></td></tr>
              ) : (
                agents.map((a) => (
                  <tr key={a.agent_id}>
                    <td className="text-muted">#{a.agent_id}</td>
                    <td style={{ fontWeight: 500 }}>{a.name}</td>
                    <td>{a.phone}</td>
                    <td><span className="badge badge-blue">{a.vehicle_no}</span></td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(a)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.agent_id)}>Delete</button>
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
              <h3>{editing ? 'Edit Agent' : 'Add Agent'}</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name</label>
                  <input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input className="form-control" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Vehicle Number</label>
                    <input className="form-control" required value={form.vehicle_no} onChange={(e) => setForm({ ...form, vehicle_no: e.target.value })} placeholder="e.g., KA-01-AB-1234" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : 'Add Agent'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
