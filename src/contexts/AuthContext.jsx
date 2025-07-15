import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

const ContextoAutenticacao = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const ProvedorAutenticacao = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para registrar usuário
  const signup = async (email, password) => {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Erro ao registrar');
    const data = await res.json();
    localStorage.setItem('token', data.token);
    setCurrentUser(data.user);
  };

  // Função para login
  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Email ou senha inválidos');
    const data = await res.json();
    localStorage.setItem('token', data.token);
    setCurrentUser(data.user);
  };

  // Função para logout
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  // Checa usuário autenticado ao iniciar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setCurrentUser(data?.user || null);
        setLoading(false);
      })
      .catch(() => {
        setCurrentUser(null);
        setLoading(false);
      });
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout
  };

  return (
    <ContextoAutenticacao.Provider value={value}>
      {!loading && children}
    </ContextoAutenticacao.Provider>
  );
};

ProvedorAutenticacao.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAutenticacao() {
  return useContext(ContextoAutenticacao);
}

