import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restauration de session au démarrage ───────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem('kp_token');
    const savedUser  = localStorage.getItem('kp_user');

    if (savedToken) {
      setToken(savedToken);
      // Si l'user est déjà en cache, on l'affiche immédiatement
      if (savedUser) {
        try { setUser(JSON.parse(savedUser)); } catch {}
      }
      // On vérifie quand même que le token est encore valide
      api.get('/auth/me')
        .then(({ data }) => {
          setUser(data);
          localStorage.setItem('kp_user', JSON.stringify(data));
        })
        .catch(() => {
          // Token expiré ou invalide → on nettoie
          localStorage.removeItem('kp_token');
          localStorage.removeItem('kp_user');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ── Login ──────────────────────────────────────────────────
  const login = (tokenVal, userData) => {
    localStorage.setItem('kp_token', tokenVal);
    localStorage.setItem('kp_user', JSON.stringify(userData));
    setToken(tokenVal);
    setUser(userData);
  };

  // ── Logout ─────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('kp_token');
    localStorage.removeItem('kp_user');
    setToken(null);
    setUser(null);
  };

  // ── Refresh profil (après modification du compte) ──────────
  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      localStorage.setItem('kp_user', JSON.stringify(data));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);