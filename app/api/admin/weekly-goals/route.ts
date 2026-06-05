import { NextResponse } from "next/server"
import { readAdminJsonBody } from "@/lib/admin/api-input"
import { requireAdminApi } from "@/lib/admin/require-admin"
import { loadWeeklyGoalsContext } from "@/lib/admin/load-bakery-week-goals"
import { parseMoneyToCents } from "@/lib/admin/money"
import {
  fetchAllWeeklyGoalsFromSheet,
  upsertWeeklyGoals,
} from "@/lib/google-sheets/weekly-goals"
import { findWeekSpecificGoalRow } from "@/lib/google-sheets/weekly-goals-data"
import { getWeeklyFulfillmentContext } from "@/lib/order/weekly-fulfillment"
import { clampString } from "@/lib/security/public-input"

function parseGoalCount(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null
  const n = Number.parseInt(String(raw), 10)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

function parseRevenueGoalCents(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null
  const cents = parseMoneyToCents(String(raw))
  return cents > 0 ? cents : null
}

export async function GET(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const url = new URL(request.url)
  const fulfillmentDate = clampString(
    url.searchParams.get("fulfillmentDate"),
    32
  )
  const batchLabel = clampString(url.searchParams.get("batchLabel"), 64)

  const ctx = getWeeklyFulfillmentContext()
  const date = fulfillmentDate || ctx.fulfillmentDate
  const label = batchLabel || ctx.batchLabel

  try {
    const ctx = await loadWeeklyGoalsContext(date, label)
    const rows = await fetchAllWeeklyGoalsFromSheet()
    const weekRow = findWeekSpecificGoalRow(rows, date, label)
    return NextResponse.json({
      goals: ctx.effective,
      weekTargets: ctx.weekTargets,
      defaultBackup: ctx.defaultBackup,
      hasWeekSpecificRow: ctx.hasWeekSpecificRow,
      usingDefaultBackup: ctx.usingDefaultBackup,
      fulfillmentDate: date,
      batchLabel: label,
      sheetRow: weekRow?.sheetRow ?? null,
      updatedAt: weekRow?.updatedAt ?? null,
    })
  } catch (err) {
    console.error("[admin] weekly goals GET failed", err)
    return NextResponse.json(
      { error: "Could not load weekly goals." },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const parsed = await readAdminJsonBody(request)
  if (!parsed.ok) return parsed.response

  const fulfillmentDate = clampString(parsed.body.fulfillmentDate, 32)
  const batchLabel = clampString(parsed.body.batchLabel, 64)
  const notes = clampString(parsed.body.notes, 500)

  const ctx = getWeeklyFulfillmentContext()
  const date = fulfillmentDate || ctx.fulfillmentDate
  const label = batchLabel || ctx.batchLabel

  if (!date) {
    return NextResponse.json(
      { error: "Fulfillment date is required." },
      { status: 400 }
    )
  }

  const revenueGoalCents = parseRevenueGoalCents(
    parsed.body.revenueGoal ?? parsed.body.revenueGoalDollars
  )
  const orderGoalCount = parseGoalCount(parsed.body.orderGoalCount)

  try {
    const saved = await upsertWeeklyGoals({
      fulfillmentDate: date,
      batchLabel: label,
      revenueGoalCents,
      orderGoalCount,
      notes,
    })
    const ctx = await loadWeeklyGoalsContext(date, label)
    return NextResponse.json({ ok: true, saved, ...ctx, goals: ctx.effective })
  } catch (err) {
    console.error("[admin] weekly goals PUT failed", err)
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not save weekly goals.",
      },
      { status: 500 }
    )
  }
}
