import { useState, useEffect } from 'react';
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer, fetchCustomerOrders } from '../api/client';
import { Link } from 'react-router-dom';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetchCustomers(search);
      setCustomers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const toggleOrders = async (customerId) => {
    if (expandedCustomer === customerId) {
      setExpandedCustomer(null);
      setCustomerOrders([]);
      return;
    }
    try {
      setLoadingOrders(true);
      setExpandedCustomer(customerId);
      const res = await fetchCustomerOrders(customerId);
      setCustomerOrders(res.data.orders);
    } catch (err) {
      setError('Failed to load order history');
    } finally {
      setLoadingOrders(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', address: '' });
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email, phone: c.phone, address: c.address || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateCustomer(editing.customer_id, form);
      } else {
        await createCustomer(form);
      }
      setShowModal(false);
      await loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save customer');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await deleteCustomer(id);
      await loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Cannot delete — customer has existing orders');
    }
  };

  const getStatusBadge = (status) => {
    const map = { Pending: 'badge-amber', Confirmed: 'badge-blue', Shipped: 'badge-purple', Delivered: 'badge-green', Cancelled: 'badge-red' };
    return map[status] || 'badge-gray';
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h2>Customers</h2>
            <p>Manage your customer database</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Customer</button>
        </div>
      </div>

      {error && <div className="error-message">{error} <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '0.5rem' }}>✕</button></div>}

      <div style={{ marginBottom: '1.5rem' }}>
        <div className="search-bar">
          <span className="search-bar-icon">🔍</span>
          <input type="text" placeholder="Search by name, email, or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan="5"><div className="empty-state"><div className="empty-state-icon">👥</div><p>No customers found</p></div></td></tr>
              ) : (
                customers.map((c) => (
                  <>
                    <tr key={c.customer_id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 500 }}>{c.name}</div>
                          {c.address && <div className="text-muted" style={{ fontSize: '0.8rem' }}>{c.address}</div>}
                        </div>
                      </td>
                      <td className="text-muted">{c.email}</td>
                      <td>{c.phone}</td>
                      <td className="text-muted">{c.registered_date}</td>
                      <td>
                        <div className="btn-group">
                          <button className="btn btn-secondary btn-sm" onClick={() => toggleOrders(c.customer_id)}>
                            {expandedCustomer === c.customer_id ? 'Hide Orders' : 'Orders'}
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.customer_id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                    {expandedCustomer === c.customer_id && (
                      <tr key={`orders-${c.customer_id}`}>
                        <td colSpan="5" style={{ padding: '0 1.5rem 1rem', background: 'var(--bg-glass)' }}>
                          {loadingOrders ? (
                            <div className="loading-container" style={{ padding: '1rem' }}><div className="spinner" /></div>
                          ) : customerOrders.length === 0 ? (
                            <p className="text-muted" style={{ padding: '1rem 0' }}>No orders yet</p>
                          ) : (
                            <table style={{ margin: '0.5rem 0' }}>
                              <thead>
                                <tr>
                                  <th>Order ID</th>
                                  <th>Date</th>
                                  <th>Amount</th>
                                  <th>Status</th>
                                  <th>Payment</th>
                                  <th>Agent</th>
                                </tr>
                              </thead>
                              <tbody>
                                {customerOrders.map((o) => (
                                  <tr key={o.order_id}>
                                    <td><Link to={`/orders/${o.order_id}`} className="text-blue">#{o.order_id}</Link></td>
                                    <td className="text-muted">{new Date(o.order_date).toLocaleDateString()}</td>
                                    <td>₹{parseFloat(o.total_amount).toLocaleString('en-IN')}</td>
                                    <td><span className={`badge ${getStatusBadge(o.status)}`}>{o.status}</span></td>
                                    <td><span className={`badge ${o.payment_status === 'Completed' ? 'badge-green' : 'badge-amber'}`}>{o.payment_status}</span></td>
                                    <td className="text-muted">{o.agent_name}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))
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
              <h3>{editing ? 'Edit Customer' : 'Add Customer'}</h3>
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
                    <label>Email</label>
                    <input className="form-control" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input className="form-control" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input className="form-control" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : 'Add Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
