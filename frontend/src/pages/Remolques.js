import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Remolques() {
  const [remolques, setRemolques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    numero_remolque: '',
    tipo: 'caja_seca',
    capacidad_toneladas: '',
    estado: 'disponible'
  });

  useEffect(() => {
    cargarRemolques();
  }, []);

  const cargarRemolques = async () => {
    try {
      const response = await api.get('/remolques');
      setRemolques(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar remolques:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        capacidad_toneladas: parseFloat(formData.capacidad_toneladas)
      };
      
      if (editando) {
        await api.put(`/remolques/${editando}`, dataToSend);
        alert('Remolque actualizado exitosamente');
      } else {
        await api.post('/remolques', dataToSend);
        alert('Remolque creado exitosamente');
      }
      
      setShowModal(false);
      setEditando(null);
      cargarRemolques();
      resetForm();
    } catch (error) {
      console.error('Error al guardar remolque:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      numero_remolque: '',
      tipo: 'caja_seca',
      capacidad_toneladas: '',
      estado: 'disponible'
    });
    setEditando(null);
  };

  const editarRemolque = (remolque) => {
    setFormData({
      numero_remolque: remolque.numero_remolque,
      tipo: remolque.tipo,
      capacidad_toneladas: remolque.capacidad_toneladas,
      estado: remolque.estado
    });
    setEditando(remolque.id);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      disponible: 'bg-green-100 text-green-800',
      en_uso: 'bg-blue-100 text-blue-800',
      mantenimiento: 'bg-yellow-100 text-yellow-800',
      fuera_servicio: 'bg-red-100 text-red-800'
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  const getTipoLabel = (tipo) => {
    const tipos = {
      caja_seca: 'Caja Seca',
      plataforma: 'Plataforma',
      tolva: 'Tolva',
      tanque: 'Tanque',
      refrigerado: 'Refrigerado'
    };
    return tipos[tipo] || tipo;
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Remolques</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + Nuevo Remolque
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-green-50 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-700">
            {remolques.filter(r => r.estado === 'disponible').length}
          </div>
          <div className="text-sm text-gray-600">Disponibles</div>
        </div>
        <div className="card bg-blue-50 border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-blue-700">
            {remolques.filter(r => r.estado === 'en_uso').length}
          </div>
          <div className="text-sm text-gray-600">En Uso</div>
        </div>
        <div className="card bg-yellow-50 border-l-4 border-yellow-500">
          <div className="text-2xl font-bold text-yellow-700">
            {remolques.filter(r => r.estado === 'mantenimiento').length}
          </div>
          <div className="text-sm text-gray-600">Mantenimiento</div>
        </div>
        <div className="card bg-gray-50 border-l-4 border-gray-500">
          <div className="text-2xl font-bold text-gray-700">
            {remolques.length}
          </div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
      </div>

      {/* Lista de remolques */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Tipo</th>
                <th>Capacidad (Ton)</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {remolques.map((remolque) => (
                <tr key={remolque.id} className="hover:bg-gray-50">
                  <td className="font-bold text-blue-600">{remolque.numero_remolque}</td>
                  <td>{getTipoLabel(remolque.tipo)}</td>
                  <td>{remolque.capacidad_toneladas} Ton</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadge(remolque.estado)}`}>
                      {remolque.estado.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => editarRemolque(remolque)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      ✎ Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {remolques.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay remolques registrados
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editando ? 'Editar Remolque' : 'Nuevo Remolque'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Número de Remolque *</label>
                <input
                  type="text"
                  name="numero_remolque"
                  value={formData.numero_remolque}
                  onChange={handleChange}
                  className="input"
                  placeholder="REM-001"
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
                  <option value="caja_seca">Caja Seca</option>
                  <option value="plataforma">Plataforma</option>
                  <option value="tolva">Tolva</option>
                  <option value="tanque">Tanque</option>
                  <option value="refrigerado">Refrigerado</option>
                </select>
              </div>
              <div>
                <label className="label">Capacidad (Toneladas) *</label>
                <input
                  type="number"
                  name="capacidad_toneladas"
                  value={formData.capacidad_toneladas}
                  onChange={handleChange}
                  className="input"
                  placeholder="30"
                  step="0.1"
                  required
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
                  <option value="disponible">Disponible</option>
                  <option value="en_uso">En Uso</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="fuera_servicio">Fuera de Servicio</option>
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
                  {editando ? 'Actualizar Remolque' : 'Crear Remolque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Remolques;
