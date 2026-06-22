import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchOrder } from '../api/client';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await fetchOrder(id);
      setOrder(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><p>Loading order...</p></div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!order) return null;

  const getStatusBadge = (status) => {
    const map = { Pending: 'badge-amber', Confirmed: 'badge-blue', Shipped: 'badge-purple', Delivered: 'badge-green', Cancelled: 'badge-red' };
    return map[status] || 'badge-gray';
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <Link to="/orders" className="btn btn-secondary btn-sm">← Back</Link>
          <h2>Order #{order.order_id}</h2>
          <span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span>
        </div>
        <p>Placed on {new Date(order.order_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* ── Detail Cards ───────────────────────────────────────────── */}
      <div className="order-detail-grid">
        {/* Customer Info */}
        <div className="detail-section">
          <h4>👤 Customer Information</h4>
          <div className="detail-row">
            <span className="detail-label">Name</span>
            <span className="detail-value">{order.customer_name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email</span>
            <span className="detail-value">{order.customer_email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Phone</span>
            <span className="detail-value">{order.customer_phone}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Address</span>
            <span className="detail-value">{order.customer_address || 'N/A'}</span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="detail-section">
          <h4>🚚 Delivery Information</h4>
          <div className="detail-row">
            <span className="detail-label">Agent</span>
            <span className="detail-value">{order.agent_name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Phone</span>
            <span className="detail-value">{order.agent_phone || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Vehicle</span>
            <span className="detail-value">{order.agent_vehicle || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Order Status</span>
            <span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="detail-section">
          <h4>💳 Payment Information</h4>
          {order.payment ? (
            <>
              <div className="detail-row">
                <span className="detail-label">Payment ID</span>
                <span className="detail-value">#{order.payment.payment_id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Mode</span>
                <span className="detail-value">{order.payment.payment_mode}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className={`badge ${order.payment.payment_status === 'Completed' ? 'badge-green' : order.payment.payment_status === 'Refunded' ? 'badge-red' : 'badge-amber'}`}>
                  {order.payment.payment_status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Amount</span>
                <span className="detail-value">₹{parseFloat(order.payment.amount).toLocaleString('en-IN')}</span>
              </div>
            </>
          ) : (
            <p className="text-muted">No payment recorded</p>
          )}
        </div>

        {/* Order Summary */}
        <div className="detail-section">
          <h4>📊 Order Summary</h4>
          <div className="detail-row">
            <span className="detail-label">Total Items</span>
            <span className="detail-value">{order.items?.length || 0} products</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Total Quantity</span>
            <span className="detail-value">{order.items?.reduce((s, i) => s + i.quantity, 0) || 0} units</span>
          </div>
          <div className="detail-row" style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
            <span className="detail-label" style={{ fontSize: '1rem', fontWeight: 600 }}>Total Amount</span>
            <span className="detail-value" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-green)' }}>
              ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* ── Items Table ────────────────────────────────────────────── */}
      <div className="table-container">
        <div className="table-header">
          <h3>Order Items</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item) => (
              <tr key={item.product_id}>
                <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                <td><span className="badge badge-blue">{item.category_name}</span></td>
                <td>₹{parseFloat(item.price).toLocaleString('en-IN')}</td>
                <td>{item.quantity}</td>
                <td style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="4" style={{ textAlign: 'right', fontWeight: 600 }}>Grand Total</td>
              <td style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-green)' }}>
                ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
