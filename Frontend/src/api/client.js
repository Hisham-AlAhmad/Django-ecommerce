import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/* ── Request interceptor: attach access token ─────────────── */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ── Response interceptor: silent refresh on 401 ─────────── */
let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
  pendingQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  pendingQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem('refresh_token')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refresh = localStorage.getItem('refresh_token');
        const { data } = await axios.post(`${BASE_URL}/users/token/refresh/`, {
          refresh,
        });
        localStorage.setItem('access_token', data.access);
        api.defaults.headers.common.Authorization = `Bearer ${data.access}`;
        processQueue(null, data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

/* ── Auth ─────────────────────────────────────────────────── */
export const authApi = {
  register: (data) => api.post('/users/register/', data),
  login:    (data) => api.post('/users/login/', data),
  logout:   (refresh) => api.post('/users/logout/', { refresh }),
  refresh:  (refresh) => api.post('/users/token/refresh/', { refresh }),
  profile:  () => api.get('/users/profile/'),
  updateProfile: (data) => api.patch('/users/profile/', data),
  addresses:      () => api.get('/users/addresses/'),
  createAddress:  (data) => api.post('/users/addresses/', data),
  updateAddress:  (id, data) => api.patch(`/users/addresses/${id}/`, data),
  deleteAddress:  (id) => api.delete(`/users/addresses/${id}/`),
};

/* ── Products ─────────────────────────────────────────────── */
export const productsApi = {
  list:       (params) => api.get('/products/', { params }),
  detail:     (slug)   => api.get(`/products/${slug}/`),
  categories: ()       => api.get('/products/categories/'),
};

/* ── Cart ─────────────────────────────────────────────────── */
export const cartApi = {
  get:    ()                       => api.get('/cart/'),
  add:    (product_id, quantity)   => api.post('/cart/', { product_id, quantity }),
  update: (item_id, quantity)      => api.patch(`/cart/items/${item_id}/`, { quantity }),
  remove: (item_id)                => api.delete(`/cart/items/${item_id}/`),
};

/* ── Orders ───────────────────────────────────────────────── */
export const ordersApi = {
  checkout: (data) => api.post('/orders/checkout/', data),
  list:     ()     => api.get('/orders/'),
  detail:   (id)   => api.get(`/orders/${id}/`),
};

/* ── Contact / Testimonials ───────────────────────────────── */
export const contactApi = {
  submit:       (data) => api.post('/contact/', data),
  testimonials: ()     => api.get('/testimonials/'),
};
