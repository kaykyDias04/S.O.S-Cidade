import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const role = request.cookies.get('userRole')?.value;
  const path = request.nextUrl.pathname;

  // Define rotas públicas que usuários não logados podem acessar livremente (ex: login e cadastro)
  const publicPaths = ['/', '/cadastro'];
  const isPublicPath = publicPaths.includes(path);

  // 1. Bloqueia acessos a telas privadas quando o usuário NÂO possui token
  if (!isPublicPath && !token) {
    // Escapa imediatamente para a tela de login
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Bloqueia usuários LOGADOS de tentarem acessar a tela de login ("/" ou "/cadastro")
  if (isPublicPath && token) {
    // Redireciona diretamente para o dashboard apropriado (seguro e imediato)
    const dashboardUrl = role === 'GESTOR' ? '/denuncias-recentes' : '/homepage-denunciante';
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // 3. Impede acesso cruzado de perfis
  if (token && !isPublicPath) {
    if (role === 'GESTOR' && path.startsWith('/homepage-denunciante')) {
      return NextResponse.redirect(new URL('/denuncias-recentes', request.url));
    }
    if (role === 'DENUNCIANTE' && path.startsWith('/denuncias-recentes')) {
      return NextResponse.redirect(new URL('/homepage-denunciante', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Aplica o middleware em todas as páginas, 
  // EXCLUINDO assets locais (imagens genéricas, SVG, CSS, rotas da fakeAPI e internals do _next)
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
