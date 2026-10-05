import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../../services/auth.service';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'STARTUP' | 'LAWYER' | 'ADMIN';
  startup?: { id: string; onboardingDone: boolean; onboardingStep: number; verificationStatus: string };
  lawyer?: { id: string; onboardingDone: boolean; onboardingStep: number; verificationStatus: string };
}

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: 'STARTUP' | 'LAWYER') => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setAccessToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, try to refresh session from HTTP-only cookie
  useEffect(() => {
    const init = async () => {
      try {
        const res = await authService.refresh();
        setAccessToken(res.accessToken);
        setUser(res.user);
        localStorage.setItem('token', res.accessToken);
      } catch {
        // No valid session — user is not logged in
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await authService.login(email, password);
    setAccessToken(res.accessToken);
    setUser(res.user as User);
    localStorage.setItem('token', res.accessToken);
    return res.user as User;
  };

  const register = async (name: string, email: string, password: string, role: 'STARTUP' | 'LAWYER'): Promise<User> => {
    const res = await authService.register(name, email, password, role);
    setAccessToken(res.accessToken);
    setUser(res.user as User);
    localStorage.setItem('token', res.accessToken);
    return res.user as User;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  const refreshUser = async () => {
    const res = await authService.getMe();
    setUser(res.user);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, register, logout, refreshUser, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
