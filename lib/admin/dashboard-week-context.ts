import type { WeekGoalProgress } from "@/lib/admin/bakery-goals"
import type { DashboardStats } from "@/lib/admin/dashboard-stats"
import { formatPrepDeadlineDisplay } from "@/lib/admin/prep-deadline"
import {
  getFulfillmentDayPhase,
  getPrepUrgency,
} from "@/lib/admin/prep-deadline"

export type DashboardWeekPhase =
  | "ordering_open"
  | "prep_soon"
  | "prep_day"
  | "after_prep"
  | "bake_day"
  | "after_bake"

export interface DashboardWeekContextOptions {
  orderingClosesIn?: string | null
  now?: Date
}

export interface DashboardWeekContext {
  phase: DashboardWeekPhase
  /** Shown under the bake-week title in the page header. */
  phaseDescription: string
  /** One scannable line of counts; omitted when there are no orders yet. */
  numbersLine: string | null
}

function resolvePhase(
  stats: DashboardStats,
  orderingClosesIn: string | null | undefined,
  now: Date
): DashboardWeekPhase {
  if (orderingClosesIn) return "ordering_open"

  const fulfillment = getFulfillmentDayPhase(stats.fulfillmentDate, now)
  if (fulfillment === "after") return "after_bake"
  if (fulfillment === "today") return "bake_day"

  const prep = getPrepUrgency(stats.fulfillmentDate, now)
  if (prep === "today") return "prep_day"
  if (prep === "soon") return "prep_soon"
  if (prep === "passed") return "after_prep"
  return "after_prep"
}

function buildPhaseDescription(
  stats: DashboardStats,
  phase: DashboardWeekPhase,
  orderingClosesIn: string | null | undefined,
  now: Date
): string {
  const prep = formatPrepDeadlineDisplay(stats.fulfillmentDate, now)

  switch (phase) {
    case "ordering_open":
      return `Customers can order until Wednesday at noon Eastern (${orderingClosesIn} left)`
    case "prep_soon":
      return `${prep.headline} · ${stats.batchLabel} bake`
    case "prep_day":
      return `${prep.headline} · finalize the bake list for ${stats.batchLabel}`
    case "after_prep":
      return `Ordering is closed · ${stats.batchLabel} bake`
    case "bake_day":
      return `Bake and fulfill ${stats.batchLabel}`
    case "after_bake":
      return `${stats.batchLabel} bake week is complete`
  }
}

function buildNumbersLine(stats: DashboardStats, phase: DashboardWeekPhase): string | null {
  if (stats.totalOrders === 0) return null

  const parts: string[] = [
    `${stats.totalOrders} ${stats.totalOrders === 1 ? "order" : "orders"}`,
    stats.revenueDisplay,
  ]

  if (phase !== "ordering_open" && stats.itemsToBake > 0) {
    parts.push(
      `${stats.itemsToBake} ${stats.itemsToBake === 1 ? "item" : "items"} to bake`
    )
  }

  if (stats.pickupCount > 0 || stats.deliveryCount > 0) {
    const mix: string[] = []
    if (stats.pickupCount > 0) {
      mix.push(`${stats.pickupCount} pickup${stats.pickupCount === 1 ? "" : "s"}`)
    }
    if (stats.deliveryCount > 0) {
      mix.push(
        `${stats.deliveryCount} deliver${stats.deliveryCount === 1 ? "y" : "ies"}`
      )
    }
    parts.push(mix.join(", "))
  }

  return parts.join(" · ")
}

export function buildDashboardWeekContext(
  stats: DashboardStats,
  options: DashboardWeekContextOptions = {}
): DashboardWeekContext {
  const now = options.now ?? new Date()
  const phase = resolvePhase(stats, options.orderingClosesIn, now)

  return {
    phase,
    phaseDescription: buildPhaseDescription(
      stats,
      phase,
      options.orderingClosesIn,
      now
    ),
    numbersLine: buildNumbersLine(stats, phase),
  }
}

export function weekGoalsConfigured(progress: WeekGoalProgress | null): boolean {
  if (!progress) return false
  return (
    progress.goals.revenueGoalCents != null ||
    progress.goals.orderGoalCount != null
  )
}
