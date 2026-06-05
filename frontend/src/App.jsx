import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login              from './pages/Auth/Login';
import Register           from './pages/Auth/Register';
import CuisinierDashboard from './pages/Cuisinier/CuisinierDashboard';
import AdminDashboard     from './pages/Admin/Dashboard';
import GestionUsers       from './pages/Admin/GestionUsers';
import ServeurDashboard   from './pages/Serveur/ServeurDashboard';

// ── Guard de route par rôle ───────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0f172a' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🍽️</div>
        <p style={{ color:'#f97316', fontWeight:600 }}>Chargement KitchenPulse...</p>
      </div>
    </div>
  );
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles) {
    const role = user?.role?.toLowerCase();
    const allowed = allowedRoles.map(r => r.toLowerCase());
    if (!allowed.includes(role)) return <Navigate to="/login" replace />;
  }
  return children;
};

// ── Redirection intelligente après login ──────────────────────
const RoleRedirect = () => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  if (role === 'admin')     return <Navigate to="/admin" replace />;
  if (role === 'cuisinier') return <Navigate to="/cuisinier" replace />;
  if (role === 'serveur')   return <Navigate to="/serveur" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <AuthProvider>
        <Routes>
          {/* Auth */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <GestionUsers />
            </ProtectedRoute>
          } />

          {/* Cuisinier */}
          <Route path="/cuisinier/*" element={
            <ProtectedRoute allowedRoles={['cuisinier', 'admin']}>
              <CuisinierDashboard />
            </ProtectedRoute>
          } />

          {/* Serveur */}
          <Route path="/serveur/*" element={
            <ProtectedRoute allowedRoles={['serveur', 'admin']}>
              <ServeurDashboard />
            </ProtectedRoute>
          } />

          {/* Redirections */}
          <Route path="/" element={<RoleRedirect />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
