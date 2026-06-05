import { parseMoneyToCents } from "@/lib/admin/money"
import { matchesFulfillmentWeek } from "@/lib/admin/fulfillment-label-match"

export interface WeeklyGoalRow {
  sheetRow: number
  fulfillmentDate: string
  revenueGoalCents: number | null
  orderGoalCount: number | null
  notes: string
  updatedAt: string
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_")
}

function columnIndex(headers: string[], names: string[]): number {
  for (const name of names) {
    const idx = headers.indexOf(name)
    if (idx >= 0) return idx
  }
  return -1
}

function parseOrderGoal(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const n = Number.parseInt(trimmed, 10)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

function parseRevenueGoalCents(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const cents = parseMoneyToCents(trimmed)
  return cents > 0 ? cents : null
}

export function parseWeeklyGoalDataRows(values: string[][]): WeeklyGoalRow[] {
  if (values.length < 2) return []

  const headers = (values[0] ?? []).map(normalizeHeader)
  const dateCol = columnIndex(headers, [
    "fulfillment_date",
    "fulfillment",
    "bake_week",
    "week",
  ])
  const revenueCol = columnIndex(headers, [
    "revenue_goal",
    "revenue_goal_dollars",
    "revenue_target",
    "revenue",
  ])
  const orderCol = columnIndex(headers, [
    "order_goal",
    "order_goal_count",
    "orders_goal",
    "order_target",
    "orders",
  ])
  const notesCol = columnIndex(headers, ["notes", "note"])
  const updatedCol = columnIndex(headers, ["updated_at", "updated"])

  const dateIdx = dateCol >= 0 ? dateCol : 0
  const revenueIdx = revenueCol >= 0 ? revenueCol : 1
  const orderIdx = orderCol >= 0 ? orderCol : 2
  const notesIdx = notesCol >= 0 ? notesCol : 3
  const updatedIdx = updatedCol >= 0 ? updatedCol : 4

  const rows: WeeklyGoalRow[] = []
  for (let i = 1; i < values.length; i++) {
    const row = values[i]
    if (!row?.length) continue
    const fulfillmentDate = (row[dateIdx] ?? "").trim()
    const revenueGoalCents = parseRevenueGoalCents(row[revenueIdx] ?? "")
    const orderGoalCount = parseOrderGoal(row[orderIdx] ?? "")
    const notes = (row[notesIdx] ?? "").trim()
    if (
      !fulfillmentDate &&
      revenueGoalCents == null &&
      orderGoalCount == null &&
      !notes
    ) {
      continue
    }
    rows.push({
      sheetRow: i + 1,
      fulfillmentDate,
      revenueGoalCents,
      orderGoalCount,
      notes,
      updatedAt: (row[updatedIdx] ?? "").trim(),
    })
  }
  return rows
}

export function isDefaultGoalRow(row: WeeklyGoalRow): boolean {
  const key = row.fulfillmentDate.trim().toLowerCase()
  return !key || key === "default" || key === "any"
}

/** Row for this bake week only (not the default backup row). */
export function findWeekSpecificGoalRow(
  rows: WeeklyGoalRow[],
  fulfillmentDate: string,
  batchLabel: string
): WeeklyGoalRow | null {
  return (
    rows.find(
      (row) =>
        !isDefaultGoalRow(row) &&
        matchesFulfillmentWeek(row.fulfillmentDate, fulfillmentDate, batchLabel)
    ) ?? null
  )
}

export function findDefaultGoalRow(rows: WeeklyGoalRow[]): WeeklyGoalRow | null {
  return rows.find(isDefaultGoalRow) ?? null
}

/** Week-specific row, else default backup row. */
export function findWeeklyGoalForWeek(
  rows: WeeklyGoalRow[],
  fulfillmentDate: string,
  batchLabel: string
): WeeklyGoalRow | null {
  return (
    findWeekSpecificGoalRow(rows, fulfillmentDate, batchLabel) ??
    findDefaultGoalRow(rows)
  )
}
