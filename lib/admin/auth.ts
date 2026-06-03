import { timingSafeEqual } from "crypto"
import { cookies } from "next/headers"
import {
  ADMIN_SESSION_COOKIE,
  adminSessionMaxAgeSec,
  getAdminPassword,
  verifyAdminSessionToken,
} from "@/lib/admin/session-token"

export { ADMIN_SESSION_COOKIE, getAdminPassword }

export function adminSessionCookieOptions(token: string) {
  const secure =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL_ENV === "preview"

  return {
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: adminSessionMaxAgeSec,
  }
}

export function clearAdminSessionCookieOptions() {
  const secure =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL_ENV === "preview"

  return {
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)
}

export function verifyAdminPassword(password: string): boolean {
  const expected = getAdminPassword()
  if (!expected) return false

  const a = Buffer.from(password)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
