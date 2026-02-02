import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Trailers() {
  const [trailers, setTrailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    numero_economico: '',
    placas: '',
    marca: '',
    modelo: '',
    anio: '',
    kilometraje: '',
    estado: 'activo'
  });

  useEffect(() => {
    cargarTrailers();
  }, []);

  const cargarTrailers = async () => {
    try {
      const response = await api.get('/trailers');
      setTrailers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar trailers:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/trailers/${editando}`, formData);
        alert('Trailer actualizado exitosamente');
      } else {
        await api.post('/trailers', formData);
        alert('Trailer creado exitosamente');
      }
      setShowModal(false);
      setEditando(null);
      cargarTrailers();
      resetForm();
    } catch (error) {
      console.error('Error al guardar trailer:', error);
      alert('Error al guardar el trailer');
    }
  };

  const resetForm = () => {
    setFormData({
      numero_economico: '',
      placas: '',
      marca: '',
      modelo: '',
      anio: '',
      kilometraje: '',
      estado: 'activo'
    });
    setEditando(null);
  };

  const editarTrailer = (trailer) => {
    setFormData({
      numero_economico: trailer.numero_economico,
      placas: trailer.placas,
      marca: trailer.marca,
      modelo: trailer.modelo,
      anio: trailer.anio,
      kilometraje: trailer.kilometraje,
      estado: trailer.estado
    });
    setEditando(trailer.id);
    setShowModal(true);
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      activo: 'bg-green-100 text-green-800',
      mantenimiento: 'bg-yellow-100 text-yellow-800',
      inactivo: 'bg-red-100 text-red-800',
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-8">Cargando trailers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Trailers</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + Nuevo Trailer
        </button>
      </div>

      {/* Lista de trailers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trailers.map((trailer) => (
          <div key={trailer.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{trailer.numero_economico}</h3>
                <p className="text-gray-500">{trailer.placas}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadge(trailer.estado)}`}>
                {trailer.estado.toUpperCase()}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Marca:</span>
                <span className="font-medium">{trailer.marca}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Modelo:</span>
                <span className="font-medium">{trailer.modelo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Año:</span>
                <span className="font-medium">{trailer.anio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kilometraje:</span>
                <span className="font-medium">{trailer.kilometraje?.toLocaleString()} km</span>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => editarTrailer(trailer)}
                className="w-full btn btn-secondary text-sm"
              >
                ✎ Editar Trailer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para nuevo trailer */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editando ? 'Editar Trailer' : 'Nuevo Trailer'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Número Económico *</label>
                  <input
                    type="text"
                    value={formData.numero_economico}
                    onChange={(e) => setFormData({...formData, numero_economico: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Placas *</label>
                  <input
                    type="text"
                    value={formData.placas}
                    onChange={(e) => setFormData({...formData, placas: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Marca</label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData({...formData, marca: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Modelo</label>
                  <input
                    type="text"
                    value={formData.modelo}
                    onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Año</label>
                  <input
                    type="number"
                    value={formData.anio}
                    onChange={(e) => setFormData({...formData, anio: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Kilometraje</label>
                  <input
                    type="number"
                    value={formData.kilometraje}
                    onChange={(e) => setFormData({...formData, kilometraje: e.target.value})}
                    className="input"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editando ? 'Actualizar Trailer' : 'Crear Trailer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Trailers;
