// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/profile"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public files, APIs, and unprotected routes
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname === "/" ||
    !protectedRoutes.includes(pathname)
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("authToken");

  if (!token) {
    const referer = req.headers.get("referer");
    if (referer?.includes("/api/auth/google/callback")) {
      return NextResponse.next();
    }

    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  const verifyUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8000/api/auth/verify"
      : "https://api.resumerouter.app/api/auth/verify";

  try {
    const res = await fetch(verifyUrl, {
      credentials: "include",
      headers: { Cookie: `authToken=${token.value}` }, // ⬅️ manually forward token
    });

    // If token is expired or invalid (401), clear cookie and redirect to signin
    if (!res.ok || res.status === 401) {
      const url = req.nextUrl.clone();
      url.pathname = "/signin";
      const response = NextResponse.redirect(url);
      
      // Clear the expired/invalid auth token cookie
      response.cookies.delete("authToken");
      
      return response;
    }

    return NextResponse.next();
  } catch {
    // On any error (network, etc.), clear cookie and redirect to signin
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    const response = NextResponse.redirect(url);
    
    // Clear the auth token cookie on error
    response.cookies.delete("authToken");
    
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"], // ✅ enables protection
};
