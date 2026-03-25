import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { getSession, logout as requestLogout, startLogin } from './services/api';
import type { AdminUser } from './types';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AdminUser | null;
  login: () => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);

    try {
      const session = await getSession();
      setUser(session.authenticated ? session.user : null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(() => {
    startLogin();
  }, []);

  const logout = useCallback(async () => {
    try {
      await requestLogout();
    } catch {
      // Ignore logout errors and continue clearing local state.
    } finally {
      setUser(null);
      setIsLoading(false);
      window.location.assign('/admin/login');
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
        user,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
