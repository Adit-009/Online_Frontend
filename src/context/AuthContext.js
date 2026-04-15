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

  // ✅ FIXED: check localStorage first
  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem('user');

      // 🔥 If dummy/admin user exists → use it
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setLoading(false);
        return;
      }

      // ✅ Otherwise call backend
      const userData = await api.auth.getMe();
      setUser(userData);

      // Save for persistence
      localStorage.setItem('user', JSON.stringify(userData));

    } catch (error) {
      setUser(false);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: supports dummy admin
  const login = async (email, password, dummyUser = null) => {
    // 🔥 Dummy admin login
    if (dummyUser) {
      setUser(dummyUser);
      localStorage.setItem('user', JSON.stringify(dummyUser));
      return dummyUser;
    }

    // ✅ Normal login
    const userData = await api.auth.login({ email, password });

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    return userData;
  };

  const register = async (name, email, password, phone, whatsappPhone, address, studyCentre, referralCode) => {
    const userData = await api.auth.register({ name, email, password, phone, whatsappPhone, address, studyCentre, referralCode });
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  // ✅ FIXED logout
  const logout = async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    try {
      await api.auth.logout();
    } catch (e) { }

    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};