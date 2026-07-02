import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicPaths = ["/login", "/register", "/", "/api/auth/login", "/api/auth/register", "/api/auth/google", "/api/auth/connect/callback"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next()
  }

  const token = request.cookies.get("token")?.value
  const authHeader = request.headers.get("authorization")

  if (token || authHeader?.startsWith("Bearer ")) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (pathname.startsWith("/app") || pathname.startsWith("/setup")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/app/:path*", "/setup/:path*", "/api/:path*"],
}
