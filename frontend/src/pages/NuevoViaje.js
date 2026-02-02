import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function NuevoViaje() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    folio: '',
    numero_orden: '',
    fecha_salida: '',
    origen: '',
    destino: '',
    trailer_id: '',
    numero_remolque: '',
    conductor_id: '',
    cliente_id: '',
    carga_descripcion: '',
    tipo_carga: 'general',
    peso_carga: '',
    monto_cobrado: '',
    km_inicial: '',
    // Gastos opcionales
    sueldo_operador: '',
    litros_diesel: '',
    precio_diesel: '',
    numero_caseta: '',
    nombre_caseta: '',
    monto_caseta: ''
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
      // Limpiar campos vacíos y convertir a números donde corresponda
      const dataToSend = {
        folio: formData.folio,
        fecha_salida: formData.fecha_salida,
        origen: formData.origen,
        destino: formData.destino,
        trailer_id: parseInt(formData.trailer_id),
        conductor_id: parseInt(formData.conductor_id),
        cliente_id: parseInt(formData.cliente_id),
        monto_cobrado: parseFloat(formData.monto_cobrado)
      };

      // Agregar campos opcionales solo si tienen valor
      if (formData.numero_orden) dataToSend.numero_orden = formData.numero_orden;
      if (formData.numero_remolque) dataToSend.numero_remolque = formData.numero_remolque;
      if (formData.carga_descripcion) dataToSend.carga_descripcion = formData.carga_descripcion;
      if (formData.tipo_carga) dataToSend.tipo_carga = formData.tipo_carga;
      if (formData.peso_carga) dataToSend.peso_carga = parseFloat(formData.peso_carga);
      if (formData.km_inicial) dataToSend.km_inicial = parseFloat(formData.km_inicial);

      // Agregar gastos opcionales si tienen valor
      const gastos = [];
      
      // Sueldo del operador
      if (formData.sueldo_operador) {
        gastos.push({
          concepto: 'Sueldo Operador',
          monto: parseFloat(formData.sueldo_operador),
          tipo_gasto: 'operacion'
        });
      }
      
      // Diesel
      if (formData.litros_diesel && formData.precio_diesel) {
        gastos.push({
          concepto: 'Diesel',
          monto: parseFloat(formData.litros_diesel) * parseFloat(formData.precio_diesel),
          tipo_gasto: 'combustible',
          litros_diesel: parseFloat(formData.litros_diesel),
          precio_litro: parseFloat(formData.precio_diesel)
        });
      }
      
      // Casetas
      if (formData.monto_caseta) {
        gastos.push({
          concepto: 'Casetas',
          monto: parseFloat(formData.monto_caseta),
          tipo_gasto: 'peaje',
          numero_caseta: formData.numero_caseta || null,
          nombre_caseta: formData.nombre_caseta || null
        });
      }
      
      if (gastos.length > 0) {
        dataToSend.gastos = gastos;
      }

      await api.post('/viajes', dataToSend);
      alert('Viaje creado exitosamente');
      navigate('/viajes');
    } catch (error) {
      console.error('Error al crear viaje:', error);
      alert('Error al crear el viaje: ' + (error.response?.data?.error || error.message));
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <label className="label">Número de Orden (Cemento)</label>
              <input
                type="text"
                name="numero_orden"
                value={formData.numero_orden}
                onChange={handleChange}
                className="input"
                placeholder="Ej: ORD-2024-001"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="label">Trailer (Tractocamión) *</label>
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
              <label className="label">Remolque/Caja</label>
              <input
                type="text"
                name="numero_remolque"
                value={formData.numero_remolque}
                onChange={handleChange}
                className="input"
                placeholder="Ej: REM-001, CAJA-45"
              />
            </div>
          </div>
        </div>

        {/* Carga */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Información de Carga</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Tipo de Carga</label>
              <select
                name="tipo_carga"
                value={formData.tipo_carga}
                onChange={handleChange}
                className="input"
              >
                <option value="general">General</option>
                <option value="cemento">Cemento</option>
                <option value="otro">Otro</option>
              </select>
            </div>
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

        {/* Gastos del Viaje (Opcional) */}
        <div className="card bg-blue-50">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Gastos del Viaje (Opcional)</h2>
          <p className="text-sm text-gray-600 mb-4">Puedes agregar los gastos ahora o después desde el detalle del viaje</p>
          
          {/* Sueldo del Operador */}
          <div className="mb-4 p-4 bg-white rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">💵 Sueldo del Operador</h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label className="label">Monto</label>
                <input
                  type="number"
                  name="sueldo_operador"
                  value={formData.sueldo_operador}
                  onChange={handleChange}
                  className="input"
                  placeholder="5000.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Diesel */}
          <div className="mb-4 p-4 bg-white rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">⛽ Diesel</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Litros</label>
                <input
                  type="number"
                  name="litros_diesel"
                  value={formData.litros_diesel}
                  onChange={handleChange}
                  className="input"
                  placeholder="300"
                  step="0.01"
                />
              </div>
              <div>
                <label className="label">Precio por Litro</label>
                <input
                  type="number"
                  name="precio_diesel"
                  value={formData.precio_diesel}
                  onChange={handleChange}
                  className="input"
                  placeholder="24.50"
                  step="0.01"
                />
              </div>
              <div>
                <label className="label">Total Calculado</label>
                <input
                  type="text"
                  className="input bg-gray-100"
                  value={
                    formData.litros_diesel && formData.precio_diesel
                      ? `$${(parseFloat(formData.litros_diesel) * parseFloat(formData.precio_diesel)).toFixed(2)}`
                      : '$0.00'
                  }
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Casetas */}
          <div className="p-4 bg-white rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">🛣️ Casetas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Monto Total</label>
                <input
                  type="number"
                  name="monto_caseta"
                  value={formData.monto_caseta}
                  onChange={handleChange}
                  className="input"
                  placeholder="850.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className="label">Número de Casetas</label>
                <input
                  type="text"
                  name="numero_caseta"
                  value={formData.numero_caseta}
                  onChange={handleChange}
                  className="input"
                  placeholder="5"
                />
              </div>
              <div>
                <label className="label">Nombre/Ubicación</label>
                <input
                  type="text"
                  name="nombre_caseta"
                  value={formData.nombre_caseta}
                  onChange={handleChange}
                  className="input"
                  placeholder="Caseta Santa Fe"
                />
              </div>
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
