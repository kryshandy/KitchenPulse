import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import CuisinierDashboard from './pages/Cuisinier/CuisinierDashboard';

// Guard de route par rôle
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Chargement...</div>;
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <AuthProvider>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Cuisinier Dashboard (remplace les deux anciennes routes) */}
          <Route
            path="/cuisinier/*"
            element={
              <ProtectedRoute allowedRoles={['cuisinier', 'admin']}>
                <CuisinierDashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirections */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;