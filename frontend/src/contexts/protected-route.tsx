'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth, User } from './auth-context';

interface RoleProtectedRouteProps {
  allowedRoles: User['role'][];
  children: React.ReactNode;
}

export function RoleProtectedRoute({ allowedRoles, children }: RoleProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace('/');
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      const homePath = user.role === 'GESTOR' ? '/denuncias-recentes' : '/homepage-denunciante';
      router.replace(homePath);
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  if (isLoading) return null;

  return <>{children}</>;
}
