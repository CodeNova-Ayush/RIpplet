import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── Dashboard ───────────────────────────────────────────────────────────────
export const fetchDashboard = () => api.get('/dashboard/summary');

// ── Customers ───────────────────────────────────────────────────────────────
export const fetchCustomers = (search = '') =>
  api.get(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`);
export const fetchCustomer = (id) => api.get(`/customers/${id}`);
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);
export const fetchCustomerOrders = (id) => api.get(`/customers/${id}/orders`);

// ── Products ────────────────────────────────────────────────────────────────
export const fetchProducts = (params = {}) => {
  const qs = new URLSearchParams();
  if (params.category_id) qs.set('category_id', params.category_id);
  if (params.search) qs.set('search', params.search);
  return api.get(`/products?${qs.toString()}`);
};
export const fetchProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// ── Categories ──────────────────────────────────────────────────────────────
export const fetchCategories = () => api.get('/categories');
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// ── Suppliers ───────────────────────────────────────────────────────────────
export const fetchSuppliers = () => api.get('/suppliers');
export const createSupplier = (data) => api.post('/suppliers', data);
export const updateSupplier = (id, data) => api.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id) => api.delete(`/suppliers/${id}`);

// ── Orders ──────────────────────────────────────────────────────────────────
export const fetchOrders = (status = '') =>
  api.get(`/orders${status ? `?status=${status}` : ''}`);
export const fetchOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post('/orders', data);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

// ── Payments ────────────────────────────────────────────────────────────────
export const fetchPayments = () => api.get('/payments');
export const createPayment = (data) => api.post('/payments', data);
export const updatePayment = (id, data) => api.put(`/payments/${id}`, data);

// ── Delivery Agents ─────────────────────────────────────────────────────────
export const fetchAgents = () => api.get('/delivery-agents');
export const createAgent = (data) => api.post('/delivery-agents', data);
export const updateAgent = (id, data) => api.put(`/delivery-agents/${id}`, data);
export const deleteAgent = (id) => api.delete(`/delivery-agents/${id}`);

export default api;
