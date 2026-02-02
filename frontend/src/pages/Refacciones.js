import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Refacciones() {
  const [refacciones, setRefacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBajoStock, setShowBajoStock] = useState(false);

  useEffect(() => {
    cargarRefacciones();
  }, [showBajoStock]);

  const cargarRefacciones = async () => {
    try {
      const url = showBajoStock ? '/refacciones/stock-bajo' : '/refacciones';
      const response = await api.get(url);
      setRefacciones(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar refacciones:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const getStockStatus = (actual, minimo) => {
    if (actual === 0) return { color: 'bg-red-100 text-red-800', text: 'AGOTADO' };
    if (actual <= minimo) return { color: 'bg-yellow-100 text-yellow-800', text: 'BAJO' };
    return { color: 'bg-green-100 text-green-800', text: 'OK' };
  };

  if (loading) {
    return <div className="text-center py-8">Cargando inventario...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Inventario de Refacciones</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowBajoStock(!showBajoStock)}
            className={`btn ${showBajoStock ? 'btn-warning' : 'btn-secondary'}`}
          >
            {showBajoStock ? '⚠️ Stock Bajo' : 'Ver Todo'}
          </button>
          <button className="btn btn-primary">
            + Nueva Refacción
          </button>
        </div>
      </div>

      {/* Lista de refacciones */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Precio Unitario</th>
                <th>Ubicación</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {refacciones.map((ref) => {
                const status = getStockStatus(ref.stock_actual, ref.stock_minimo);
                return (
                  <tr key={ref.id} className="hover:bg-gray-50">
                    <td className="font-medium">{ref.codigo}</td>
                    <td>{ref.nombre}</td>
                    <td>{ref.categoria}</td>
                    <td className="font-bold">
                      {ref.stock_actual}
                    </td>
                    <td className="text-gray-500">{ref.stock_minimo}</td>
                    <td className="font-medium text-green-600">
                      {formatCurrency(ref.precio_unitario)}
                    </td>
                    <td className="text-sm text-gray-500">{ref.ubicacion}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {refacciones.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {showBajoStock ? 'No hay refacciones con stock bajo' : 'No hay refacciones registradas'}
            </div>
          )}
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-blue-50">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Total de Refacciones</h3>
          <p className="text-3xl font-bold text-primary">{refacciones.length}</p>
        </div>
        <div className="card bg-yellow-50">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Stock Bajo</h3>
          <p className="text-3xl font-bold text-warning">
            {refacciones.filter(r => r.stock_actual <= r.stock_minimo && r.stock_actual > 0).length}
          </p>
        </div>
        <div className="card bg-red-50">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Agotados</h3>
          <p className="text-3xl font-bold text-danger">
            {refacciones.filter(r => r.stock_actual === 0).length}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Refacciones;
