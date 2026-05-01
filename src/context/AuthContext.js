import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await api.auth.getMe();
      setUser(userData);
      return userData;
    } catch (error) {
      setUser(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const userData = await api.auth.login({ email, password });
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, phone, whatsappPhone, address, studyCentre, referralCode) => {
    const userData = await api.auth.register({ name, email, password, phone, whatsappPhone, address, studyCentre, referralCode });
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      setUser(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
