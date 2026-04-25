import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Hydrate on mount ─────────────────────────────────── */
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authApi.profile()
        .then(({ data }) => setUser(data))
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  /* ── Handle token expiry event ────────────────────────── */
  useEffect(() => {
    const handler = () => { setUser(null); };
    window.addEventListener('auth:expired', handler);
    return () => window.removeEventListener('auth:expired', handler);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    const profile = await authApi.profile();
    setUser(profile.data);
    return profile.data;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authApi.register(formData);
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token');
    try { if (refresh) await authApi.logout(refresh); } catch (_) { /* ignore */ }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }, []);

  const updateUser = useCallback((updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
