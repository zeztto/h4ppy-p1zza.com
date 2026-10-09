import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { getSession, logout as requestLogout, startLogin } from './services/api';
import type { AdminUser } from './types';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  logoutError: string | null;
  user: AdminUser | null;
  login: () => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

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
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await requestLogout();
      setUser(null);
      setIsLoading(false);
      window.location.assign('/admin/login');
    } catch {
      setLogoutError('로그아웃을 완료하지 못했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
        isLoggingOut,
        logoutError,
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
