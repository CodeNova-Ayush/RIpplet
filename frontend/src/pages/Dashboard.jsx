import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '../api/client';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetchDashboard();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const stats = [
    {
      label: 'Total Orders',
      value: data.totalOrders,
      icon: '📦',
      color: 'blue',
    },
    {
      label: 'Total Revenue',
      value: `₹${data.totalRevenue.toLocaleString('en-IN')}`,
      icon: '💰',
      color: 'green',
    },
    {
      label: 'Low Stock Items',
      value: data.lowStockCount,
      icon: '⚠️',
      color: 'amber',
    },
    {
      label: 'Pending Deliveries',
      value: data.pendingDeliveries,
      icon: '🚚',
      color: 'purple',
    },
  ];

  const getStatusBadge = (status) => {
    const map = {
      Pending: 'badge-amber',
      Confirmed: 'badge-blue',
      Shipped: 'badge-purple',
      Delivered: 'badge-green',
      Cancelled: 'badge-red',
    };
    return map[status] || 'badge-gray';
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your grocery store operations</p>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <div className="stat-grid">
        {stats.map((stat) => (
          <div key={stat.label} className={`stat-card ${stat.color}`}>
            <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.label}</h3>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Orders & Low Stock ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Orders */}
        <div className="table-container">
          <div className="table-header">
            <h3>Recent Orders</h3>
            <Link to="/orders" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr key={order.order_id}>
                  <td>
                    <Link to={`/orders/${order.order_id}`} className="text-blue">
                      #{order.order_id}
                    </Link>
                  </td>
                  <td>{order.customer_name}</td>
                  <td>₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low Stock */}
        <div className="table-container">
          <div className="table-header">
            <h3>⚠️ Low Stock Alerts</h3>
            <Link to="/products" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {data.lowStockProducts.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    All products are well stocked! 🎉
                  </td>
                </tr>
              ) : (
                data.lowStockProducts.map((product) => (
                  <tr key={product.product_id}>
                    <td>{product.product_name}</td>
                    <td>{product.category_name}</td>
                    <td>
                      <span className={`badge ${product.stock === 0 ? 'badge-red' : 'badge-amber'}`}>
                        {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
