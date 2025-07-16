import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../contexts/AuthContext';
import { useTema } from '../contexts/ThemeContext';
import {
  Home,
  Calendar,
  Users,
  Settings,
  LogOut,
  X,
  Moon,
  Sun,
  Activity
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAutenticacao();
  const { theme, toggleTheme } = useTema();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      localStorage.removeItem('admin-universal'); // Garante logout universal
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Agendamentos', href: '/agendamentos', icon: Calendar },
    { name: 'Pacientes', href: '/pacientes', icon: Users },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ease-in-out ${sidebarOpen ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-full pointer-events-none'}`}
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 ease-in-out"
          style={{ transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', willChange: 'transform' }}>
          {/* Logo */}
          <div className="flex h-16 items-center px-4 space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">DentalCare</span>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-2 transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} className="mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          {/* Theme & Logout */}
          <div className="px-4 py-4 mt-auto flex flex-col gap-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleTheme}
              className="flex items-center p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              <span className="ml-2">Tema</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-md"
            >
              <LogOut size={20} className="mr-2" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-gray-800 shadow-lg">
          {/* Logo */}
          <div className="flex h-16 items-center px-4 space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">DentalCare</span>
          </div>
          <nav className="flex-1 px-4 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-2 transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          {/* Theme & Logout */}
          <div className="px-4 py-4 mt-auto flex flex-col gap-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleTheme}
              className="flex items-center p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              <span className="ml-2">Tema</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-md"
            >
              <LogOut size={20} className="mr-2" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Botão de abrir sidebar no mobile */}
      <div className="fixed top-4 left-4 z-40 lg:hidden transition-transform duration-300">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-full bg-blue-600 text-white shadow-lg focus:outline-none"
            aria-label="Abrir menu"
            style={{ transition: 'transform 0.3s' }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Main content */}
      <div className={`lg:pl-64 transition-all duration-300 ${sidebarOpen ? 'pl-0' : ''}`}>
        <main className="p-4 lg:p-8">
          <Outlet context={{ showSidebarButton: !sidebarOpen }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;