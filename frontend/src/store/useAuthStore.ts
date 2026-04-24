import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/src/lib/api';

export interface User {
  name: string;
  role: 'DENUNCIANTE' | 'GESTOR';
  email?: string;
  id?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login(email, password);

          if (response.success && response.data) {
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
            set({ user: userData, isAuthenticated: true, isLoading: false });

            return { success: true };
          } else {
            set({ isLoading: false });
            return { success: false, error: response.error || 'Login failed' };
          }
        } catch (error) {
          set({ isLoading: false });
          const message = error instanceof Error ? error.message : 'Login error';
          return { success: false, error: message };
        }
      },

      logout: () => {
        localStorage.removeItem('authToken');
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage', // key in local storage
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }), // persist user and auth status
    }
  )
);
