// ============================================================================
// Grocery Management API — Entry Point
// ============================================================================
require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const dashboardRoutes = require('./routes/dashboard');
const customerRoutes = require('./routes/customers');
const categoryRoutes = require('./routes/categories');
const supplierRoutes = require('./routes/suppliers');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const deliveryAgentRoutes = require('./routes/deliveryAgents');

const app = express();
const PORT = process.env.API_PORT || 5000;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery-agents', deliveryAgentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Error Handler (must be last) ────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🛒 Grocery API running on http://localhost:${PORT}`);
});
