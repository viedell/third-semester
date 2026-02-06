import axios from 'axios';

const API_URL = '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * ============================
 * Request interceptor (AUTH)
 * ============================
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


/**
 * ============================
 * Response interceptor
 * ============================
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * ============================
 * Auth API
 * ============================
 */
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getCurrentUser: () => apiClient.get('/auth/me'),
};

/**
 * ============================
 * Posts API
 * ============================
 */
export const postsAPI = {
  getAll: (params) => apiClient.get('/posts', { params }),

  // 🔥 IMPORTANT FIX (304 issue)
  getById: (id) =>
    apiClient.get(`/posts/${id}`, {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        'If-None-Match': '',
      },
    }),

  getBySlug: (slug) => apiClient.get(`/posts/slug/${slug}`),

  getPopular: (limit = 5) =>
    apiClient.get('/posts/popular', { params: { limit } }),

  getRecent: (limit = 5) =>
    apiClient.get('/posts/recent', { params: { limit } }),

  create: (data) => apiClient.post('/posts', data),

  update: (id, data) => apiClient.patch(`/posts/${id}`, data),

  delete: (id) => apiClient.delete(`/posts/${id}`),

  getStats: () => apiClient.get('/posts/stats/admin'),
};

/**
 * ============================
 * Users API
 * ============================
 */
export const usersAPI = {
  getAll: (params) => apiClient.get('/users', { params }),
  getById: (id) => apiClient.get(`/users/${id}`),
  updateRole: (id, role) =>
    apiClient.patch(`/users/${id}/role`, { role }),
  delete: (id) => apiClient.delete(`/users/${id}`),
  getStats: () => apiClient.get('/users/stats'),
};

export default apiClient;
