import { formatCentsDisplay } from "@/lib/admin/money"
import { resolveWeeklyGoalsContext } from "@/lib/admin/weekly-goals-context"
import type { WeeklyGoalRow } from "@/lib/google-sheets/weekly-goals-data"

export type { WeeklyGoalsContext } from "@/lib/admin/weekly-goals-context"

export interface BakeryWeekGoals {
  revenueGoalCents: number | null
  orderGoalCount: number | null
  source: "sheet" | "env" | "none"
  notes: string | null
}

export interface WeekGoalProgress {
  goals: BakeryWeekGoals
  revenueCents: number
  paidOrderCount: number
  revenuePercent: number | null
  orderPercent: number | null
  revenueDisplay: string
  revenueGoalDisplay: string | null
  orderGoalLabel: string | null
}

function parsePositiveInt(raw: string | undefined): number | null {
  const trimmed = raw?.trim()
  if (!trimmed) return null
  const n = Number.parseInt(trimmed, 10)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

export function getBakeryWeekGoalsFromEnv(): BakeryWeekGoals {
  const revenueGoalCents = parsePositiveInt(
    process.env.WEEKLY_REVENUE_GOAL_CENTS
  )
  const orderGoalCount = parsePositiveInt(process.env.WEEKLY_ORDER_GOAL_COUNT)
  const hasGoals = Boolean(revenueGoalCents || orderGoalCount)
  return {
    revenueGoalCents,
    orderGoalCount,
    source: hasGoals ? "env" : "none",
    notes: null,
  }
}

export function goalsFromWeeklyGoalRow(row: WeeklyGoalRow | null): BakeryWeekGoals {
  if (!row) {
    return {
      revenueGoalCents: null,
      orderGoalCount: null,
      source: "none",
      notes: null,
    }
  }
  const hasGoals = Boolean(row.revenueGoalCents || row.orderGoalCount)
  return {
    revenueGoalCents: row.revenueGoalCents,
    orderGoalCount: row.orderGoalCount,
    source: hasGoals ? "sheet" : "none",
    notes: row.notes.trim() || null,
  }
}

/** Sheet row wins per field; env fills gaps. */
export function mergeBakeryWeekGoals(
  sheet: BakeryWeekGoals,
  env: BakeryWeekGoals
): BakeryWeekGoals {
  const revenueGoalCents = sheet.revenueGoalCents ?? env.revenueGoalCents
  const orderGoalCount = sheet.orderGoalCount ?? env.orderGoalCount
  let source: BakeryWeekGoals["source"] = "none"
  if (sheet.revenueGoalCents != null || sheet.orderGoalCount != null) {
    source = "sheet"
  } else if (env.revenueGoalCents != null || env.orderGoalCount != null) {
    source = "env"
  }
  return {
    revenueGoalCents,
    orderGoalCount,
    source,
    notes: sheet.notes ?? env.notes,
  }
}

export function resolveBakeryWeekGoalsFromRows(
  rows: WeeklyGoalRow[],
  fulfillmentDate: string,
  batchLabel: string
): BakeryWeekGoals {
  return resolveWeeklyGoalsContext(rows, fulfillmentDate, batchLabel).effective
}

/** @deprecated Use loadBakeryWeekGoalsForWeek from load-bakery-week-goals — env-only fallback for tests. */
export function getBakeryWeekGoals(): BakeryWeekGoals {
  return getBakeryWeekGoalsFromEnv()
}

export function buildWeekGoalProgress(
  revenueCents: number,
  paidOrderCount: number,
  goals: BakeryWeekGoals
): WeekGoalProgress | null {
  if (!goals.revenueGoalCents && !goals.orderGoalCount) {
    return null
  }

  const revenuePercent =
    goals.revenueGoalCents && goals.revenueGoalCents > 0
      ? Math.round((revenueCents / goals.revenueGoalCents) * 100)
      : null

  const orderPercent =
    goals.orderGoalCount && goals.orderGoalCount > 0
      ? Math.round((paidOrderCount / goals.orderGoalCount) * 100)
      : null

  return {
    goals,
    revenueCents,
    paidOrderCount,
    revenuePercent,
    orderPercent,
    revenueDisplay: formatCentsDisplay(revenueCents),
    revenueGoalDisplay: goals.revenueGoalCents
      ? formatCentsDisplay(goals.revenueGoalCents)
      : null,
    orderGoalLabel: goals.orderGoalCount
      ? String(goals.orderGoalCount)
      : null,
  }
}
