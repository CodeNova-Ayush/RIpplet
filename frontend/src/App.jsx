import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Suppliers from './pages/Suppliers';
import Categories from './pages/Categories';
import DeliveryAgents from './pages/DeliveryAgents';

function App() {
  const navItems = [
    { to: '/dashboard',       icon: '📊', label: 'Dashboard' },
    { to: '/orders',          icon: '📦', label: 'Orders' },
    { to: '/products',        icon: '🛍️', label: 'Products' },
    { to: '/customers',       icon: '👥', label: 'Customers' },
    { to: '/categories',      icon: '🏷️', label: 'Categories' },
    { to: '/suppliers',       icon: '🏭', label: 'Suppliers' },
    { to: '/delivery-agents', icon: '🚚', label: 'Delivery Agents' },
  ];

  return (
    <div className="app-layout">
      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🛒</div>
          <h1>GroceryDB</h1>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/delivery-agents" element={<DeliveryAgents />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
