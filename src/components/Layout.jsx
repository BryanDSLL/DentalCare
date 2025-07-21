import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../contexts/AuthContext';
import { useTema } from '../contexts/ThemeContext';
import {
  Home,
  Calendar,
  Users,
  Settings,
  LogOut,
  Moon,
  Sun,
  Activity
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHover, setSidebarHover] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          <div className="flex h-16 items-center px-4" style={{ minWidth: 0 }}>
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full flex-shrink-0 transition-none">
              <Activity className="w-6 h-6 text-white" style={{ minWidth: 24, minHeight: 24, transition: 'none' }} />
            </div>
            {sidebarHover && (
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white transition-opacity duration-300 animate-typing overflow-hidden whitespace-nowrap ml-3">
                {"DentalCare".split("").map((char, i) => (
                  <span key={i} style={{
                    animation: `typingLetter 0.03s linear forwards`,
                    animationDelay: `${i * 0.04}s`,
                    opacity: 0,
                    display: 'inline-block',
                  }}>
                    {char}
                  </span>
                ))}
              </span>
            )}
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
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex"
        style={{
          width: sidebarHover ? 240 : 72,
          minWidth: 72, // minWidth sempre 72 para evitar "aperto" no início da animação
          transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div
          className="flex min-h-0 flex-1 flex-col bg-white dark:bg-gray-800 shadow-lg"
          onMouseEnter={() => setSidebarHover(true)}
          onMouseLeave={() => setSidebarHover(false)}
          style={{
            width: sidebarHover ? 240 : 72,
            minWidth: 72, // minWidth sempre 72 para evitar "aperto" no início da animação
            transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* Logo */}
          <div className="flex h-16 items-center px-4" style={{ minWidth: 0 }}>
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full flex-shrink-0 transition-none">
              <Activity className="w-6 h-6 text-white" style={{ minWidth: 24, minHeight: 24, transition: 'none' }} />
            </div>
            {sidebarHover && (
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white transition-opacity duration-300 animate-typing overflow-hidden whitespace-nowrap ml-3">
                {"DentalCare".split("").map((char, i) => (
                  <span key={i} style={{
                    animation: `typingLetter 0.03s linear forwards`,
                    animationDelay: `${i * 0.04}s`,
                    opacity: 0,
                    display: 'inline-block',
                  }}>
                    {char}
                  </span>
                ))}
              </span>
            )}
          </div>
          <nav className="flex-1 px-2 py-4 flex flex-col justify-start gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center h-12 px-2 py-0 text-lg font-semibold rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                  style={{ justifyContent: sidebarHover ? 'flex-start' : 'center', alignItems: 'center', transition: `justify-content ${sidebarHover ? '0.7s' : '0.5s'} cubic-bezier(0.4,0,0.2,1)` }}
                >
                  <span className="flex items-center h-full">
                    <Icon size={24} style={{ animation: 'none', opacity: 1 }} />
                  </span>
                  {sidebarHover && (
                    <span className="ml-3 transition-opacity duration-300 animate-typing overflow-hidden whitespace-nowrap">
                      {item.name.split("").map((char, i) => (
                        <span key={i} style={{
                          animation: `typingLetter 0.03s linear forwards`,
                          animationDelay: `${i * 0.04}s`,
                          opacity: 0,
                          display: 'inline-block',
                        }}>
                          {char}
                        </span>
                      ))}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          {/* Theme & Logout */}
          <div className={`px-2 py-4 mt-auto flex flex-col gap-2 border-t border-gray-200 dark:border-gray-700 ${sidebarHover ? '' : 'items-center'}`}
            style={{ transition: `padding ${sidebarHover ? '0.7s' : '0.5s'} cubic-bezier(0.4,0,0.2,1)` }}>
            <button
              onClick={toggleTheme}
              className={`flex items-center p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md ${sidebarHover ? '' : 'justify-center'}`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              {sidebarHover && <span className="ml-2">Tema</span>}
            </button>
            <button
              onClick={handleLogout}
              className={`flex items-center p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-md ${sidebarHover ? '' : 'justify-center'}`}
            >
              <LogOut size={20} className={sidebarHover ? 'mr-2' : ''} />
              {sidebarHover && <span>Sair</span>}
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
      <div className={`transition-all ${sidebarHover ? 'duration-700' : 'duration-500'}`}
        style={{ minHeight: '100vh' }}>
        <main className="p-4 lg:p-8" style={{ marginLeft: !isMobile ? (sidebarHover ? 240 : 64) : 0, transition: `margin-left ${sidebarHover ? '0.7s' : '0.5s'} cubic-bezier(0.4,0,0.2,1)` }}>
          <Outlet context={{ showSidebarButton: !sidebarOpen }} />
        </main>
      </div>
      <style>
        {`
        @keyframes typingLetter {
          to { opacity: 1; }
        }
        `}
      </style>
    </div>
  );
};

export default Layout;