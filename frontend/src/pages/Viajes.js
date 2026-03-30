import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useToast, Toast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

const POR_PAGINA = 15;

function Viajes() {
  const [viajes, setViajes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({ open: false, id: null, folio: '' });
  const { toasts, removeToast, toast } = useToast();

  useEffect(() => {
    cargarViajes();
  }, [filtroEstado]);

  // Resetear página al cambiar búsqueda
  useEffect(() => { setPagina(1); }, [busqueda, filtroEstado]);

  const cargarViajes = async () => {
    try {
      const params = filtroEstado ? { estado: filtroEstado } : {};
      const response = await api.get('/viajes', { params });
      setViajes(response.data);
    } catch (error) {
      toast.error('Error al cargar viajes');
    } finally {
      setLoading(false);
    }
  };

  // Filtrado por búsqueda del lado cliente
  const viajesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return viajes;
    const q = busqueda.toLowerCase();
    return viajes.filter(v =>
      v.folio?.toLowerCase().includes(q) ||
      v.numero_orden?.toLowerCase().includes(q) ||
      v.cliente_nombre?.toLowerCase().includes(q) ||
      v.conductor_nombre?.toLowerCase().includes(q) ||
      v.origen?.toLowerCase().includes(q) ||
      v.destino?.toLowerCase().includes(q) ||
      v.numero_economico?.toLowerCase().includes(q)
    );
  }, [viajes, busqueda]);

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(viajesFiltrados.length / POR_PAGINA));
  const viajesPagina = viajesFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const pedirEliminar = (id, folio) => setConfirm({ open: true, id, folio });

  const confirmarEliminar = async () => {
    const { id } = confirm;
    setConfirm({ open: false, id: null, folio: '' });
    try {
      await api.delete(`/viajes/${id}`);
      setViajes(prev => prev.filter(v => v.id !== id));
      toast.success('Viaje eliminado correctamente');
    } catch (error) {
      toast.error('Error al eliminar el viaje: ' + (error.response?.data?.error || error.message));
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      programado: 'bg-blue-100 text-blue-800',
      en_ruta: 'bg-yellow-100 text-yellow-800',
      completado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) return <div className="text-center py-8">Cargando viajes...</div>;

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} removeToast={removeToast} />
      <ConfirmModal
        isOpen={confirm.open}
        title="Eliminar viaje"
        message={`¿Estás seguro de eliminar el viaje ${confirm.folio}? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        onConfirm={confirmarEliminar}
        onCancel={() => setConfirm({ open: false, id: null, folio: '' })}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Viajes</h1>
        <Link to="/viajes/nuevo" className="btn btn-primary">
          + Nuevo Viaje
        </Link>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="label">Filtrar por Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="input w-48"
            >
              <option value="">Todos</option>
              <option value="programado">Programado</option>
              <option value="en_ruta">En Ruta</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="label">Buscar</label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Folio, cliente, conductor, ruta..."
              className="input"
            />
          </div>
          <div className="text-sm text-gray-500 self-end pb-1">
            {viajesFiltrados.length} resultado{viajesFiltrados.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Lista de viajes */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Fecha Salida</th>
                <th>Ruta</th>
                <th>Cliente</th>
                <th>Trailer</th>
                <th>Conductor</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {viajesPagina.map((viaje) => (
                <tr key={viaje.id} className="hover:bg-gray-50">
                  <td className="font-medium">{viaje.folio}</td>
                  <td>{formatDate(viaje.fecha_salida)}</td>
                  <td>
                    <div className="text-sm">
                      <div className="font-medium">{viaje.origen}</div>
                      <div className="text-gray-500">→ {viaje.destino}</div>
                    </div>
                  </td>
                  <td>{viaje.cliente_nombre}</td>
                  <td>{viaje.numero_economico}</td>
                  <td>{viaje.conductor_nombre}</td>
                  <td className="font-medium text-green-600">
                    {formatCurrency(viaje.monto_cobrado)}
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadge(viaje.estado)}`}>
                      {viaje.estado.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-3">
                      <Link to={`/viajes/${viaje.id}`} className="text-primary hover:text-blue-700 font-medium">
                        Ver detalles
                      </Link>
                      <button
                        onClick={() => pedirEliminar(viaje.id, viaje.folio)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {viajesPagina.length === 0 && (
            <div className="text-center py-8 text-gray-500">No se encontraron viajes</div>
          )}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              Página {pagina} de {totalPaginas} — {viajesFiltrados.length} registros
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPagina(1)}
                disabled={pagina === 1}
                className="px-2 py-1 text-sm rounded border disabled:opacity-40 hover:bg-gray-100"
              >«</button>
              <button
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="px-3 py-1 text-sm rounded border disabled:opacity-40 hover:bg-gray-100"
              >‹</button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPaginas || Math.abs(p - pagina) <= 2)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`e${i}`} className="px-2 py-1 text-sm text-gray-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPagina(p)}
                      className={`px-3 py-1 text-sm rounded border ${p === pagina ? 'bg-primary text-white border-primary' : 'hover:bg-gray-100'}`}
                    >{p}</button>
                  )
                )}
              <button
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="px-3 py-1 text-sm rounded border disabled:opacity-40 hover:bg-gray-100"
              >›</button>
              <button
                onClick={() => setPagina(totalPaginas)}
                disabled={pagina === totalPaginas}
                className="px-2 py-1 text-sm rounded border disabled:opacity-40 hover:bg-gray-100"
              >»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Viajes;
