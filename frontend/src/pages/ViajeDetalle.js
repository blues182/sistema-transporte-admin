import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function ViajeDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viaje, setViaje] = useState(null);
  const [utilidad, setUtilidad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGastoModal, setShowGastoModal] = useState(false);
  const [gastoForm, setGastoForm] = useState({
    tipo_gasto: 'diesel',
    descripcion: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    litros_diesel: '',
    precio_litro: '',
    numero_caseta: '',
    nombre_caseta: ''
  });

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

  const completarViaje = async () => {
    if (!window.confirm('¿Está seguro de marcar este viaje como completado?')) return;
    try {
      await api.put(`/viajes/${id}`, { estado: 'completado' });
      alert('Viaje completado exitosamente');
      cargarViaje();
    } catch (error) {
      console.error('Error al completar viaje:', error);
      alert('Error al completar el viaje');
    }
  };

  const handleGastoChange = (e) => {
    const { name, value } = e.target;
    setGastoForm(prev => {
      const newForm = { ...prev, [name]: value };
      
      // Calcular monto automáticamente para diesel
      if (name === 'litros_diesel' || name === 'precio_litro') {
        const litros = name === 'litros_diesel' ? parseFloat(value) : parseFloat(newForm.litros_diesel);
        const precio = name === 'precio_litro' ? parseFloat(value) : parseFloat(newForm.precio_litro);
        if (litros && precio) {
          newForm.monto = (litros * precio).toFixed(2);
        }
      }
      
      return newForm;
    });
  };

  const handleSubmitGasto = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        viaje_id: parseInt(id),
        tipo_gasto: gastoForm.tipo_gasto,
        monto: parseFloat(gastoForm.monto),
        fecha: gastoForm.fecha
      };

      if (gastoForm.descripcion) dataToSend.descripcion = gastoForm.descripcion;
      if (gastoForm.tipo_gasto === 'diesel') {
        if (gastoForm.litros_diesel) dataToSend.litros_diesel = parseFloat(gastoForm.litros_diesel);
        if (gastoForm.precio_litro) dataToSend.precio_litro = parseFloat(gastoForm.precio_litro);
      }
      if (gastoForm.tipo_gasto === 'casetas') {
        if (gastoForm.numero_caseta) dataToSend.numero_caseta = gastoForm.numero_caseta;
        if (gastoForm.nombre_caseta) dataToSend.nombre_caseta = gastoForm.nombre_caseta;
      }

      await api.post('/gastos', dataToSend);
      alert('Gasto agregado exitosamente');
      setShowGastoModal(false);
      setGastoForm({
        tipo_gasto: 'diesel',
        descripcion: '',
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        litros_diesel: '',
        precio_litro: '',
        numero_caseta: '',
        nombre_caseta: ''
      });
      cargarViaje();
      cargarUtilidad();
    } catch (error) {
      console.error('Error al agregar gasto:', error);
      alert('Error al agregar el gasto');
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
        <div className="flex space-x-4">
          {viaje.estado !== 'completado' && viaje.estado !== 'cancelado' && (
            <button onClick={completarViaje} className="btn btn-success">
              ✓ Completar Viaje
            </button>
          )}
          <button onClick={() => navigate('/viajes')} className="btn btn-secondary">
            ← Volver
          </button>
        </div>
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Gastos del Viaje</h2>
          <button onClick={() => setShowGastoModal(true)} className="btn btn-primary">
            + Agregar Gasto
          </button>
        </div>
        {viaje.gastos && viaje.gastos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Detalles</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {viaje.gastos.map((gasto) => (
                  <tr key={gasto.id}>
                    <td>{new Date(gasto.fecha).toLocaleDateString('es-MX')}</td>
                    <td className="capitalize">{gasto.tipo_gasto.replace('_', ' ')}</td>
                    <td>
                      {gasto.tipo_gasto === 'diesel' && gasto.litros_diesel && (
                        <div className="text-sm">
                          <div><span className="font-medium">{gasto.litros_diesel}</span> litros</div>
                          <div className="text-gray-500">@ {formatCurrency(gasto.precio_litro)}/L</div>
                        </div>
                      )}
                      {gasto.tipo_gasto === 'casetas' && gasto.nombre_caseta && (
                        <div className="text-sm">
                          <div className="font-medium">{gasto.nombre_caseta}</div>
                          {gasto.numero_caseta && <div className="text-gray-500">#{gasto.numero_caseta}</div>}
                        </div>
                      )}
                    </td>
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

      {/* Modal Agregar Gasto */}
      {showGastoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Agregar Gasto</h2>
            <form onSubmit={handleSubmitGasto} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Tipo de Gasto *</label>
                  <select
                    name="tipo_gasto"
                    value={gastoForm.tipo_gasto}
                    onChange={handleGastoChange}
                    className="input"
                    required
                  >
                    <option value="diesel">Diesel</option>
                    <option value="casetas">Casetas</option>
                    <option value="viaticos">Viáticos</option>
                    <option value="reparacion">Reparación</option>
                    <option value="estacionamiento">Estacionamiento</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="label">Fecha *</label>
                  <input
                    type="date"
                    name="fecha"
                    value={gastoForm.fecha}
                    onChange={handleGastoChange}
                    className="input"
                    required
                  />
                </div>
              </div>

              {/* Campos específicos para Diesel */}
              {gastoForm.tipo_gasto === 'diesel' && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                  <h3 className="font-bold text-gray-700">Detalles del Diesel</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Litros</label>
                      <input
                        type="number"
                        name="litros_diesel"
                        value={gastoForm.litros_diesel}
                        onChange={handleGastoChange}
                        className="input"
                        placeholder="250"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="label">Precio por Litro</label>
                      <input
                        type="number"
                        name="precio_litro"
                        value={gastoForm.precio_litro}
                        onChange={handleGastoChange}
                        className="input"
                        placeholder="24.50"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="label">Monto Total *</label>
                      <input
                        type="number"
                        name="monto"
                        value={gastoForm.monto}
                        onChange={handleGastoChange}
                        className="input"
                        placeholder="6125.00"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Campos específicos para Casetas */}
              {gastoForm.tipo_gasto === 'casetas' && (
                <div className="bg-yellow-50 p-4 rounded-lg space-y-4">
                  <h3 className="font-bold text-gray-700">Detalles de la Caseta</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Nombre/Ubicación</label>
                      <input
                        type="text"
                        name="nombre_caseta"
                        value={gastoForm.nombre_caseta}
                        onChange={handleGastoChange}
                        className="input"
                        placeholder="Caseta Palmillas"
                      />
                    </div>
                    <div>
                      <label className="label">Número de Caseta</label>
                      <input
                        type="text"
                        name="numero_caseta"
                        value={gastoForm.numero_caseta}
                        onChange={handleGastoChange}
                        className="input"
                        placeholder="145"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Campos comunes */}
              {gastoForm.tipo_gasto !== 'diesel' && (
                <div>
                  <label className="label">Monto *</label>
                  <input
                    type="number"
                    name="monto"
                    value={gastoForm.monto}
                    onChange={handleGastoChange}
                    className="input"
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>
              )}

              <div>
                <label className="label">Descripción</label>
                <input
                  type="text"
                  name="descripcion"
                  value={gastoForm.descripcion}
                  onChange={handleGastoChange}
                  className="input"
                  placeholder="Detalles adicionales"
                />
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowGastoModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViajeDetalle;
