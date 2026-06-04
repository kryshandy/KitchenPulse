import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

// ─── Données mock (à supprimer quand feat/setup-auth est mergé) ───
const MOCK_USER = {
  id: 1,
  first_name: 'Marie',
  last_name: 'Kamdem',
  email: 'marie@gmail.com',
  role: 'CLIENT',
};

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger depuis localStorage au démarrage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // ─── LOGIN ───────────────────────────────────────────────────────
  const login = async (email, password) => {
    // TODO : remplacer le mock par l'appel réel quand setup-auth est mergé
    // const { data } = await api.post('/auth/login', { email, password });
    // const { token: t, user: u } = data;

    // Mock temporaire
    const t = 'mock-jwt-token-' + Date.now();
    const u = { ...MOCK_USER, email };

    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  };

  // ─── REGISTER ────────────────────────────────────────────────────
  const register = async (first_name, last_name, email, password) => {
    // TODO : remplacer le mock
    // const { data } = await api.post('/auth/register', { first_name, last_name, email, password });
    // return login(email, password);

    return login(email, password);
  };

  // ─── LOGOUT ──────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);