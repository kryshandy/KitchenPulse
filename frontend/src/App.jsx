import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

// Placeholder pour les pages des branches suivantes
const Placeholder = ({ title }) => <h1>{title} — à venir</h1>;

// Route protégée
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <p>Chargement...</p>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Routes protégées — pages créées dans les branches suivantes */}
      <Route path="/menu" element={
        <PrivateRoute roles={['client']}>
          <Placeholder title="Menu Client" />
        </PrivateRoute>
      } />
      <Route path="/cuisinier" element={
        <PrivateRoute roles={['cuisinier']}>
          <Placeholder title="Espace Cuisinier" />
        </PrivateRoute>
      } />
      <Route path="/serveur" element={
        <PrivateRoute roles={['serveur']}>
          <Placeholder title="Espace Serveur" />
        </PrivateRoute>
      } />
      <Route path="/admin" element={
        <PrivateRoute roles={['admin']}>
          <Placeholder title="Dashboard Admin" />
        </PrivateRoute>
      } />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;