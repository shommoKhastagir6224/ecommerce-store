import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const user = JSON.parse(localStorage.getItem('shommoUser') || 'null');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('shommoUser');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── API helpers ─────────────────────────────────────────────────────────────
export const authAPI = {
  register:       (d) => api.post('/auth/register', d),
  login:          (d) => api.post('/auth/login', d),
  google:         (d) => api.post('/auth/google', d),
  forgotPassword: (d) => api.post('/auth/forgot-password', d),
  resetPassword:  (token, d) => api.put(`/auth/reset-password/${token}`, d),
  getMe:          () => api.get('/auth/me'),
};

export const productAPI = {
  getAll:          (p) => api.get('/products', { params: p }),
  getById:         (id) => api.get(`/products/${id}`),
  getBySlug:       (slug) => api.get(`/products/slug/${slug}`),
  getRelated:      (id) => api.get(`/products/related/${id}`),
  getFlashSale:    () => api.get('/products/flash-sale'),
  getTopSelling:   () => api.get('/products/top-selling'),
  create:          (d) => api.post('/products', d),
  update:          (id, d) => api.put(`/products/${id}`, d),
  delete:          (id) => api.delete(`/products/${id}`),
};

export const categoryAPI = {
  getAll:  () => api.get('/categories'),
  create:  (d) => api.post('/categories', d),
  update:  (id, d) => api.put(`/categories/${id}`, d),
  delete:  (id) => api.delete(`/categories/${id}`),
};

export const orderAPI = {
  create:        (d) => api.post('/orders', d),
  getMy:         (p) => api.get('/orders/my', { params: p }),
  getById:       (id) => api.get(`/orders/${id}`),
  getAll:        (p) => api.get('/orders', { params: p }),
  getStaff:      () => api.get('/orders/staff'),
  updateStatus:  (id, d) => api.put(`/orders/${id}/status`, d),
  assignStaff:   (id, d) => api.put(`/orders/${id}/assign`, d),
  markPaid:      (id, d) => api.put(`/orders/${id}/pay`, d),
};

export const reviewAPI = {
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  create:       (d) => api.post('/reviews', d),
  delete:       (id) => api.delete(`/reviews/${id}`),
};

export const userAPI = {
  getAll:        () => api.get('/users'),
  getStaff:      () => api.get('/users/staff'),
  updateProfile: (d) => api.put('/users/profile', d),
  updateAddress: (d) => api.put('/users/address', d),
  updateRole:    (id, d) => api.put(`/users/${id}/role`, d),
  toggle:        (id) => api.put(`/users/${id}/toggle`),
};

export const wishlistAPI = {
  get:    () => api.get('/wishlist'),
  toggle: (productId) => api.post(`/wishlist/toggle/${productId}`),
};

export const couponAPI = {
  validate: (d) => api.post('/coupons/validate', d),
  getAll:   () => api.get('/coupons'),
  create:   (d) => api.post('/coupons', d),
  update:   (id, d) => api.put(`/coupons/${id}`, d),
  delete:   (id) => api.delete(`/coupons/${id}`),
};

export const bannerAPI = {
  getAll:  () => api.get('/banners'),
  create:  (d) => api.post('/banners', d),
  update:  (id, d) => api.put(`/banners/${id}`, d),
  delete:  (id) => api.delete(`/banners/${id}`),
};

export const uploadAPI = {
  upload: (image) => api.post('/upload', { image }),
  delete: (public_id) => api.delete(`/upload/${public_id}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
