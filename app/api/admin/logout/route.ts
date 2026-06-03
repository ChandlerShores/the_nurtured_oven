import { NextResponse } from "next/server"
import { clearAdminSessionCookieOptions } from "@/lib/admin/auth"

export async function POST() {
  return logout()
}

async function logout() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(clearAdminSessionCookieOptions())
  return response
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 })
}
