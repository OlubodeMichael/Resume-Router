import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/auth/") ||
    pathname === "/" ||
    !protectedRoutes.includes(pathname)
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("authToken");

  if (!token) {
    const referer = req.headers.get("referer");
    if (referer && referer.includes("/api/auth/google/callback")) {
      console.log("🔍 OAuth redirect detected, allowing access");
      return NextResponse.next();
    }

    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  const verifyUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8000/api/auth/verify"
      : "https://app.resumeroute.com/api/auth/verify";

  try {
    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/signin";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Token verification failed:", error);
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};