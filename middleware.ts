import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin/session-token"

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login"])

function isPublicAdminPath(pathname: string): boolean {
  return (
    PUBLIC_ADMIN_PATHS.has(pathname) || pathname === "/api/admin/logout"
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminPage = pathname.startsWith("/admin")
  const isAdminApi = pathname.startsWith("/api/admin")

  const response = NextResponse.next()
  response.headers.set("x-pathname", pathname)

  if (!isAdminPage && !isAdminApi) {
    return response
  }

  if (isPublicAdminPath(pathname) || pathname === "/api/admin/login") {
    return response
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!(await verifyAdminSessionToken(token))) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const loginUrl = new URL("/admin/login", request.url)
    if (pathname !== "/admin") {
      loginUrl.searchParams.set("next", pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
