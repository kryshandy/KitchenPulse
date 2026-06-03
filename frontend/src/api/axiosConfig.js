import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Port standard du serveur Node Express
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur automatique pour le JWT (Laissé actif, ne bloque pas si vide)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Sera alimenté par feat/setup-auth
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;