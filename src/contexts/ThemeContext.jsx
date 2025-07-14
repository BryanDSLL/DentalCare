import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

const ContextoTema = createContext();

export const ProvedorTema = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ContextoTema.Provider value={{ theme, toggleTheme }}>
      {children}
    </ContextoTema.Provider>
  );
};

ProvedorTema.propTypes = {
  children: PropTypes.node
};

export const useTema = () => {
  const contexto = useContext(ContextoTema);
  if (!contexto) {
    throw new Error('useTema deve ser usado dentro de um ProvedorTema');
  }
  return contexto;
};