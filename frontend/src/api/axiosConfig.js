import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.247.191.245:3001/api',   // proxy Vite → http://localhost:3001/api
  timeout: 10_000,
});

// ── Injecte le JWT automatiquement ────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Token expiré / invalide → retour login ────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kp_token');
      localStorage.removeItem('kp_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;