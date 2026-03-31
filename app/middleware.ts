import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 1. Get the cookie from the request headers
    const token = request.cookies.get('accessToken')?.value;

    // 2. Define protected routes (e.g., /vendor or /admin)
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/vendor') ||
        request.nextUrl.pathname.startsWith('/admin');

    // 3. Redirect to login if token is missing
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// Optional: Limit which routes this middleware runs on
export const config = {
    matcher: ['/vendor/:path*', '/admin/:path*'],
};