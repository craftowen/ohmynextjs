import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Paths that never need auth checking
const PUBLIC_PATHS = ['/', '/terms', '/privacy', '/api/health'];
const PUBLIC_PREFIXES = ['/auth', '/api/auth'];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Supabase call entirely for public paths
  if (PUBLIC_PATHS.includes(pathname) || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getClaims: 로컬 JWKS 검증으로 네트워크 호출 없이 JWT 확인 (~1-10ms vs getUser의 50-300ms)
  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = !error && !!data?.claims?.sub;

  // Protected routes: redirect to login if not authenticated
  if (!isAuthenticated) {
    const protectedPaths = ['/dashboard', '/settings', '/admin'];
    const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }
  }

  // 로그인 상태에서 auth 페이지 접근 시 dashboard로 리다이렉트
  // (reset-password는 recovery 세션으로 접근하므로 예외)
  if (
    isAuthenticated &&
    pathname.startsWith('/auth/') &&
    pathname !== '/auth/reset-password'
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
