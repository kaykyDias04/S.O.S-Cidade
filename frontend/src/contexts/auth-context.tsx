'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authAPI } from '@/src/lib/api';

export interface User {
  name: string;
  role: 'DENUNCIANTE' | 'GESTOR';
  email?: string;
  id?: number;
}

interface AuthContextType {
  user: User | null; 
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false); 
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);

      if (response.success && response.data) {
        // Map legacy roles from API to new roles
        const rawRole = response.data.user.role;
        const mappedRole: 'DENUNCIANTE' | 'GESTOR' =
          rawRole === 'PROFESSOR' || rawRole === 'GESTOR' ? 'GESTOR' : 'DENUNCIANTE';

        const userData: User = {
          name: response.data.user.name,
          role: mappedRole,
          email: response.data.user.email,
          id: response.data.user.id,
        };

        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);

        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login error';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
