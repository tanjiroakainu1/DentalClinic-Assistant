import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { SessionUser, UserRole } from '../types';
import { getSession, login as storageLogin, logout as storageLogout } from '../lib/storage';

interface AuthContextValue {
  user: SessionUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => getSession());

  const login = useCallback((email: string, password: string) => {
    const session = storageLogin(email, password);
    if (session) {
      setUser(session);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    storageLogout();
    setUser(null);
  }, []);

  const refreshSession = useCallback(() => {
    setUser(getSession());
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getDashboardPath(role: UserRole): string {
  return `/${role}/dashboard`;
}
