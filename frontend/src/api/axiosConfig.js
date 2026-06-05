import axios from 'axios';

const api = axios.create({
  // Avec le proxy Vite, on met juste '/' — pas besoin de localhost:3001
  baseURL: '/',
  timeout: 10000,
});

// Injecte le JWT automatiquement dans chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si 401 → token expiré → retour login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kp_token');
      localStorage.removeItem('kp_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;