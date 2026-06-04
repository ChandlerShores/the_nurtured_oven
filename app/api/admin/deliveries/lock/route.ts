import { NextResponse } from "next/server"
import {
  parseAdminDateField,
  parseAdminSheetRow,
  readAdminJsonBody,
} from "@/lib/admin/api-input"
import { requireAdminApi } from "@/lib/admin/require-admin"
import { clampString } from "@/lib/security/public-input"
import { lockDeliveryRouteInSheet } from "@/lib/google-sheets/delivery-route"

interface LockStopInput {
  sheetRow: number
  sequence: number
}

function parseLockStops(value: unknown): LockStopInput[] | null {
  if (!Array.isArray(value) || value.length === 0) return null
  if (value.length > 100) return null

  const stops: LockStopInput[] = []
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null
    const raw = item as Record<string, unknown>
    const sheetRow = parseAdminSheetRow(raw.sheetRow)
    const sequenceRaw =
      typeof raw.sequence === "number" ? raw.sequence : Number(raw.sequence)
    if (sheetRow === undefined || !Number.isFinite(sequenceRaw)) return null
    const sequence = Math.floor(sequenceRaw)
    if (sequence < 1 || sequence > 100) return null
    stops.push({ sheetRow, sequence })
  }

  return stops
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const parsed = await readAdminJsonBody(request)
  if (!parsed.ok) return parsed.response

  const deliveryDate = parseAdminDateField(
    parsed.body.deliveryDate ?? parsed.body.fulfillmentDate,
    "Delivery date"
  )
  if (!deliveryDate.ok) {
    return NextResponse.json({ error: deliveryDate.error }, { status: 400 })
  }

  const routeBatchId = clampString(parsed.body.routeBatchId, 64)
  if (!routeBatchId) {
    return NextResponse.json(
      { error: "Route batch ID is required." },
      { status: 400 }
    )
  }

  const stops = parseLockStops(parsed.body.stops)
  if (!stops) {
    return NextResponse.json(
      { error: "Provide at least one stop with sheetRow and sequence." },
      { status: 400 }
    )
  }

  try {
    const lockedCount = await lockDeliveryRouteInSheet({
      routeBatchId,
      stops,
    })

    return NextResponse.json({
      ok: true,
      routeBatchId,
      lockedCount,
      fulfillmentDate: deliveryDate.value,
    })
  } catch (err) {
    console.error("[admin] delivery route lock failed", err)
    return NextResponse.json(
      { error: "Could not save the locked route to Google Sheets." },
      { status: 500 }
    )
  }
}
