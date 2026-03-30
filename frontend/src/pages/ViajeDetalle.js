import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast, Toast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

function ViajeDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viaje, setViaje] = useState(null);
  const [utilidad, setUtilidad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGastoModal, setShowGastoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [trailers, setTrailers] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const { toasts, removeToast, toast } = useToast();
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
    cargarCatalogos();
  }, [id]);

  const cargarCatalogos = async () => {
    try {
      const [trailersRes, conductoresRes, clientesRes] = await Promise.all([
        api.get('/trailers'),
        api.get('/conductores'),
        api.get('/clientes')
      ]);
      setTrailers(trailersRes.data);
      setConductores(conductoresRes.data);
      setClientes(clientesRes.data);
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
    }
  };

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
    try {
      await api.put(`/viajes/${id}`, { estado: 'completado' });
      toast.success('Viaje marcado como completado');
      cargarViaje();
    } catch (error) {
      toast.error('Error al completar el viaje');
    }
  };

  const eliminarViaje = async () => {
    setConfirmEliminar(false);
    try {
      await api.delete(`/viajes/${id}`);
      navigate('/viajes');
    } catch (error) {
      toast.error('Error al eliminar el viaje: ' + (error.response?.data?.error || error.message));
    }
  };

  const abrirModalEdicion = () => {
    setEditForm({
      folio: viaje.folio || '',
      numero_orden: viaje.numero_orden || '',
      fecha_salida: viaje.fecha_salida ? viaje.fecha_salida.slice(0, 16) : '',
      fecha_llegada: viaje.fecha_llegada ? viaje.fecha_llegada.slice(0, 16) : '',
      origen: viaje.origen || '',
      destino: viaje.destino || '',
      trailer_id: viaje.trailer_id || '',
      conductor_id: viaje.conductor_id || '',
      cliente_id: viaje.cliente_id || '',
      carga_descripcion: viaje.carga_descripcion || '',
      tipo_carga: viaje.tipo_carga || 'general',
      peso_carga: viaje.peso_carga || '',
      monto_cobrado: viaje.monto_cobrado || '',
      km_inicial: viaje.km_inicial || '',
      km_final: viaje.km_final || '',
      estado: viaje.estado || 'programado',
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const dataToSend = { ...editForm };
      ['trailer_id', 'conductor_id', 'cliente_id'].forEach(k => {
        if (dataToSend[k]) dataToSend[k] = parseInt(dataToSend[k]);
      });
      ['monto_cobrado', 'peso_carga', 'km_inicial', 'km_final'].forEach(k => {
        if (dataToSend[k]) dataToSend[k] = parseFloat(dataToSend[k]);
        else delete dataToSend[k];
      });
      ['numero_orden', 'fecha_llegada', 'carga_descripcion'].forEach(k => {
        if (!dataToSend[k]) delete dataToSend[k];
      });
      await api.put(`/viajes/${id}`, dataToSend);
      toast.success('Viaje actualizado correctamente');
      setShowEditModal(false);
      cargarViaje();
      cargarUtilidad();
    } catch (error) {
      toast.error('Error al actualizar el viaje: ' + (error.response?.data?.error || error.message));
    } finally {
      setEditLoading(false);
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
      toast.success('Gasto agregado exitosamente');
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
      toast.error('Error al agregar el gasto: ' + (error.response?.data?.error || error.message));
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
      <Toast toasts={toasts} removeToast={removeToast} />
      <ConfirmModal
        isOpen={confirmEliminar}
        title="Eliminar viaje"
        message={`¿Estás seguro de eliminar el viaje ${viaje?.folio}? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        onConfirm={eliminarViaje}
        onCancel={() => setConfirmEliminar(false)}
      />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Detalles del Viaje</h1>
        <div className="flex space-x-4">
          {viaje.estado !== 'completado' && viaje.estado !== 'cancelado' && (
            <button onClick={completarViaje} className="btn btn-success">
              ✓ Completar Viaje
            </button>
          )}
          <button onClick={abrirModalEdicion} className="btn btn-primary">
            ✎ Editar
          </button>
          <button onClick={() => setConfirmEliminar(true)} className="btn btn-danger">
            🗑 Eliminar
          </button>
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

      {/* Modal Editar Viaje */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Editar Viaje</h2>
            <form onSubmit={handleSubmitEdit} className="space-y-4">

              {/* Identificación */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Folio</label>
                  <input type="text" name="folio" value={editForm.folio} onChange={handleEditChange} className="input" required />
                </div>
                <div>
                  <label className="label">Número de Orden</label>
                  <input type="text" name="numero_orden" value={editForm.numero_orden} onChange={handleEditChange} className="input" placeholder="Opcional" />
                </div>
                <div>
                  <label className="label">Estado</label>
                  <select name="estado" value={editForm.estado} onChange={handleEditChange} className="input">
                    <option value="programado">Programado</option>
                    <option value="en_ruta">En Ruta</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Fecha de Salida *</label>
                  <input type="datetime-local" name="fecha_salida" value={editForm.fecha_salida} onChange={handleEditChange} className="input" required />
                </div>
                <div>
                  <label className="label">Fecha de Llegada</label>
                  <input type="datetime-local" name="fecha_llegada" value={editForm.fecha_llegada} onChange={handleEditChange} className="input" />
                </div>
              </div>

              {/* Ruta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Origen *</label>
                  <input type="text" name="origen" value={editForm.origen} onChange={handleEditChange} className="input" required />
                </div>
                <div>
                  <label className="label">Destino *</label>
                  <input type="text" name="destino" value={editForm.destino} onChange={handleEditChange} className="input" required />
                </div>
              </div>

              {/* Asignaciones */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Cliente *</label>
                  <select name="cliente_id" value={editForm.cliente_id} onChange={handleEditChange} className="input" required>
                    <option value="">Seleccionar</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Trailer *</label>
                  <select name="trailer_id" value={editForm.trailer_id} onChange={handleEditChange} className="input" required>
                    <option value="">Seleccionar</option>
                    {trailers.map(t => <option key={t.id} value={t.id}>{t.numero_economico} - {t.placas}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Conductor *</label>
                  <select name="conductor_id" value={editForm.conductor_id} onChange={handleEditChange} className="input" required>
                    <option value="">Seleccionar</option>
                    {conductores.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellidos}</option>)}
                  </select>
                </div>
              </div>

              {/* Carga y Financiero */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Descripción de Carga</label>
                  <input type="text" name="carga_descripcion" value={editForm.carga_descripcion} onChange={handleEditChange} className="input" />
                </div>
                <div>
                  <label className="label">Tipo de Carga</label>
                  <select name="tipo_carga" value={editForm.tipo_carga} onChange={handleEditChange} className="input">
                    <option value="general">General</option>
                    <option value="refrigerada">Refrigerada</option>
                    <option value="peligrosa">Peligrosa</option>
                    <option value="liquida">Líquida</option>
                    <option value="granel">Granel</option>
                  </select>
                </div>
                <div>
                  <label className="label">Peso (kg)</label>
                  <input type="number" name="peso_carga" value={editForm.peso_carga} onChange={handleEditChange} className="input" step="0.01" />
                </div>
                <div>
                  <label className="label">Monto Cobrado *</label>
                  <input type="number" name="monto_cobrado" value={editForm.monto_cobrado} onChange={handleEditChange} className="input" step="0.01" required />
                </div>
                <div>
                  <label className="label">KM Inicial</label>
                  <input type="number" name="km_inicial" value={editForm.km_inicial} onChange={handleEditChange} className="input" step="0.01" />
                </div>
                <div>
                  <label className="label">KM Final</label>
                  <input type="number" name="km_final" value={editForm.km_final} onChange={handleEditChange} className="input" step="0.01" />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  {editLoading ? 'Guardando...' : 'Guardar Cambios'}
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
