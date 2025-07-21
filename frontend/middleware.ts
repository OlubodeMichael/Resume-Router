// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];

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
      console.log("🔍 OAuth redirect detected, allowing access");
      return NextResponse.next();
    }

    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  const verifyUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8000/api/auth/verify"
      : "https://api.resumeroute.com/api/auth/verify";

  try {
    const res = await fetch(verifyUrl, {
      credentials: "include",
      headers: { Cookie: `authToken=${token.value}` }, // ⬅️ manually forward token
    });

    if (!res.ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/signin";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/dashboard/:path*"], // ✅ enables protection
};
