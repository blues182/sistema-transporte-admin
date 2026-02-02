import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function NuevoViaje() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    folio: '',
    fecha_salida: '',
    origen: '',
    destino: '',
    trailer_id: '',
    conductor_id: '',
    cliente_id: '',
    carga_descripcion: '',
    peso_carga: '',
    monto_cobrado: '',
    km_inicial: ''
  });

  const [trailers, setTrailers] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
    generarFolio();
  }, []);

  const cargarDatos = async () => {
    try {
      const [trailersRes, conductoresRes, clientesRes] = await Promise.all([
        api.get('/trailers'),
        api.get('/conductores'),
        api.get('/clientes')
      ]);
      setTrailers(trailersRes.data.filter(t => t.estado === 'activo'));
      setConductores(conductoresRes.data.filter(c => c.estado === 'activo'));
      setClientes(clientesRes.data.filter(c => c.estado === 'activo'));
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const generarFolio = () => {
    const fecha = new Date();
    const folio = `V-${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}${String(fecha.getDate()).padStart(2, '0')}-${String(fecha.getHours()).padStart(2, '0')}${String(fecha.getMinutes()).padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, folio }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/viajes', formData);
      alert('Viaje creado exitosamente');
      navigate('/viajes');
    } catch (error) {
      console.error('Error al crear viaje:', error);
      alert('Error al crear el viaje');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Nuevo Viaje</h1>
        <button onClick={() => navigate('/viajes')} className="btn btn-secondary">
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información General */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Información General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Folio</label>
              <input
                type="text"
                name="folio"
                value={formData.folio}
                onChange={handleChange}
                className="input bg-gray-100"
                readOnly
              />
            </div>
            <div>
              <label className="label">Fecha de Salida *</label>
              <input
                type="datetime-local"
                name="fecha_salida"
                value={formData.fecha_salida}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>
        </div>

        {/* Ruta */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ruta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Origen *</label>
              <input
                type="text"
                name="origen"
                value={formData.origen}
                onChange={handleChange}
                className="input"
                placeholder="Ciudad de México"
                required
              />
            </div>
            <div>
              <label className="label">Destino *</label>
              <input
                type="text"
                name="destino"
                value={formData.destino}
                onChange={handleChange}
                className="input"
                placeholder="Monterrey, NL"
                required
              />
            </div>
          </div>
        </div>

        {/* Asignaciones */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Asignaciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Cliente *</label>
              <select
                name="cliente_id"
                value={formData.cliente_id}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                ))}
              </select>
            </div>
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
              <label className="label">Conductor *</label>
              <select
                name="conductor_id"
                value={formData.conductor_id}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Seleccionar conductor</option>
                {conductores.map(conductor => (
                  <option key={conductor.id} value={conductor.id}>
                    {conductor.nombre} {conductor.apellidos}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Carga */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Información de Carga</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Descripción de la Carga</label>
              <input
                type="text"
                name="carga_descripcion"
                value={formData.carga_descripcion}
                onChange={handleChange}
                className="input"
                placeholder="Ej: Material de construcción"
              />
            </div>
            <div>
              <label className="label">Peso (kg)</label>
              <input
                type="number"
                name="peso_carga"
                value={formData.peso_carga}
                onChange={handleChange}
                className="input"
                placeholder="22000"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Información Financiera */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Información Financiera y Kilometraje</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Monto a Cobrar *</label>
              <input
                type="number"
                name="monto_cobrado"
                value={formData.monto_cobrado}
                onChange={handleChange}
                className="input"
                placeholder="35000.00"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="label">Kilometraje Inicial</label>
              <input
                type="number"
                name="km_inicial"
                value={formData.km_inicial}
                onChange={handleChange}
                className="input"
                placeholder="145000"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/viajes')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Crear Viaje'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NuevoViaje;
