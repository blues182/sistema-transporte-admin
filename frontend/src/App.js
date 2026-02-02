import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Viajes from './pages/Viajes';
import ViajeDetalle from './pages/ViajeDetalle';
import NuevoViaje from './pages/NuevoViaje';
import Trailers from './pages/Trailers';
import Remolques from './pages/Remolques';
import Conductores from './pages/Conductores';
import Clientes from './pages/Clientes';
import Refacciones from './pages/Refacciones';
import Mantenimiento from './pages/Mantenimiento';
import Reportes from './pages/Reportes';

// Componente para proteger rutas
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Verificar si hay un usuario guardado
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setUsuario(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout usuario={usuario} onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/viajes" element={<Viajes />} />
                <Route path="/viajes/:id" element={<ViajeDetalle />} />
                <Route path="/viajes/nuevo" element={<NuevoViaje />} />
                <Route path="/trailers" element={<Trailers />} />
                <Route path="/remolques" element={<Remolques />} />
                <Route path="/conductores" element={<Conductores />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/refacciones" element={<Refacciones />} />
                <Route path="/mantenimiento" element={<Mantenimiento />} />
                <Route path="/reportes" element={<Reportes />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
