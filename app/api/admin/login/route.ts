import { NextResponse } from "next/server"
import {
  adminSessionCookieOptions,
  getAdminPassword,
  verifyAdminPassword,
} from "@/lib/admin/auth"
import { createAdminSessionTokenAsync } from "@/lib/admin/session-token"

export async function POST(request: Request) {
  if (!getAdminPassword()) {
    return NextResponse.json(
      { error: "Admin login is not configured." },
      { status: 503 }
    )
  }

  let body: { password?: string }
  try {
    body = (await request.json()) as { password?: string }
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const password = body.password?.trim() ?? ""
  if (!password || !verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 })
  }

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
