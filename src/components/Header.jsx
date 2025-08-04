import PropTypes from 'prop-types';

export default function Header({ children }) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 shadow-md bg-white/80 dark:bg-gray-900/80 backdrop-blur">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <span className="text-2xl font-extrabold text-blue-700 dark:text-yellow-300 tracking-tight">DentalCare</span>
        <div className="flex items-center space-x-6">
          {children}
        </div>
      </nav>
    </header>
  );
}

Header.propTypes = {
  children: PropTypes.node
};