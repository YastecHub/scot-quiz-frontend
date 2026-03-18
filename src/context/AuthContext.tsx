import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, type AuthUser } from '../api/client';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]     = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('scot_token');
    if (!token) { setLoading(false); return; }
    authAPI.me()
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem('scot_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authAPI.login(email, password);
    localStorage.setItem('scot_token', res.data.token);
    setUser(res.data.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await authAPI.register(name, email, password);
    localStorage.setItem('scot_token', res.data.token);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('scot_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin: !!user?.is_admin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
