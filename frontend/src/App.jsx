import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Login         from './pages/Login';
import Menu          from './pages/client/Menu';
import Panier        from './pages/client/Panier';
import SuiviCommande from './pages/client/SuiviCommande';
import Avis          from './pages/client/Avis';
import Paiement      from './pages/client/Paiement';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#0A0C10',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#F5A623', fontSize: 14, fontFamily: 'Sora, sans-serif',
    }}>Chargement…</div>
  );
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const client = ['CLIENT'];

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth */}
            <Route path="/" element={<Login />} />

            {/* Client */}
            <Route path="/menu"            element={<PrivateRoute allowedRoles={client}><Menu /></PrivateRoute>} />
            <Route path="/panier"          element={<PrivateRoute allowedRoles={client}><Panier /></PrivateRoute>} />
            <Route path="/suivi"           element={<PrivateRoute allowedRoles={client}><SuiviCommande /></PrivateRoute>} />
            <Route path="/suivi/:orderId"  element={<PrivateRoute allowedRoles={client}><SuiviCommande /></PrivateRoute>} />
            <Route path="/avis"            element={<PrivateRoute allowedRoles={client}><Avis /></PrivateRoute>} />
            <Route path="/paiement/:orderId" element={<PrivateRoute allowedRoles={client}><Paiement /></PrivateRoute>} />

            {/* Autres rôles — à compléter */}
            <Route path="/cuisine" element={<div style={{ color: '#F5A623', padding: 40, fontFamily: 'Sora,sans-serif' }}>🍳 Interface Cuisinier</div>} />
            <Route path="/serveur" element={<div style={{ color: '#F5A623', padding: 40, fontFamily: 'Sora,sans-serif' }}>🤵 Interface Serveur</div>} />
            <Route path="/admin"   element={<div style={{ color: '#F5A623', padding: 40, fontFamily: 'Sora,sans-serif' }}>⚙️ Dashboard Admin</div>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}