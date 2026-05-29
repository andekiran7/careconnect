import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, seedIfNeeded } from '../data/store.js';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedIfNeeded();
    const saved = localStorage.getItem('cc_session');
    if (saved) { try { setUser(JSON.parse(saved)); } catch {} }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const result = loginUser(email, password);
    if (!result || result.error) return result?.error || 'Invalid email or password.';
    setUser(result);
    localStorage.setItem('cc_session', JSON.stringify(result));
    return null; // null = success
  };

  const register = (data) => {
    const result = registerUser(data);
    if (result.error) return result.error;
    setUser(result);
    localStorage.setItem('cc_session', JSON.stringify(result));
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cc_session');
  };

  // Refresh user from store (e.g. after profile update)
  const refreshUser = () => {
    const users = JSON.parse(localStorage.getItem('cc_users') || '[]');
    const fresh = users.find(u => u.id === user?.id);
    if (fresh) { setUser(fresh); localStorage.setItem('cc_session', JSON.stringify(fresh)); }
  };

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
