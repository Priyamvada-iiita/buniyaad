import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { parseSessionRole } from '@/lib/session-role';

function getAdminSlug(): string | null {
  const slug = process.env.ADMIN_PATH?.trim();
  return slug || null;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  const pathname = request.nextUrl.pathname;
  const adminSlug = getAdminSlug();

  if (pathname.startsWith('/admin')) {
    return new NextResponse(null, { status: 404 });
  }

  if (pathname.startsWith('/internal/')) {
    if (!adminSlug) {
      return new NextResponse(null, { status: 404 });
    }

    const segments = pathname.split('/').filter(Boolean);
    const slug = segments[1];

    if (slug !== adminSlug) {
      return new NextResponse(null, { status: 404 });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const loginPath = `/internal/${adminSlug}/login`;
    const isLoginPage = pathname === loginPath;

    if (!isLoginPage && !user) {
      const url = request.nextUrl.clone();
      url.pathname = loginPath;
      return NextResponse.redirect(url);
    }

    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const activeRole = parseSessionRole(request.cookies.get('buniyaad_active_role')?.value);

  const protectedBuyerPaths = ['/buyer/orders', '/buyer/rfq'];
  const isProtectedBuyer = protectedBuyerPaths.some((p) => pathname.startsWith(p));
  const isCart = pathname === '/cart';
  const isProtectedSeller = pathname.startsWith('/seller');

  if ((isProtectedBuyer || isProtectedSeller) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && activeRole) {
    if (isProtectedSeller && activeRole === 'buyer') {
      const url = request.nextUrl.clone();
      url.pathname = '/choose-role';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    if ((isProtectedBuyer || isCart) && activeRole === 'seller') {
      const url = request.nextUrl.clone();
      url.pathname = '/choose-role';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/buyer/orders/:path*',
    '/buyer/rfq/:path*',
    '/seller/:path*',
    '/cart',
    '/internal/:path*',
    '/admin/:path*',
  ],
};
