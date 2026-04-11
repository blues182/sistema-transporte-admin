import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useFeedback } from '../components/FeedbackProvider';

function Trailers() {
  const [trailers, setTrailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoPolizaId, setSubiendoPolizaId] = useState(null);
  const [descargandoPolizaId, setDescargandoPolizaId] = useState(null);
  const [eliminandoPolizaId, setEliminandoPolizaId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const { showToast, confirmAction } = useFeedback();
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
      setGuardando(true);
      if (editando) {
        await api.put(`/trailers/${editando}`, formData);
        showToast('Trailer actualizado exitosamente', 'success');
      } else {
        await api.post('/trailers', formData);
        showToast('Trailer creado exitosamente', 'success');
      }
      setShowModal(false);
      setEditando(null);
      cargarTrailers();
      resetForm();
    } catch (error) {
      console.error('Error al guardar trailer:', error);
      showToast(error.response?.data?.error || 'Error al guardar el trailer', 'error');
    } finally {
      setGuardando(false);
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

  const subirPoliza = async (trailerId, archivo) => {
    if (!archivo) return;

    if (archivo.type !== 'application/pdf' && !archivo.name.toLowerCase().endsWith('.pdf')) {
      showToast('Solo se permiten archivos PDF', 'warning');
      return;
    }

    try {
      setSubiendoPolizaId(trailerId);
      const formDataArchivo = new FormData();
      formDataArchivo.append('poliza', archivo);

      await api.post(`/trailers/${trailerId}/poliza`, formDataArchivo, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showToast('Póliza subida exitosamente', 'success');
      await cargarTrailers();
    } catch (error) {
      console.error('Error al subir póliza:', error);
      showToast(error.response?.data?.error || 'Error al subir la póliza', 'error');
    } finally {
      setSubiendoPolizaId(null);
    }
  };

  const descargarPoliza = async (trailer) => {
    try {
      setDescargandoPolizaId(trailer.id);
      const response = await api.get(`/trailers/${trailer.id}/poliza`, {
        responseType: 'blob',
      });

      const contentDisposition = response.headers['content-disposition'];
      let nombreArchivo = trailer.poliza_nombre || `poliza-${trailer.numero_economico}.pdf`;
      if (contentDisposition) {
        const nombreMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
        if (nombreMatch?.[1]) {
          nombreArchivo = decodeURIComponent(nombreMatch[1]);
        }
      }

      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error al descargar póliza:', error);
      showToast(error.response?.data?.error || 'Error al descargar la póliza', 'error');
    } finally {
      setDescargandoPolizaId(null);
    }
  };

  const eliminarPoliza = async (trailer) => {
    const confirmar = await confirmAction({
      title: 'Eliminar póliza',
      message: `Se eliminara la póliza del trailer ${trailer.numero_economico}. Esta acción no se puede deshacer.`,
      confirmText: 'Si, eliminar',
      cancelText: 'Cancelar',
      tone: 'danger'
    });

    if (!confirmar) {
      return;
    }

    try {
      setEliminandoPolizaId(trailer.id);
      await api.delete(`/trailers/${trailer.id}/poliza`);
      showToast('Póliza eliminada exitosamente', 'success');
      await cargarTrailers();
    } catch (error) {
      console.error('Error al eliminar póliza:', error);
      showToast(error.response?.data?.error || 'Error al eliminar la póliza', 'error');
    } finally {
      setEliminandoPolizaId(null);
    }
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
              <div className="pt-2 border-t">
                <p className="text-gray-500 mb-2">Póliza (PDF):</p>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => {
                    const archivo = e.target.files?.[0];
                    if (archivo) {
                      subirPoliza(trailer.id, archivo);
                    }
                    e.target.value = '';
                  }}
                  className="input text-xs"
                  disabled={subiendoPolizaId === trailer.id}
                />
                {trailer.tiene_poliza ? (
                  <>
                    <button
                      type="button"
                      onClick={() => descargarPoliza(trailer)}
                      className="mt-2 w-full btn btn-secondary text-xs"
                      disabled={descargandoPolizaId === trailer.id}
                    >
                      {descargandoPolizaId === trailer.id ? 'Descargando...' : '⬇ Descargar Póliza PDF'}
                    </button>
                    <button
                      type="button"
                      onClick={() => eliminarPoliza(trailer)}
                      className="mt-2 w-full btn btn-secondary text-xs"
                      disabled={eliminandoPolizaId === trailer.id}
                    >
                      {eliminandoPolizaId === trailer.id ? 'Eliminando...' : '🗑 Eliminar Póliza'}
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 mt-2">Sin póliza cargada</p>
                )}
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
                    min="0"
                    max="99999999.99"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  disabled={guardando}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="btn btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
                  {guardando ? 'Guardando...' : (editando ? 'Actualizar Trailer' : 'Crear Trailer')}
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
