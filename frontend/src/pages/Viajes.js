import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

function Viajes() {
  const [viajes, setViajes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarViajes();
  }, [filtroEstado]);

  const cargarViajes = async () => {
    try {
      const params = filtroEstado ? { estado: filtroEstado } : {};
      const response = await api.get('/viajes', { params });
      setViajes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar viajes:', error);
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      programado: 'bg-blue-100 text-blue-800',
      en_ruta: 'bg-yellow-100 text-yellow-800',
      completado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center py-8">Cargando viajes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Viajes</h1>
        <Link to="/viajes/nuevo" className="btn btn-primary">
          + Nuevo Viaje
        </Link>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="label">Filtrar por Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="input w-48"
            >
              <option value="">Todos</option>
              <option value="programado">Programado</option>
              <option value="en_ruta">En Ruta</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de viajes */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Fecha Salida</th>
                <th>Ruta</th>
                <th>Cliente</th>
                <th>Trailer</th>
                <th>Conductor</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {viajes.map((viaje) => (
                <tr key={viaje.id} className="hover:bg-gray-50">
                  <td className="font-medium">{viaje.folio}</td>
                  <td>{formatDate(viaje.fecha_salida)}</td>
                  <td>
                    <div className="text-sm">
                      <div className="font-medium">{viaje.origen}</div>
                      <div className="text-gray-500">→ {viaje.destino}</div>
                    </div>
                  </td>
                  <td>{viaje.cliente_nombre}</td>
                  <td>{viaje.numero_economico}</td>
                  <td>{viaje.conductor_nombre}</td>
                  <td className="font-medium text-green-600">
                    {formatCurrency(viaje.monto_cobrado)}
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadge(viaje.estado)}`}>
                      {viaje.estado.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <Link
                      to={`/viajes/${viaje.id}`}
                      className="text-primary hover:text-blue-700 font-medium"
                    >
                      Ver detalles
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {viajes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron viajes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Viajes;
