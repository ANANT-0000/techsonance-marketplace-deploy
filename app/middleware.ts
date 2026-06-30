import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value;
    const pathname = request.nextUrl.pathname;

    const isVendorRoute = pathname.startsWith('/vendor');
    const isAdminRoute = pathname.startsWith('/admin');
    const isCustomerRoute = pathname.startsWith('/customer');

    // 1. Missing Token Fallbacks
    if (!token) {
        if (isVendorRoute) return NextResponse.redirect(new URL('/auth/vendorLogin', request.url));
        if (isAdminRoute) return NextResponse.redirect(new URL('/auth/adminLogin', request.url));
        if (isCustomerRoute) return NextResponse.redirect(new URL('/auth/customerLogin', request.url));
    }

    // 2. Token Presence & Role Checks (Edge Base64 Decode)
    if (token) {
        try {
            const base64Url = token.split('.')[1];
            if (base64Url) {
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const payload = JSON.parse(jsonPayload);
                const role = payload.role?.toLowerCase() || '';

                // Enforce Route-Role boundaries (Backend enforces actual crypto signatures)
                if (isVendorRoute && role !== 'vendor' && role !== 'admin') {
                    return NextResponse.redirect(new URL('/auth/vendorLogin', request.url));
                }
                if (isAdminRoute && role !== 'admin') {
                    return NextResponse.redirect(new URL('/auth/adminLogin', request.url));
                }
            }
        } catch (e) {
            // Token is malformed - backend APIs will reject and Axio 401 interceptor will handle hard clears
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/vendor/:path*', '/admin/:path*', '/customer/:path*'],
};