import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iafbgxyvuxlqjhhznseg.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    'sb_publishable_188JcMuPJanJBhk4LpsZFg__yb99T2a';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  if (isAdminPath && !isLoginPage) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    // Verify user in admin_users table
    const { data: adminRecord } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!adminRecord) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url));
    }
  }

  if (isLoginPage && user) {
    const { data: adminRecord } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (adminRecord) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
