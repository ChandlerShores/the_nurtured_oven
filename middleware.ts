import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin/session-token"

function withAdminSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  response.headers.set("X-Content-Type-Options", "nosniff")
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminPage = pathname.startsWith("/admin")
  const isAdminApi = pathname.startsWith("/api/admin")

  if (!isAdminPage && !isAdminApi) {
    const response = NextResponse.next()
    response.headers.set("x-pathname", pathname)
    return response
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const authenticated = await verifyAdminSessionToken(token)

  if (pathname === "/admin/login") {
    if (authenticated) {
      return withAdminSecurityHeaders(
        NextResponse.redirect(new URL("/admin", request.url))
      )
    }
    const response = NextResponse.next()
    response.headers.set("x-pathname", pathname)
    return withAdminSecurityHeaders(response)
  }

  if (pathname === "/api/admin/login" || pathname === "/api/admin/logout") {
    const response = NextResponse.next()
    response.headers.set("x-pathname", pathname)
    return withAdminSecurityHeaders(response)
  }

  const response = NextResponse.next()
  response.headers.set("x-pathname", pathname)

  if (!authenticated) {
    if (isAdminApi) {
      return withAdminSecurityHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      )
    }
    const loginUrl = new URL("/admin/login", request.url)
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      loginUrl.searchParams.set("next", pathname)
    }
    return withAdminSecurityHeaders(NextResponse.redirect(loginUrl))
  }

  return withAdminSecurityHeaders(response)
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
}
