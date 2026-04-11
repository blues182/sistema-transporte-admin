import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { useFeedback } from '../components/FeedbackProvider';

function Mantenimiento() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [remolques, setRemolques] = useState([]);
  const [refacciones, setRefacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [completandoId, setCompletandoId] = useState(null);
  const [filtroTipoUnidad, setFiltroTipoUnidad] = useState('');
  const [filtroUnidad, setFiltroUnidad] = useState('');
  const { showToast, confirmAction } = useFeedback();
  const [formData, setFormData] = useState({
    unidad_tipo: 'trailer',
    unidad_id: '',
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'preventivo',
    descripcion: '',
    kilometraje: '',
    costo_mano_obra: '',
    taller: '',
    refacciones: []
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [mantRes, trailersRes, remolquesRes, refacRes] = await Promise.allSettled([
      api.get('/mantenimiento'),
      api.get('/trailers'),
      api.get('/remolques'),
      api.get('/refacciones')
    ]);

    if (mantRes.status === 'fulfilled') {
      setMantenimientos(mantRes.value.data);
    } else {
      console.error('Error al cargar mantenimientos:', mantRes.reason);
      setMantenimientos([]);
    }

    if (trailersRes.status === 'fulfilled') {
      setTrailers(trailersRes.value.data);
    } else {
      console.error('Error al cargar trailers:', trailersRes.reason);
      setTrailers([]);
    }

    if (remolquesRes.status === 'fulfilled') {
      setRemolques(remolquesRes.value.data);
    } else {
      console.error('Error al cargar remolques:', remolquesRes.reason);
      setRemolques([]);
    }

    if (refacRes.status === 'fulfilled') {
      setRefacciones(refacRes.value.data);
    } else {
      console.error('Error al cargar refacciones:', refacRes.reason);
      setRefacciones([]);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'unidad_tipo') {
        updated.unidad_id = '';
      }
      return updated;
    });
  };

  const agregarRefaccion = () => {
    setFormData(prev => ({
      ...prev,
      refacciones: [...prev.refacciones, { refaccion_id: '', cantidad: '', precio_unitario: '' }]
    }));
  };

  const eliminarRefaccion = (index) => {
    setFormData(prev => ({
      ...prev,
      refacciones: prev.refacciones.filter((_, i) => i !== index)
    }));
  };

  const handleRefaccionChange = (index, field, value) => {
    setFormData(prev => {
      const newRefacciones = [...prev.refacciones];
      newRefacciones[index][field] = value;
      
      // Auto-llenar precio si se selecciona una refacción
      if (field === 'refaccion_id' && value) {
        const refaccion = refacciones.find(r => r.id === parseInt(value));
        if (refaccion) {
          newRefacciones[index].precio_unitario = refaccion.precio_unitario;
        }
      }
      
      return { ...prev, refacciones: newRefacciones };
    });
  };

  // Filtrar mantenimientos por unidad (trailer/remolque)
  const mantenimientosFiltrados = useMemo(() => {
    return mantenimientos.filter(m => {
      const mantenimientoTipo = m.unidad_tipo || 'trailer';
      const mantenimientoUnidadId = m.unidad_id || m.remolque_id || m.trailer_id;

      if (filtroTipoUnidad && mantenimientoTipo !== filtroTipoUnidad) {
        return false;
      }

      if (!filtroUnidad) {
        return true;
      }

      const [tipo, id] = filtroUnidad.split(':');
      const unidadId = parseInt(id, 10);
      return mantenimientoTipo === tipo && mantenimientoUnidadId === unidadId;
    });
  }, [mantenimientos, filtroTipoUnidad, filtroUnidad]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setGuardando(true);
      const dataToSend = {
        unidad_tipo: formData.unidad_tipo,
        unidad_id: parseInt(formData.unidad_id, 10),
        fecha: formData.fecha,
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        costo_mano_obra: parseFloat(formData.costo_mano_obra || 0),
        refacciones: formData.refacciones.map(ref => ({
          refaccion_id: parseInt(ref.refaccion_id),
          cantidad: parseInt(ref.cantidad),
          precio_unitario: parseFloat(ref.precio_unitario)
        }))
      };

      if (formData.kilometraje) dataToSend.kilometraje = parseFloat(formData.kilometraje);
      if (formData.taller) dataToSend.taller = formData.taller;

      await api.post('/mantenimiento', dataToSend);
      showToast('Mantenimiento registrado exitosamente', 'success');
      setShowModal(false);
      setFormData({
        unidad_tipo: 'trailer',
        unidad_id: '',
        fecha: new Date().toISOString().split('T')[0],
        tipo: 'preventivo',
        descripcion: '',
        kilometraje: '',
        costo_mano_obra: '',
        taller: '',
        refacciones: []
      });
      cargarDatos();
    } catch (error) {
      console.error('Error al registrar mantenimiento:', error);
      showToast(error.response?.data?.error || error.message, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      programado: 'bg-blue-100 text-blue-800',
      en_proceso: 'bg-yellow-100 text-yellow-800',
      completado: 'bg-green-100 text-green-800'
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  const getTipoBadge = (tipo) => {
    const badges = {
      preventivo: 'bg-green-100 text-green-800',
      correctivo: 'bg-orange-100 text-orange-800',
      emergencia: 'bg-red-100 text-red-800'
    };
    return badges[tipo] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const completarMantenimiento = async (id) => {
    const confirmar = await confirmAction({
      title: 'Completar mantenimiento',
      message: 'Se marcara este mantenimiento como completado y la unidad cambiara a disponible/activa.',
      confirmText: 'Si, completar',
      cancelText: 'Cancelar',
      tone: 'primary'
    });

    if (!confirmar) return;

    try {
      setCompletandoId(id);
      await api.put(`/mantenimiento/${id}`, { estado: 'completado' });
      showToast('Mantenimiento completado exitosamente', 'success');
      cargarDatos();
    } catch (error) {
      console.error('Error al completar mantenimiento:', error);
      showToast(error.response?.data?.error || 'Error al completar el mantenimiento', 'error');
    } finally {
      setCompletandoId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Mantenimiento</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + Nuevo Mantenimiento
        </button>
      </div>

      {/* Filtro por Trailer */}
      <div className="card">
        <div className="flex gap-4 items-end">
          <div>
            <label className="label">Filtrar por Tipo de Unidad</label>
            <select
              value={filtroTipoUnidad}
              onChange={(e) => {
                setFiltroTipoUnidad(e.target.value);
                setFiltroUnidad('');
              }}
              className="input w-64"
            >
              <option value="">Todos</option>
              <option value="trailer">Solo Carro/Trailer</option>
              <option value="remolque">Solo Remolque</option>
            </select>
          </div>
          <div>
            <label className="label">Filtrar por Carro/Remolque</label>
            <select
              value={filtroUnidad}
              onChange={(e) => setFiltroUnidad(e.target.value)}
              className="input w-64"
            >
              <option value="">Todas las Unidades</option>
              {(filtroTipoUnidad === '' || filtroTipoUnidad === 'trailer') && trailers.map((trailer) => (
                <option key={`trailer-${trailer.id}`} value={`trailer:${trailer.id}`}>
                  Trailer: {trailer.numero_economico} - {trailer.placas}
                </option>
              ))}
              {(filtroTipoUnidad === '' || filtroTipoUnidad === 'remolque') && remolques.map((remolque) => (
                <option key={`remolque-${remolque.id}`} value={`remolque:${remolque.id}`}>
                  Remolque: {remolque.numero_remolque}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-500">
            {mantenimientosFiltrados.length} registro{mantenimientosFiltrados.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Lista de mantenimientos */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Unidad</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Costo</th>
                <th>Estado</th>
                <th>Taller</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mantenimientosFiltrados.map((mant) => (
                <tr key={mant.id} className="hover:bg-gray-50">
                  <td>{new Date(mant.fecha).toLocaleDateString('es-MX')}</td>
                  <td className="font-medium">
                    {mant.unidad_tipo === 'remolque' ? 'Remolque' : 'Trailer'}: {mant.numero_economico}
                    {mant.placas ? ` - ${mant.placas}` : ''}
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoBadge(mant.tipo)}`}>
                      {mant.tipo.toUpperCase()}
                    </span>
                  </td>
                  <td className="max-w-xs truncate">{mant.descripcion}</td>
                  <td className="font-medium text-orange-600">
                    {formatCurrency(mant.costo_mano_obra)}
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadge(mant.estado)}`}>
                      {mant.estado.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="text-sm text-gray-600">{mant.taller || 'N/A'}</td>
                  <td>
                    {mant.estado !== 'completado' && (
                      <button
                        onClick={() => completarMantenimiento(mant.id)}
                        disabled={completandoId === mant.id}
                        className="text-green-600 hover:text-green-800 font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {completandoId === mant.id ? 'Completando...' : '✓ Completar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {mantenimientosFiltrados.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {filtroUnidad ? 'No hay mantenimientos para esta unidad' : 'No hay mantenimientos registrados'}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nuevo Mantenimiento</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Tipo de Unidad *</label>
                  <select
                    name="unidad_tipo"
                    value={formData.unidad_tipo}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="trailer">Trailer</option>
                    <option value="remolque">Remolque</option>
                  </select>
                </div>
                <div>
                  <label className="label">Unidad *</label>
                  <select
                    name="unidad_id"
                    value={formData.unidad_id}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="">Seleccionar unidad</option>
                    {formData.unidad_tipo === 'trailer' && trailers.map(trailer => (
                      <option key={`form-trailer-${trailer.id}`} value={trailer.id}>
                        {trailer.numero_economico} - {trailer.placas}
                      </option>
                    ))}
                    {formData.unidad_tipo === 'remolque' && remolques.map(remolque => (
                      <option key={`form-remolque-${remolque.id}`} value={remolque.id}>
                        {remolque.numero_remolque}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Fecha *</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Tipo *</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="preventivo">Preventivo</option>
                    <option value="correctivo">Correctivo</option>
                    <option value="emergencia">Emergencia</option>
                  </select>
                </div>
                <div>
                  <label className="label">Kilometraje</label>
                  <input
                    type="number"
                    name="kilometraje"
                    value={formData.kilometraje}
                    onChange={handleChange}
                    className="input"
                    placeholder="145000"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="label">Costo Mano de Obra</label>
                  <input
                    type="number"
                    name="costo_mano_obra"
                    value={formData.costo_mano_obra}
                    onChange={handleChange}
                    className="input"
                    placeholder="1500.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="label">Taller</label>
                  <input
                    type="text"
                    name="taller"
                    value={formData.taller}
                    onChange={handleChange}
                    className="input"
                    placeholder="Taller Mecánico"
                  />
                </div>
              </div>

              <div>
                <label className="label">Descripción *</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="input"
                  rows="3"
                  placeholder="Descripción detallada del mantenimiento"
                  required
                />
              </div>

              {/* Refacciones */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-700">Refacciones Utilizadas</h3>
                  <button
                    type="button"
                    onClick={agregarRefaccion}
                    className="btn btn-sm btn-secondary"
                  >
                    + Agregar Refacción
                  </button>
                </div>

                {formData.refacciones.map((ref, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 bg-gray-50 p-3 rounded">
                    <div className="md:col-span-2">
                      <select
                        value={ref.refaccion_id}
                        onChange={(e) => handleRefaccionChange(index, 'refaccion_id', e.target.value)}
                        className="input"
                        required
                      >
                        <option value="">Seleccionar refacción</option>
                        {refacciones.map(refaccion => (
                          <option key={refaccion.id} value={refaccion.id}>
                            {refaccion.nombre} (Stock: {refaccion.stock_actual})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={ref.cantidad}
                        onChange={(e) => handleRefaccionChange(index, 'cantidad', e.target.value)}
                        className="input"
                        placeholder="Cantidad"
                        min="1"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={ref.precio_unitario}
                        onChange={(e) => handleRefaccionChange(index, 'precio_unitario', e.target.value)}
                        className="input"
                        placeholder="Precio"
                        step="0.01"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => eliminarRefaccion(index)}
                        className="btn btn-danger"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={guardando}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="btn btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
                  {guardando ? 'Guardando...' : 'Guardar Mantenimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Mantenimiento;
