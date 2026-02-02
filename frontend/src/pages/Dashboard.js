import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [trailers, setTrailers] = useState([]);
  const [remolques, setRemolques] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [dashRes, trailersRes, remolquesRes] = await Promise.all([
        api.get('/reportes/dashboard'),
        api.get('/trailers'),
        api.get('/remolques')
      ]);
      setDashboard(dashRes.data);
      setTrailers(trailersRes.data);
      setRemolques(remolquesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (!dashboard) {
    return <div className="text-center py-8">Error al cargar datos</div>;
  }

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <Link to="/viajes/nuevo" className="btn btn-primary">
          + Nuevo Viaje
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal (izquierda y centro) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Viajes Activos</p>
                  <p className="text-3xl font-bold mt-2">{dashboard.viajes_activos}</p>
                </div>
                <div className="text-5xl opacity-50">🚛</div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Ingresos del Mes</p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(dashboard.mes_actual.ingresos)}
                  </p>
                </div>
                <div className="text-5xl opacity-50">💰</div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Gastos del Mes</p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(dashboard.mes_actual.gastos)}
                  </p>
                </div>
                <div className="text-5xl opacity-50">📉</div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Utilidad del Mes</p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(dashboard.mes_actual.utilidad)}
                  </p>
                </div>
                <div className="text-5xl opacity-50">📈</div>
              </div>
            </div>
          </div>

          {/* Alertas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboard.trailers_mantenimiento > 0 && (
              <div className="card bg-yellow-50 border-l-4 border-warning">
                <div className="flex items-center">
                  <span className="text-3xl mr-4">⚠️</span>
                  <div>
                    <h3 className="font-bold text-gray-800">Trailers en Mantenimiento</h3>
                    <p className="text-gray-600">
                      {dashboard.trailers_mantenimiento} unidad(es) actualmente en mantenimiento
                    </p>
                  </div>
                </div>
              </div>
            )}

            {dashboard.refacciones_bajo_stock > 0 && (
              <div className="card bg-red-50 border-l-4 border-danger">
                <div className="flex items-center">
                  <span className="text-3xl mr-4">📦</span>
                  <div>
                    <h3 className="font-bold text-gray-800">Stock Bajo</h3>
                    <p className="text-gray-600">
                      {dashboard.refacciones_bajo_stock} refacción(es) con stock bajo o agotado
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Accesos rápidos */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Accesos Rápidos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/viajes/nuevo"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors text-center"
              >
                <div className="text-4xl mb-2">➕</div>
                <div className="font-medium">Nuevo Viaje</div>
              </Link>
              <Link
                to="/mantenimiento"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors text-center"
              >
                <div className="text-4xl mb-2">🔧</div>
                <div className="font-medium">Mantenimiento</div>
              </Link>
              <Link
                to="/refacciones"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors text-center"
              >
                <div className="text-4xl mb-2">🔩</div>
                <div className="font-medium">Inventario</div>
              </Link>
              <Link
                to="/reportes"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors text-center"
              >
                <div className="text-4xl mb-2">📊</div>
                <div className="font-medium">Reportes</div>
              </Link>
            </div>
          </div>
        </div>

        {/* Columna derecha - Casillas especiales */}
        <div className="space-y-6">
          {/* Casilla de Trailers */}
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="text-2xl mr-2">🚚</span>
                Trailers
              </h2>
              <Link to="/trailers" className="text-primary hover:text-blue-700 text-sm font-medium">
                Ver todos →
              </Link>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-white p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {trailers.filter(t => t.estado === 'activo').length}
                  </div>
                  <div className="text-xs text-gray-600">Activos</div>
                </div>
                <div className="bg-white p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {trailers.filter(t => t.estado === 'mantenimiento').length}
                  </div>
                  <div className="text-xs text-gray-600">Mantenimiento</div>
                </div>
                <div className="bg-white p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {trailers.length}
                  </div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 max-h-48 overflow-y-auto">
                {trailers.slice(0, 5).map(trailer => (
                  <div key={trailer.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-bold text-gray-800">{trailer.numero_economico}</div>
                      <div className="text-xs text-gray-500">{trailer.placas}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trailer.estado === 'activo' ? 'bg-green-100 text-green-800' :
                      trailer.estado === 'mantenimiento' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {trailer.estado.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Casilla de Remolques */}
          <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="text-2xl mr-2">📦</span>
                Remolques
              </h2>
              <Link to="/remolques" className="text-primary hover:text-blue-700 text-sm font-medium">
                Ver todos →
              </Link>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-white p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {remolques.filter(r => r.estado === 'disponible').length}
                  </div>
                  <div className="text-xs text-gray-600">Disponibles</div>
                </div>
                <div className="bg-white p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {remolques.filter(r => r.estado === 'en_uso').length}
                  </div>
                  <div className="text-xs text-gray-600">En Uso</div>
                </div>
                <div className="bg-white p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {remolques.length}
                  </div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 max-h-48 overflow-y-auto">
                {remolques.slice(0, 5).map(remolque => (
                  <div key={remolque.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-bold text-gray-800">{remolque.numero_remolque}</div>
                      <div className="text-xs text-gray-500">{remolque.capacidad_toneladas} Ton</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      remolque.estado === 'disponible' ? 'bg-green-100 text-green-800' :
                      remolque.estado === 'en_uso' ? 'bg-blue-100 text-blue-800' :
                      remolque.estado === 'mantenimiento' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {remolque.estado.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
