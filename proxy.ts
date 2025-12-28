import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

const COOKIE_NAME = "auth_token";

// Routes yang memerlukan autentikasi dan akun terverifikasi
const protectedRoutes = ["/", "/event", "/finance"];

// Routes yang hanya bisa diakses jika TIDAK login
const guestOnlyRoutes = ["/auth/login", "/auth/register"];

// Routes yang hanya bisa diakses jika login tapi BELUM terverifikasi
const unverifiedOnlyRoutes = ["/auth/verify"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isGuestOnlyRoute = guestOnlyRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isUnverifiedOnlyRoute = unverifiedOnlyRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Tidak ada token (guest)
  if (!token) {
    if (isProtectedRoute) {
      const redirectUrl = new URL("/auth/login", request.url);
      redirectUrl.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (isUnverifiedOnlyRoute) {
      const redirectUrl = new URL("/auth/login", request.url);
      redirectUrl.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  // Ada token, verifikasi
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const isVerified = payload.isVerified as boolean;

    // User sudah login mencoba akses guest only route → redirect ke home
    if (isGuestOnlyRoute) {
      const redirectUrl = new URL("/", request.url);
      const originalRedirect = request.nextUrl.searchParams.get("redirect_url");
      if (originalRedirect) {
        redirectUrl.pathname = originalRedirect;
      }
      return NextResponse.redirect(redirectUrl);
    }

    // User sudah login dan terverifikasi mencoba akses unverified only route → redirect ke home
    if (isUnverifiedOnlyRoute && isVerified) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // User belum terverifikasi mencoba akses protected route → redirect ke verify
    if (isProtectedRoute && !isVerified) {
      return NextResponse.redirect(new URL("/auth/verify", request.url));
    }

    return NextResponse.next();
  } catch {
    // Token tidak valid, hapus cookie
    const response =
      isProtectedRoute || isUnverifiedOnlyRoute
        ? NextResponse.redirect(new URL("/auth/login", request.url))
        : NextResponse.next();
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    "/",
    "/event/:path*",
    "/finance/:path*",
    "/auth/login",
    "/auth/register",
    "/auth/verify",
    "/auth/verify/:token*",
  ],
};
