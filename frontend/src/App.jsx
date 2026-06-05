import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login         from './pages/Login';
import Menu          from './pages/client/Menu';
import Panier        from './pages/client/Panier';
import SuiviCommande from './pages/client/SuiviCommande';

// Route protégée — redirige vers / si pas connecté
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#0A0C10',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#F5A623', fontFamily: 'Sora, sans-serif', fontSize: 14
    }}>
      Chargement…
    </div>
  );
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Splash + Auth */}
          <Route path="/" element={<Login />} />

          {/* Client */}
          <Route path="/menu" element={
            <PrivateRoute allowedRoles={['CLIENT']}>
              <Menu />
            </PrivateRoute>
          } />
          <Route path="/panier" element={
            <PrivateRoute allowedRoles={['CLIENT']}>
              <Panier />
            </PrivateRoute>
          } />
          <Route path="/suivi/:orderId" element={
            <PrivateRoute allowedRoles={['CLIENT']}>
              <SuiviCommande />
            </PrivateRoute>
          } />
          <Route path="/suivi" element={
            <PrivateRoute allowedRoles={['CLIENT']}>
              <SuiviCommande />
            </PrivateRoute>
          } />

          {/* Placeholder autres rôles — à compléter par les autres membres */}
          <Route path="/cuisine"  element={<div style={{color:'white',padding:40}}>🍳 Interface Cuisinier — feat/cuisinier</div>} />
          <Route path="/serveur"  element={<div style={{color:'white',padding:40}}>🤵 Interface Serveur — feat/serveur-admin</div>} />
          <Route path="/admin"    element={<div style={{color:'white',padding:40}}>⚙️ Dashboard Admin — feat/serveur-admin</div>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}