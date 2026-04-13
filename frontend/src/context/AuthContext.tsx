import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import * as api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('neon_arena_token');
    if (stored) {
      setToken(stored);
      api.getMe()
        .then((res) => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('neon_arena_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const res = await api.login(email, password);
    const { token: t, user: u } = res.data;
    localStorage.setItem('neon_arena_token', t);
    setToken(t);
    setUser(u);
    setIsAuthModalOpen(false);
  }

  async function register(name: string, email: string, password: string) {
    const res = await api.register(name, email, password);
    const { token: t, user: u } = res.data;
    localStorage.setItem('neon_arena_token', t);
    setToken(t);
    setUser(u);
    setIsAuthModalOpen(false);
  }

  function logout() {
    localStorage.removeItem('neon_arena_token');
    setToken(null);
    setUser(null);
  }

  function openAuthModal(mode: 'login' | 'register' = 'login') {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }

  function closeAuthModal() {
    setIsAuthModalOpen(false);
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout,
      isAuthModalOpen, authModalMode,
      openAuthModal, closeAuthModal,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
