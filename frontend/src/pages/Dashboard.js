import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      const response = await api.get('/reportes/dashboard');
      setDashboard(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
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
            <div className="text-4xl mb-2">📦</div>
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
  );
}

export default Dashboard;
