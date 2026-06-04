import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin/require-admin"
import {
  getOrderingKillSwitchState,
  setAdminOrderingKillSwitch,
} from "@/lib/admin/ordering-kill-switch"
import { revalidatePublicMenu } from "@/lib/admin/revalidate-public-menu"

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const state = await getOrderingKillSwitchState()
  return NextResponse.json({ state })
}

export async function PATCH(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let body: { enabled?: unknown }
  try {
    body = (await request.json()) as { enabled?: unknown }
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  if (typeof body.enabled !== "boolean") {
    return NextResponse.json(
      { error: "enabled must be a boolean." },
      { status: 400 }
    )
  }

  const result = await setAdminOrderingKillSwitch(body.enabled)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  revalidatePublicMenu()
  const state = await getOrderingKillSwitchState()
  return NextResponse.json({ ok: true, state })
}
