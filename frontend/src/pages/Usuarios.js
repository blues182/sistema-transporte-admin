import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast, Toast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

const FORM_VACIO = { username: '', nombre: '', password: '', rol: 'normal', estado: 'activo' };

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null); // null = nuevo, objeto = editar
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, nombre: '' });
  const { toasts, removeToast, toast } = useToast();

  useEffect(() => { cargarUsuarios(); }, []);

  const cargarUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const abrirNuevo = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setShowModal(true);
  };

  const abrirEditar = (u) => {
    setEditando(u);
    setForm({ username: u.username, nombre: u.nombre, password: '', rol: u.rol, estado: u.estado });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (editando) {
        const data = { nombre: form.nombre, rol: form.rol, estado: form.estado };
        if (form.password) data.password = form.password;
        await api.put(`/usuarios/${editando.id}`, data);
        toast.success('Usuario actualizado correctamente');
      } else {
        await api.post('/usuarios', form);
        toast.success('Usuario creado correctamente');
      }
      setShowModal(false);
      cargarUsuarios();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar usuario');
    } finally {
      setGuardando(false);
    }
  };

  const pedirEliminar = (u) => setConfirm({ open: true, id: u.id, nombre: u.nombre });

  const confirmarEliminar = async () => {
    const { id } = confirm;
    setConfirm({ open: false, id: null, nombre: '' });
    try {
      await api.delete(`/usuarios/${id}`);
      toast.success('Usuario eliminado');
      cargarUsuarios();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

  if (loading) return <div className="text-center py-8">Cargando usuarios...</div>;

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} removeToast={removeToast} />
      <ConfirmModal
        isOpen={confirm.open}
        title="Eliminar usuario"
        message={`¿Estás seguro de eliminar al usuario "${confirm.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        onConfirm={confirmarEliminar}
        onCancel={() => setConfirm({ open: false, id: null, nombre: '' })}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">Solo visible para administradores</p>
        </div>
        <button onClick={abrirNuevo} className="btn btn-primary">
          + Nuevo Usuario
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="font-mono font-medium">@{u.username}</td>
                  <td>{u.nombre}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.rol === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
                      {u.rol === 'admin' ? '👑 Admin' : '👤 Normal'}
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.estado}
                    </span>
                  </td>
                  <td className="text-gray-500 text-sm">{formatDate(u.created_at)}</td>
                  <td>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => abrirEditar(u)} className="text-primary hover:text-blue-700 font-medium">
                        Editar
                      </button>
                      <button onClick={() => pedirEliminar(u)} className="text-red-600 hover:text-red-800 font-medium">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {usuarios.length === 0 && (
            <div className="text-center py-8 text-gray-500">No hay usuarios registrados</div>
          )}
        </div>
      </div>

      {/* Modal Crear / Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editando ? `Editar usuario: ${editando.username}` : 'Nuevo Usuario'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editando && (
                <div>
                  <label className="label">Usuario *</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="input"
                    placeholder="ej: jperez"
                    required
                    autoComplete="off"
                  />
                </div>
              )}
              <div>
                <label className="label">Nombre completo *</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="input"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
              <div>
                <label className="label">{editando ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="input"
                  placeholder="Mín. 6 caracteres"
                  required={!editando}
                  autoComplete="new-password"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Rol *</label>
                  <select name="rol" value={form.rol} onChange={handleChange} className="input">
                    <option value="normal">Normal</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                {editando && (
                  <div>
                    <label className="label">Estado</label>
                    <select name="estado" value={form.estado} onChange={handleChange} className="input">
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" disabled={guardando}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? 'Guardando...' : editando ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuarios;
