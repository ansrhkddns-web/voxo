import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth';
import { getAdminSessionTokenForCurrentConfig } from '@/lib/admin-auth-server';

const PUBLIC_MAINTENANCE_ALLOWLIST = ['/maintenance', '/login'];

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    const pathname = request.nextUrl.pathname;
    const isAdminRoute = pathname.startsWith('/admin');
    const isLoginRoute = pathname === '/login';
    const isMaintenanceRoute = pathname === '/maintenance';
    const isPublicRoute = !isAdminRoute && !pathname.startsWith('/api');

    const [{ data: { user } }, expectedAdminToken, maintenanceSetting] = await Promise.all([
        supabase.auth.getUser(),
        getAdminSessionTokenForCurrentConfig(),
        supabase
            .from('site_settings')
            .select('setting_value')
            .eq('setting_key', 'maintenance_mode')
            .maybeSingle(),
    ]);

    const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const hasDefaultAdminSession = adminToken === expectedAdminToken;
    const isMaintenanceMode = maintenanceSetting.data?.setting_value === 'true';

    if (isAdminRoute && !user && !hasDefaultAdminSession) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isLoginRoute && (user || hasDefaultAdminSession)) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    if (isMaintenanceMode && isPublicRoute && !PUBLIC_MAINTENANCE_ALLOWLIST.includes(pathname)) {
        return NextResponse.redirect(new URL('/maintenance', request.url));
    }

    if (!isMaintenanceMode && isMaintenanceRoute) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)',
    ],
};
