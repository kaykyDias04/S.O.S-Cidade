import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const role = request.cookies.get('userRole')?.value;
  const path = request.nextUrl.pathname;

  const publicPaths = ['/', '/cadastro'];
  const isPublicPath = publicPaths.includes(path);

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isPublicPath && token) {
    const dashboardUrl = role === 'GESTOR' ? '/denuncias-recentes' : '/homepage-denunciante';
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }
  const denuncianteRoutes = ['/homepage-denunciante', '/minhas-denuncias', '/nova-denuncia'];
  const gestorRoutes = ['/denuncias-recentes'];

  if (token && !isPublicPath) {
    if (role === 'GESTOR' && denuncianteRoutes.some(r => path.startsWith(r))) {
      return NextResponse.redirect(new URL('/denuncias-recentes', request.url));
    }
    if (role === 'DENUNCIANTE' && gestorRoutes.some(r => path.startsWith(r))) {
      return NextResponse.redirect(new URL('/homepage-denunciante', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
