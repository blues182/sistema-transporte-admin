import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Conductores() {
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    fecha_nacimiento: '',
    licencia_federal: 'no',
    telefono: '',
    estado: 'activo'
  });

  useEffect(() => {
    cargarConductores();
  }, []);

  const cargarConductores = async () => {
    try {
      const response = await api.get('/conductores');
      setConductores(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar conductores:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/conductores', formData);
      alert('Conductor registrado exitosamente');
      setShowModal(false);
      cargarConductores();
      resetForm();
    } catch (error) {
      console.error('Error al registrar conductor:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellidos: '',
      fecha_nacimiento: '',
      licencia_federal: 'no',
      telefono: '',
      estado: 'activo'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return '-';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const getEstadoBadge = (estado) => {
    return estado === 'activo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Conductores</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + Nuevo Conductor
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-green-50 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-700">
            {conductores.filter(c => c.estado === 'activo').length}
          </div>
          <div className="text-sm text-gray-600">Activos</div>
        </div>
        <div className="card bg-blue-50 border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-blue-700">
            {conductores.filter(c => c.licencia_federal === 'si').length}
          </div>
          <div className="text-sm text-gray-600">Con Licencia Federal</div>
        </div>
        <div className="card bg-gray-50 border-l-4 border-gray-500">
          <div className="text-2xl font-bold text-gray-700">
            {conductores.length}
          </div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
      </div>

      {/* Lista de conductores */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Edad</th>
                <th>Licencia Federal</th>
                <th>Teléfono</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {conductores.map((conductor) => (
                <tr key={conductor.id} className="hover:bg-gray-50">
                  <td className="font-medium text-gray-900">
                    {conductor.nombre} {conductor.apellidos}
                  </td>
                  <td className="text-gray-600">
                    {calcularEdad(conductor.fecha_nacimiento)} años
                  </td>
                  <td>
                    {conductor.licencia_federal === 'si' ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ✓ SÍ
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        NO
                      </span>
                    )}
                  </td>
                  <td className="text-gray-600">{conductor.telefono || '-'}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadge(conductor.estado)}`}>
                      {conductor.estado.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {conductores.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay conductores registrados
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editando ? 'Editar Conductor' : 'Nuevo Conductor'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="input"
                  placeholder="Juan"
                  required
                />
              </div>
              <div>
                <label className="label">Apellidos *</label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  className="input"
                  placeholder="Pérez García"
                  required
                />
              </div>
              <div>
                <label className="label">Fecha de Nacimiento *</label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">¿Tiene Licencia Federal? *</label>
                <select
                  name="licencia_federal"
                  value={formData.licencia_federal}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="no">No</option>
                  <option value="si">Sí</option>
                </select>
              </div>
              <div>
                <label className="label">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="input"
                  placeholder="3331234567"
                />
              </div>
              <div>
                <label className="label">Estado</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editando ? 'Actualizar Conductor' : 'Guardar Conductor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Conductores;
