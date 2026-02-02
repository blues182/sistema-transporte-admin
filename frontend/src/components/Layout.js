import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Layout({ children, usuario, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      onLogout();
      navigate('/login');
    }
  };

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: '📊', roles: ['admin', 'normal'] },
    { path: '/viajes', name: 'Viajes', icon: '🚛', roles: ['admin', 'normal'] },
    { path: '/trailers', name: 'Trailers', icon: '🚚', roles: ['admin', 'normal'] },
    { path: '/remolques', name: 'Remolques', icon: '📦', roles: ['admin', 'normal'] },
    { path: '/conductores', name: 'Conductores', icon: '👤', roles: ['admin', 'normal'] },
    { path: '/clientes', name: 'Clientes', icon: '🏢', roles: ['admin', 'normal'] },
    { path: '/refacciones', name: 'Inventario', icon: '🔩', roles: ['admin', 'normal'] },
    { path: '/mantenimiento', name: 'Mantenimiento', icon: '🔧', roles: ['admin', 'normal'] },
    { path: '/reportes', name: 'Reportes', icon: '📈', roles: ['admin', 'normal'] },
  ];

  // Filtrar menú según rol
  const menuItemsFiltrados = menuItems.filter(item => 
    !usuario || item.roles.includes(usuario.rol)
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4 p-2 rounded hover:bg-blue-700"
              >
                ☰
              </button>
              <h1 className="text-xl font-bold">Sistema de Transporte</h1>
            </div>
            <div className="flex items-center space-x-4 relative">
              <div className="text-right">
                <div className="text-sm font-medium">{usuario?.nombre || 'Usuario'}</div>
                <div className="text-xs opacity-75">
                  {usuario?.rol === 'admin' ? '👑 Administrador' : '👤 Usuario'}
                </div>
              </div>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 rounded hover:bg-blue-700"
              >
                ▼
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white text-gray-800 rounded-lg shadow-lg w-48 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <div className="font-medium">{usuario?.nombre}</div>
                    <div className="text-sm text-gray-500">@{usuario?.username}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    🚪 Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } bg-white shadow-lg transition-all duration-300 overflow-hidden`}
        >
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItemsFiltrados.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
