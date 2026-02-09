import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface User {
  login: string;
  avatar_url: string;
  name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  accessToken: string | null;
  login: () => void;
  logout: () => void;
  handleCallback: (code: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const CLIENT_ID = import.meta.env['VITE_GITHUB_CLIENT_ID'] as string;
const TOKEN_KEY = 'github_token';
const USER_KEY = 'github_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedToken = sessionStorage.getItem(TOKEN_KEY);
    const storedUser = sessionStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(() => {
    const redirectUri = `${window.location.origin}/admin/callback`;
    const scope = 'repo';
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
    window.location.href = authUrl;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setAccessToken(null);
    setUser(null);
    window.location.href = '/admin/login';
  }, []);

  const handleCallback = useCallback(async (code: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const tokenResponse = await fetch('/api/github-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange token');
      }

      const tokenData = await tokenResponse.json();
      const token = tokenData.access_token;

      const userResponse = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user');
      }

      const userData = await userResponse.json();
      const userInfo: User = {
        login: userData.login,
        avatar_url: userData.avatar_url,
        name: userData.name,
      };

      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(userInfo));

      setAccessToken(token);
      setUser(userInfo);
      setIsLoading(false);

      return true;
    } catch (error) {
      console.error('Auth callback error:', error);
      setIsLoading(false);
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!accessToken,
        isLoading,
        user,
        accessToken,
        login,
        logout,
        handleCallback,
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
