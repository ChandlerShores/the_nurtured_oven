import { NextResponse } from "next/server"
import {
  adminSessionCookieOptions,
  getAdminPassword,
  verifyAdminPassword,
} from "@/lib/admin/auth"
import {
  checkLoginRateLimit,
  clearLoginAttempts,
  delayFailedLoginResponse,
  getLoginClientKey,
  recordFailedLoginAttempt,
} from "@/lib/admin/login-rate-limit"
import { createAdminSessionTokenAsync } from "@/lib/admin/session-token"

export async function POST(request: Request) {
  if (!getAdminPassword()) {
    return NextResponse.json(
      { error: "Admin login is not configured." },
      { status: 503 }
    )
  }

  const clientKey = getLoginClientKey(request)
  const limit = checkLoginRateLimit(clientKey)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      }
    )
  }

  let body: { password?: string }
  try {
    body = (await request.json()) as { password?: string }
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const password = body.password ?? ""
  if (!password || !verifyAdminPassword(password)) {
    recordFailedLoginAttempt(clientKey)
    await delayFailedLoginResponse()
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 })
  }

  clearLoginAttempts(clientKey)

  const token = await createAdminSessionTokenAsync()
  if (!token) {
    return NextResponse.json(
      { error: "Could not create session." },
      { status: 500 }
    )
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(adminSessionCookieOptions(token))
  return response
}
