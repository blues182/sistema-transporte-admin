import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    requiere_factura: 'no',
    rfc: '',
    direccion: '',
    email: '',
    estado: 'activo'
  });

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const response = await api.get('/clientes');
      setClientes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      // Si requiere factura y no tiene RFC, alertar
      if (formData.requiere_factura === 'si' && !formData.rfc) {
        if (!window.confirm('El cliente requiere factura pero no tiene RFC. ¿Desea continuar?')) {
          return;
        }
      }
      await api.post('/clientes', dataToSend);
      alert('Cliente registrado exitosamente');
      setShowModal(false);
      cargarClientes();
      resetForm();
    } catch (error) {
      console.error('Error al registrar cliente:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      telefono: '',
      requiere_factura: 'no',
      rfc: '',
      direccion: '',
      email: '',
      estado: 'activo'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + Nuevo Cliente
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-green-50 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-700">
            {clientes.filter(c => c.estado === 'activo').length}
          </div>
          <div className="text-sm text-gray-600">Activos</div>
        </div>
        <div className="card bg-blue-50 border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-blue-700">
            {clientes.filter(c => c.requiere_factura === 'si').length}
          </div>
          <div className="text-sm text-gray-600">Requieren Factura</div>
        </div>
        <div className="card bg-gray-50 border-l-4 border-gray-500">
          <div className="text-2xl font-bold text-gray-700">
            {clientes.length}
          </div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre / Empresa</th>
                <th>Teléfono</th>
                <th>Requiere Factura</th>
                <th>RFC</th>
                <th>Email</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="font-medium text-gray-900">
                    {cliente.nombre}
                  </td>
                  <td className="text-gray-600">{cliente.telefono || '-'}</td>
                  <td>
                    {cliente.requiere_factura === 'si' ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ✓ SÍ
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        NO
                      </span>
                    )}
                  </td>
                  <td className="text-gray-600 font-mono text-sm">
                    {cliente.rfc || '-'}
                  </td>
                  <td className="text-gray-600 text-sm">{cliente.email || '-'}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadge(cliente.estado)}`}>
                      {cliente.estado.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clientes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay clientes registrados
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nuevo Cliente</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">Nombre / Empresa *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="input"
                    placeholder="Empresa Transportes SA de CV"
                    required
                  />
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
                  <label className="label">¿Requiere Factura? *</label>
                  <select
                    name="requiere_factura"
                    value={formData.requiere_factura}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    RFC {formData.requiere_factura === 'si' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    name="rfc"
                    value={formData.rfc}
                    onChange={handleChange}
                    className="input"
                    placeholder="XAXX010101000"
                    maxLength="13"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input"
                    placeholder="cliente@empresa.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="input"
                    placeholder="Calle, número, colonia, ciudad"
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
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clientes;
