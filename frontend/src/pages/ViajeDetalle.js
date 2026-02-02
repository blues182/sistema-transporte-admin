import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function ViajeDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viaje, setViaje] = useState(null);
  const [utilidad, setUtilidad] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarViaje();
    cargarUtilidad();
  }, [id]);

  const cargarViaje = async () => {
    try {
      const response = await api.get(`/viajes/${id}`);
      setViaje(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar viaje:', error);
      setLoading(false);
    }
  };

  const cargarUtilidad = async () => {
    try {
      const response = await api.get(`/viajes/${id}/utilidad`);
      setUtilidad(response.data);
    } catch (error) {
      console.error('Error al cargar utilidad:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (!viaje) {
    return <div className="text-center py-8">Viaje no encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Detalles del Viaje</h1>
        <button onClick={() => navigate('/viajes')} className="btn btn-secondary">
          ← Volver
        </button>
      </div>

      {/* Información General */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Información General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Folio</p>
            <p className="font-medium text-lg">{viaje.folio}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estado</p>
            <p className="font-medium text-lg capitalize">{viaje.estado.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha Salida</p>
            <p className="font-medium">{formatDate(viaje.fecha_salida)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha Llegada</p>
            <p className="font-medium">{formatDate(viaje.fecha_llegada)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Origen</p>
            <p className="font-medium">{viaje.origen}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Destino</p>
            <p className="font-medium">{viaje.destino}</p>
          </div>
        </div>
      </div>

      {/* Información del Cliente y Unidad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-3">Cliente</h3>
          <p className="text-lg font-medium text-primary">{viaje.cliente_nombre}</p>
        </div>
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-3">Trailer</h3>
          <p className="text-lg font-medium">{viaje.numero_economico}</p>
          <p className="text-sm text-gray-500">{viaje.placas}</p>
        </div>
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-3">Conductor</h3>
          <p className="text-lg font-medium">{viaje.conductor_nombre}</p>
        </div>
      </div>

      {/* Carga */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Información de Carga</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Descripción</p>
            <p className="font-medium">{viaje.carga_descripcion || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Peso (kg)</p>
            <p className="font-medium">{viaje.peso_carga ? `${viaje.peso_carga} kg` : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Gastos */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Gastos del Viaje</h2>
        {viaje.gastos && viaje.gastos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {viaje.gastos.map((gasto) => (
                  <tr key={gasto.id}>
                    <td>{new Date(gasto.fecha).toLocaleDateString('es-MX')}</td>
                    <td className="capitalize">{gasto.tipo_gasto.replace('_', ' ')}</td>
                    <td>{gasto.descripcion}</td>
                    <td className="font-medium text-red-600">{formatCurrency(gasto.monto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No hay gastos registrados</p>
        )}
      </div>

      {/* Utilidad */}
      {utilidad && (
        <div className="card bg-gradient-to-br from-green-50 to-blue-50">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Análisis de Utilidad</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-sm text-gray-500">Monto Cobrado</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(utilidad.monto_cobrado)}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-sm text-gray-500">Total Gastos</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(utilidad.total_gastos)}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-sm text-gray-500">Utilidad</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(utilidad.utilidad)}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-sm text-gray-500">Margen</p>
              <p className="text-2xl font-bold text-purple-600">{utilidad.margen_porcentaje}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViajeDetalle;
