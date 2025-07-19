// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// Define paths that require authentication
const protectedRoutes = ["/dashboard"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for API routes, public files, or non-protected routes
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/auth/") ||
    pathname === "/" ||
    !protectedRoutes.includes(pathname)
  ) {
    return NextResponse.next();
  }

  // Check for authToken cookie
  const token = req.cookies.get("authToken");

  if (!token) {
    // Redirect to signin page if no token
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  // Verify token with backend
  const verifyUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8000/api/auth/verify"
      : "https://app.resumeroute.com/api/auth/verify";

  try {
    const response = await fetch(verifyUrl, {
      credentials: "include", // Include cookies
    });

    if (!response.ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/signin";
      return NextResponse.redirect(url);
    }

    // If verified, proceed
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/dashboard/:path*"], // Apply middleware to /dashboard and its subroutes
};