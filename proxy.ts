import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const pathname = request.nextUrl.pathname;

  const isVendorRoute = pathname.startsWith("/vendor");
  const isAdminRoute = pathname.startsWith("/admin");
  const isCustomerRoute = pathname.startsWith("/customer");

  //   console.log(`[Proxy Middleware] Request: ${pathname} | Has Token: ${!!token}`);
  //   if (token) {
  //     console.log(`[Proxy Middleware] Token value: ${token}`);
  //   }

  //   1. Missing Token Fallbacks
  if (!token) {
    if (isVendorRoute)
      return NextResponse.redirect(new URL("/auth/vendorLogin", request.url));
    if (isAdminRoute)
      return NextResponse.redirect(new URL("/auth/adminLogin", request.url));
    if (isCustomerRoute)
      return NextResponse.redirect(new URL("/auth/customerLogin", request.url));
  }

  // 2. Token Presence & Role Checks (Edge Base64 Decode)
  if (token) {
    try {
      const base64Url = token.split(".")[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(""),
        );
        const payload = JSON.parse(jsonPayload);
        const role = payload.role?.toLowerCase() || "";
        // console.log(`[Proxy Middleware] Decoded payload:`, payload, `| Role: ${role}`);

        // Enforce Route-Role boundaries (Backend enforces actual crypto signatures)
        if (isVendorRoute && role !== "vendor" && role !== "admin") {
          console.log(
            `[Proxy Middleware] Redirecting vendor route ${pathname} to /auth/vendorLogin because role is ${role}`,
          );
          return NextResponse.redirect(
            new URL("/auth/vendorLogin", request.url),
          );
        }
        if (isAdminRoute && role !== "admin") {
          //   console.log(`[Proxy Middleware] Redirecting admin route ${pathname} to /auth/adminLogin because role is ${role}`);
          return NextResponse.redirect(
            new URL("/auth/adminLogin", request.url),
          );
        }
      } else {
        //  console.warn(`[Proxy Middleware] Token did not contain a payload segment.`);
      }
    } catch (e: any) {
      //   console.error(`[Proxy Middleware] Token decoding error:`, e?.message || e);
      // Token is malformed - backend APIs will reject and Axio 401 interceptor will handle hard clears
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/vendor/:path*", "/admin/:path*", "/customer/:path*"],
};
