import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { path: '/', name: 'Dashboard', icon: '📊' },
    { path: '/viajes', name: 'Viajes', icon: '🚛' },
    { path: '/trailers', name: 'Trailers', icon: '🚚' },
    { path: '/conductores', name: 'Conductores', icon: '👤' },
    { path: '/clientes', name: 'Clientes', icon: '🏢' },
    { path: '/refacciones', name: 'Inventario', icon: '📦' },
    { path: '/mantenimiento', name: 'Mantenimiento', icon: '🔧' },
    { path: '/reportes', name: 'Reportes', icon: '📈' },
  ];

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
            <div className="flex items-center space-x-4">
              <span className="text-sm">Admin</span>
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
              {menuItems.map((item) => (
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
