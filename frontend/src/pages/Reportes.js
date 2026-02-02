import React, { useState } from 'react';
import api from '../services/api';

function Reportes() {
  const [tipoReporte, setTipoReporte] = useState('semanal');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);

  const generarReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      alert('Selecciona un rango de fechas');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/reportes/semanal', {
        params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
      });
      setReporte(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al generar reporte:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Reportes</h1>

      {/* Filtros */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Generar Reporte</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Tipo de Reporte</label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
              className="input"
            >
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
              <option value="utilidad">Utilidad por Viaje</option>
            </select>
          </div>
          <div>
            <label className="label">Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={generarReporte}
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Generando...' : 'Generar'}
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {reporte && (
        <div className="space-y-6">
          <div className="card bg-gradient-to-br from-blue-50 to-green-50">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen del Periodo</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-gray-500">Total de Viajes</p>
                <p className="text-3xl font-bold text-primary">{reporte.viajes.total}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-gray-500">Ingresos</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(reporte.viajes.ingresos)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-gray-500">Gastos</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(reporte.gastos)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-gray-500">Utilidad</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(reporte.utilidad)}
                </p>
              </div>
            </div>
            <div className="mt-4 bg-white rounded-lg p-4 shadow">
              <p className="text-sm text-gray-500">Margen de Utilidad</p>
              <p className="text-4xl font-bold text-purple-600">{reporte.margen}%</p>
            </div>
          </div>

          {reporte.mantenimiento && (
            <div className="card">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Mantenimiento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total de Mantenimientos</p>
                  <p className="text-2xl font-bold">{reporte.mantenimiento.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Costo Total</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(reporte.mantenimiento.costo)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Reportes;
