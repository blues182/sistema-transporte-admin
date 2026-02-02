import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Viajes from './pages/Viajes';
import ViajeDetalle from './pages/ViajeDetalle';
import NuevoViaje from './pages/NuevoViaje';
import Trailers from './pages/Trailers';
import Conductores from './pages/Conductores';
import Clientes from './pages/Clientes';
import Refacciones from './pages/Refacciones';
import Mantenimiento from './pages/Mantenimiento';
import Reportes from './pages/Reportes';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/viajes" element={<Viajes />} />
          <Route path="/viajes/:id" element={<ViajeDetalle />} />
          <Route path="/viajes/nuevo" element={<NuevoViaje />} />
          <Route path="/trailers" element={<Trailers />} />
          <Route path="/conductores" element={<Conductores />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/refacciones" element={<Refacciones />} />
          <Route path="/mantenimiento" element={<Mantenimiento />} />
          <Route path="/reportes" element={<Reportes />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
