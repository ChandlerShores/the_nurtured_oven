import "server-only"

import type { BakeryWeekGoals } from "@/lib/admin/bakery-goals"
import { resolveWeeklyGoalsContext } from "@/lib/admin/weekly-goals-context"
import type { WeeklyGoalsContext } from "@/lib/admin/weekly-goals-context"
import { fetchAllWeeklyGoalsFromSheet } from "@/lib/google-sheets/weekly-goals"

export async function loadWeeklyGoalsContext(
  fulfillmentDate: string,
  batchLabel: string
): Promise<WeeklyGoalsContext> {
  const rows = await fetchAllWeeklyGoalsFromSheet()
  return resolveWeeklyGoalsContext(rows, fulfillmentDate, batchLabel)
}

export async function loadBakeryWeekGoalsForWeek(
  fulfillmentDate: string,
  batchLabel: string
): Promise<BakeryWeekGoals> {
  const ctx = await loadWeeklyGoalsContext(fulfillmentDate, batchLabel)
  return ctx.effective
}
