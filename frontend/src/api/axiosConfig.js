import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Intercepteur : ajoute le token JWT à chaque requête
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// C'est cette ligne qui manquait ou qui n'était pas lue !
export default API;