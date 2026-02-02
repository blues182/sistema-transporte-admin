import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function ConductorNomina() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conductor, setConductor] = useState(null);
  const [nomina, setNomina] = useState({ viajes: [], total: 0 });
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPagoModal, setShowPagoModal] = useState(false);
  
  const [semanaActual, setSemanaActual] = useState(5);
  const [anioActual, setAnioActual] = useState(2026);
  
  const [pagoData, setPagoData] = useState({
    metodo_pago: 'efectivo',
    notas: ''
  });

  useEffect(() => {
    obtenerSemanaActual();
  }, []);

  useEffect(() => {
    if (semanaActual && anioActual) {
      cargarDatos();
    }
  }, [id, semanaActual, anioActual]);

  const obtenerSemanaActual = async () => {
    try {
      const response = await api.get('/conductores/semana-actual');
      setSemanaActual(response.data.semana);
      setAnioActual(response.data.anio);
    } catch (error) {
      console.error('Error al obtener semana actual:', error);
    }
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      console.log('Cargando datos para semana:', semanaActual, 'año:', anioActual);
      const [conductorRes, nominaRes, pagosRes] = await Promise.all([
        api.get(`/conductores/${id}`),
        api.get(`/conductores/${id}/nomina-semanal?semana=${semanaActual}&anio=${anioActual}`),
        api.get(`/conductores/${id}/resumen-pagos`)
      ]);
      
      console.log('Respuesta nómina:', nominaRes.data);
      console.log('Viajes encontrados:', nominaRes.data.viajes);
      
      setConductor(conductorRes.data);
      setNomina(nominaRes.data);
      setPagos(pagosRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setLoading(false);
    }
  };

  const cambiarSemana = (direccion) => {
    let nuevaSemana = semanaActual + direccion;
    let nuevoAnio = anioActual;
    
    if (nuevaSemana < 1) {
      nuevaSemana = 52;
      nuevoAnio--;
    } else if (nuevaSemana > 52) {
      nuevaSemana = 1;
      nuevoAnio++;
    }
    
    setSemanaActual(nuevaSemana);
    setAnioActual(nuevoAnio);
  };

  const pagoYaRegistrado = pagos.some(
    p => p.semana === semanaActual && p.anio === anioActual
  );

  const registrarPago = async (e) => {
    e.preventDefault();
    
    if (nomina.total <= 0) {
      alert('No hay monto a pagar en esta semana');
      return;
    }

    try {
      await api.post(`/conductores/${id}/pagar-nomina`, {
        semana: semanaActual,
        anio: anioActual,
        monto: nomina.total,
        metodo_pago: pagoData.metodo_pago,
        notas: pagoData.notas
      });
      
      alert('Pago registrado exitosamente');
      setShowPagoModal(false);
      setPagoData({ metodo_pago: 'efectivo', notas: '' });
      cargarDatos();
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate('/conductores')}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Volver a Conductores
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            Nómina - {conductor?.nombre} {conductor?.apellidos}
          </h1>
        </div>
      </div>

      {/* Selector de semana */}
      <div className="card">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => cambiarSemana(-1)}
            className="btn btn-secondary"
          >
            ← Semana Anterior
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Semana {semanaActual} - {anioActual}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(anioActual, 0, 1 + (semanaActual - 1) * 7).toLocaleDateString('es-MX')} - 
              {' '}{new Date(anioActual, 0, 1 + (semanaActual - 1) * 7 + 6).toLocaleDateString('es-MX')}
            </p>
          </div>
          
          <button 
            onClick={() => cambiarSemana(1)}
            className="btn btn-secondary"
          >
            Semana Siguiente →
          </button>
        </div>
      </div>

      {/* Resumen de la semana */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-blue-50 border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-blue-700">
            {nomina.viajes.length}
          </div>
          <div className="text-sm text-gray-600">Viajes Completados</div>
        </div>
        
        <div className="card bg-green-50 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-700">
            ${nomina.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-gray-600">Total a Pagar</div>
        </div>
        
        <div className="card bg-purple-50 border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-purple-700">
            {pagoYaRegistrado ? '✓ PAGADO' : 'PENDIENTE'}
          </div>
          <div className="text-sm text-gray-600">Estado del Pago</div>
        </div>
      </div>

      {/* Botón de pago */}
      {nomina.viajes.length > 0 && !pagoYaRegistrado && (
        <div className="card bg-yellow-50 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800">Pago Pendiente</h3>
              <p className="text-sm text-gray-600">
                Esta semana tiene viajes completados sin pago registrado
              </p>
            </div>
            <button 
              onClick={() => setShowPagoModal(true)}
              className="btn bg-green-600 hover:bg-green-700 text-white"
            >
              💰 Registrar Pago
            </button>
          </div>
        </div>
      )}

      {/* Lista de viajes de la semana */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Viajes de la Semana {semanaActual}
        </h3>
        
        {nomina.viajes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay viajes completados en esta semana
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Ruta</th>
                  <th>Cliente</th>
                  <th className="text-right">Sueldo</th>
                </tr>
              </thead>
              <tbody>
                {nomina.viajes.map((viaje) => (
                  <tr key={viaje.id} className="hover:bg-gray-50">
                    <td>{new Date(viaje.fecha_salida).toLocaleDateString('es-MX')}</td>
                    <td className="font-medium">{viaje.origen} → {viaje.destino}</td>
                    <td>{viaje.cliente}</td>
                    <td className="text-right font-bold text-green-600">
                      ${parseFloat(viaje.sueldo || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td colSpan="3" className="text-right">TOTAL:</td>
                  <td className="text-right text-green-600 text-lg">
                    ${nomina.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historial de pagos */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Historial de Pagos (Últimas 20 Semanas)
        </h3>
        
        {pagos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay pagos registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Semana</th>
                  <th>Fecha Pago</th>
                  <th>Monto</th>
                  <th>Método</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="font-medium">
                      Semana {pago.semana} - {pago.anio}
                    </td>
                    <td>{new Date(pago.fecha).toLocaleDateString('es-MX')}</td>
                    <td className="font-bold text-green-600">
                      ${parseFloat(pago.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {pago.metodo_pago.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-gray-600 text-sm">{pago.notas || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de pago */}
      {showPagoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Registrar Pago - Semana {semanaActual}
            </h2>
            
            <form onSubmit={registrarPago} className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-sm text-gray-600">Monto a Pagar:</div>
                <div className="text-3xl font-bold text-green-700">
                  ${nomina.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </div>
              
              <div>
                <label className="label">Método de Pago *</label>
                <select
                  value={pagoData.metodo_pago}
                  onChange={(e) => setPagoData({ ...pagoData, metodo_pago: e.target.value })}
                  className="input"
                  required
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              
              <div>
                <label className="label">Notas</label>
                <textarea
                  value={pagoData.notas}
                  onChange={(e) => setPagoData({ ...pagoData, notas: e.target.value })}
                  className="input"
                  rows="3"
                  placeholder="Observaciones del pago..."
                />
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPagoModal(false);
                    setPagoData({ metodo_pago: 'efectivo', notas: '' });
                  }}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn bg-green-600 hover:bg-green-700 text-white">
                  Confirmar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConductorNomina;
