import React, { createContext, useContext, useEffect, useState } from 'react';
import { demoAuth, DemoUser } from '../lib/demoAuth';

interface AuthContextType {
  currentUser: DemoUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    await demoAuth.signInWithEmailAndPassword(email, password);
  };

  const register = async (email: string, password: string) => {
    await demoAuth.createUserWithEmailAndPassword(email, password);
  };

  const logout = async () => {
    await demoAuth.signOut();
  };

  useEffect(() => {
    const unsubscribe = demoAuth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};