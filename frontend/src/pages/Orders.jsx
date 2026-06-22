import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrders, createOrder, fetchCustomers, fetchProducts, fetchAgents } from '../api/client';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create order state
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchOrders(statusFilter);
      setOrders(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = async () => {
    try {
      const [custRes, prodRes, agentRes] = await Promise.all([
        fetchCustomers(), fetchProducts(), fetchAgents()
      ]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
      setAgents(agentRes.data);
      setSelectedCustomer('');
      setSelectedAgent('');
      setOrderItems([{ product_id: '', quantity: 1 }]);
      setShowCreateModal(true);
    } catch (err) {
      setError('Failed to load form data');
    }
  };

  const addItem = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    if (orderItems.length === 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    setOrderItems(updated);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      const product = products.find((p) => p.product_id === parseInt(item.product_id));
      if (product && item.quantity > 0) {
        return sum + product.price * item.quantity;
      }
      return sum;
    }, 0);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return setError('Please select a customer');
    const validItems = orderItems.filter((i) => i.product_id && i.quantity > 0);
    if (validItems.length === 0) return setError('Please add at least one product');

    try {
      setCreating(true);
      await createOrder({
        customer_id: parseInt(selectedCustomer),
        agent_id: selectedAgent ? parseInt(selectedAgent) : null,
        items: validItems.map((i) => ({
          product_id: parseInt(i.product_id),
          quantity: parseInt(i.quantity),
        })),
      });
      setShowCreateModal(false);
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = { Pending: 'badge-amber', Confirmed: 'badge-blue', Shipped: 'badge-purple', Delivered: 'badge-green', Cancelled: 'badge-red' };
    return map[status] || 'badge-gray';
  };

  const statuses = ['', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h2>Orders</h2>
            <p>Track and manage customer orders</p>
          </div>
          <button className="btn btn-primary" onClick={openCreateModal}>+ New Order</button>
        </div>
      </div>

      {error && <div className="error-message">{error} <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '0.5rem' }}>✕</button></div>}

      {/* ── Status Filter ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {statuses.map((s) => (
          <button
            key={s || 'all'}
            className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter(s)}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* ── Orders Table ───────────────────────────────────────────── */}
      <div className="table-container">
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Agent</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan="7"><div className="empty-state"><div className="empty-state-icon">📦</div><p>No orders found</p></div></td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.order_id}>
                    <td>
                      <Link to={`/orders/${o.order_id}`} className="text-blue" style={{ fontWeight: 600 }}>
                        #{o.order_id}
                      </Link>
                    </td>
                    <td style={{ fontWeight: 500 }}>{o.customer_name}</td>
                    <td className="text-muted">{new Date(o.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ fontWeight: 600 }}>₹{parseFloat(o.total_amount).toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${getStatusBadge(o.status)}`}>{o.status}</span></td>
                    <td><span className={`badge ${o.payment_status === 'Completed' ? 'badge-green' : o.payment_status === 'Refunded' ? 'badge-red' : 'badge-amber'}`}>{o.payment_status}</span></td>
                    <td className="text-muted">{o.agent_name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Create Order Modal ─────────────────────────────────────── */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Order</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateOrder}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Customer</label>
                    <select className="form-control" required value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                      <option value="">Select customer</option>
                      {customers.map((c) => (
                        <option key={c.customer_id} value={c.customer_id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Delivery Agent (Optional)</label>
                    <select className="form-control" value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
                      <option value="">Assign later</option>
                      {agents.map((a) => (
                        <option key={a.agent_id} value={a.agent_id}>{a.name} ({a.vehicle_no})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                    Order Items
                  </label>
                  {orderItems.map((item, idx) => {
                    const product = products.find((p) => p.product_id === parseInt(item.product_id));
                    return (
                      <div key={idx} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 2 }}>
                          <select className="form-control" value={item.product_id} onChange={(e) => updateItem(idx, 'product_id', e.target.value)} required>
                            <option value="">Select product</option>
                            {products.map((p) => (
                              <option key={p.product_id} value={p.product_id}>
                                {p.product_name} — ₹{p.price} (Stock: {p.stock})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={{ flex: 0.5 }}>
                          <input
                            className="form-control"
                            type="number"
                            min="1"
                            max={product?.stock || 999}
                            value={item.quantity}
                            onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                            placeholder="Qty"
                            required
                          />
                        </div>
                        <div style={{ flex: 0.5, textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.875rem', paddingBottom: '0.75rem' }}>
                          {product ? `₹${(product.price * item.quantity).toLocaleString('en-IN')}` : '—'}
                        </div>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(idx)} style={{ marginBottom: '0' }} disabled={orderItems.length === 1}>✕</button>
                      </div>
                    );
                  })}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Item</button>
                </div>

                <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Estimated Total</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{calculateTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
