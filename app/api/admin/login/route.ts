import { NextResponse } from "next/server"
import {
  adminSessionCookieOptions,
  getAdminPassword,
  verifyAdminPassword,
} from "@/lib/admin/auth"
import {
  clearLoginAttemptsAsync,
  consumeLoginRateLimitAsync,
  delayFailedLoginResponse,
  getLoginClientKey,
} from "@/lib/admin/login-rate-limit"
import { createAdminSessionTokenAsync } from "@/lib/admin/session-token"

export async function POST(request: Request) {
  if (!getAdminPassword()) {
    return NextResponse.json(
      { error: "Admin login is not configured." },
      { status: 503 }
    )
  }

  try {
    const clientKey = getLoginClientKey(request)
    const limit = await consumeLoginRateLimitAsync(clientKey)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSec) },
        }
      )
    }

    const body = (await request.json()) as { password?: string }
    const password = body.password ?? ""
    if (!password || !verifyAdminPassword(password)) {
      await delayFailedLoginResponse()
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 })
    }

    await clearLoginAttemptsAsync(clientKey)

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
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 })
    }
    console.error("[admin] login failed", err)
    return NextResponse.json(
      { error: "Could not process login." },
      { status: 500 }
    )
  }
}
