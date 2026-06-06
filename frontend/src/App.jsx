/**
 * App.jsx — KitchenPulse
 * Identique à l'original + SplashScreen ajouté avant le login.
 * ThemeProvider conservé. Splash affiché UNE SEULE FOIS par session.
 */
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Auth
import SplashScreen from './pages/Auth/SplashScreen';   // ← NOUVEAU
import Login        from './pages/Auth/Login';
import Register     from './pages/Auth/Register';

// Client — dossier "Client" (majuscule)
import Menu          from './pages/Client/Menu';
import Panier        from './pages/Client/Panier';
import SuiviCommande from './pages/Client/Suivicommande';

// Cuisinier
import CuisinierDashboard from './pages/Cuisinier/CuisinierDashboard';

// Serveur
import ServeurDashboard from './pages/Serveur/ServeurDashboard';

// Admin
import AdminDashboard from './pages/Admin/Dashboard';
import GestionUsers   from './pages/Admin/GestionUsers';

// Guard : redirige si pas connecté ou mauvais rôle
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#0A0C10',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#F5A623', fontFamily: "'Sora', sans-serif", fontSize: 14,
    }}>
      Chargement…
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles) {
    const role    = user.role?.toLowerCase();
    const allowed = allowedRoles.map(r => r.toLowerCase());
    if (!allowed.includes(role)) return <Navigate to="/login" replace />;
  }
  return children;
};

// Redirection intelligente selon le rôle
const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const role = user.role?.toLowerCase();
  if (role === 'admin')     return <Navigate to="/admin"     replace />;
  if (role === 'cuisinier') return <Navigate to="/cuisinier" replace />;
  if (role === 'serveur')   return <Navigate to="/serveur"   replace />;
  return <Navigate to="/menu" replace />;
};

// ── Wrapper avec Splash ────────────────────────────────────────────────────
function AppWithSplash() {
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem('kp_splash_done')
  );

  const handleSplashDone = () => {
    sessionStorage.setItem('kp_splash_done', '1');
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onDone={handleSplashDone} />;
  }

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/menu" element={
          <PrivateRoute allowedRoles={['client']}>
            <Menu />
          </PrivateRoute>
        } />
        <Route path="/panier" element={
          <PrivateRoute allowedRoles={['client']}>
            <Panier />
          </PrivateRoute>
        } />
        <Route path="/suivi/:orderId" element={
          <PrivateRoute allowedRoles={['client']}>
            <SuiviCommande />
          </PrivateRoute>
        } />
        <Route path="/suivi" element={
          <PrivateRoute allowedRoles={['client']}>
            <SuiviCommande />
          </PrivateRoute>
        } />

        <Route path="/cuisinier/*" element={
          <PrivateRoute allowedRoles={['cuisinier', 'admin']}>
            <CuisinierDashboard />
          </PrivateRoute>
        } />

        <Route path="/serveur/*" element={
          <PrivateRoute allowedRoles={['serveur', 'admin']}>
            <ServeurDashboard />
          </PrivateRoute>
        } />

        <Route path="/admin" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin/users" element={
          <PrivateRoute allowedRoles={['admin']}>
            <GestionUsers />
          </PrivateRoute>
        } />

        <Route path="/"  element={<RoleRedirect />} />
        <Route path="*"  element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppWithSplash />
      </AuthProvider>
    </ThemeProvider>
  );
}