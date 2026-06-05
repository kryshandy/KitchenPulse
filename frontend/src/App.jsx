import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';

// ── Pages Auth ────────────────────────────────────────────────
import Login    from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// ── Pages Client ──────────────────────────────────────────────
import Menu          from './pages/client/Menu';
import Panier        from './pages/client/Panier';
import SuiviCommande from './pages/client/SuiviCommande';

// ── Pages Staff (feat/cuisinier & feat/serveur-admin) ─────────
import CuisinierDashboard from './pages/Cuisinier/CuisinierDashboard';
import AdminDashboard     from './pages/Admin/Dashboard';
import GestionUsers       from './pages/Admin/GestionUsers';
import ServeurDashboard   from './pages/Serveur/ServeurDashboard';

// ── Guard : redirige si pas connecté ou mauvais rôle ──────────
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#0A0C10',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#F5A623', fontFamily: 'Sora, sans-serif', fontSize: 14,
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

// ── Redirection intelligente selon le rôle après login ────────
const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user)   return <Navigate to="/login" replace />;

  const role = user.role?.toLowerCase();
  if (role === 'admin')     return <Navigate to="/admin"     replace />;
  if (role === 'cuisinier') return <Navigate to="/cuisinier" replace />;
  if (role === 'serveur')   return <Navigate to="/serveur"   replace />;
  return <Navigate to="/menu" replace />;   // client par défaut
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        <Routes>
          {/* Auth */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Client */}
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

          {/* Cuisinier */}
          <Route path="/cuisinier/*" element={
            <PrivateRoute allowedRoles={['cuisinier', 'admin']}>
              <CuisinierDashboard />
            </PrivateRoute>
          } />

          {/* Serveur */}
          <Route path="/serveur/*" element={
            <PrivateRoute allowedRoles={['serveur', 'admin']}>
              <ServeurDashboard />
            </PrivateRoute>
          } />

          {/* Admin */}
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

          {/* Racine — redirect selon rôle */}
          <Route path="/" element={<RoleRedirect />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}