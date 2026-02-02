import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Mantenimiento() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [refacciones, setRefacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    trailer_id: '',
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
    try {
      const [mantRes, trailersRes, refacRes] = await Promise.all([
        api.get('/mantenimiento'),
        api.get('/trailers'),
        api.get('/refacciones')
      ]);
      setMantenimientos(mantRes.data);
      setTrailers(trailersRes.data);
      setRefacciones(refacRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        trailer_id: parseInt(formData.trailer_id),
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
      alert('Mantenimiento registrado exitosamente');
      setShowModal(false);
      setFormData({
        trailer_id: '',
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
      alert('Error: ' + (error.response?.data?.error || error.message));
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
    if (!window.confirm('¿Está seguro de marcar este mantenimiento como completado?')) return;
    try {
      await api.put(`/mantenimiento/${id}`, { estado: 'completado' });
      alert('Mantenimiento completado exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error al completar mantenimiento:', error);
      alert('Error al completar el mantenimiento');
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

      {/* Lista de mantenimientos */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Trailer</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Costo</th>
                <th>Estado</th>
                <th>Taller</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mantenimientos.map((mant) => (
                <tr key={mant.id} className="hover:bg-gray-50">
                  <td>{new Date(mant.fecha).toLocaleDateString('es-MX')}</td>
                  <td className="font-medium">{mant.numero_economico}</td>
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
                        className="text-green-600 hover:text-green-800 font-medium text-sm"
                      >
                        ✓ Completar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {mantenimientos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay mantenimientos registrados
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
                  <label className="label">Trailer *</label>
                  <select
                    name="trailer_id"
                    value={formData.trailer_id}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="">Seleccionar trailer</option>
                    {trailers.map(trailer => (
                      <option key={trailer.id} value={trailer.id}>
                        {trailer.numero_economico} - {trailer.placas}
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
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Mantenimiento
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
