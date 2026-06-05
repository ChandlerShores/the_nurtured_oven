import {
  getBakeryWeekGoalsFromEnv,
  goalsFromWeeklyGoalRow,
  type BakeryWeekGoals,
} from "@/lib/admin/bakery-goals"
import {
  findDefaultGoalRow,
  findWeekSpecificGoalRow,
  type WeeklyGoalRow,
} from "@/lib/google-sheets/weekly-goals-data"

export interface WeeklyGoalsContext {
  /** Targets used for progress bars (week → default → env). */
  effective: BakeryWeekGoals
  /** Values stored on this bake week's row only (may be empty). */
  weekTargets: BakeryWeekGoals
  /** Values on the `default` sheet row. */
  defaultBackup: BakeryWeekGoals
  hasWeekSpecificRow: boolean
  /** True when progress uses default (or env), not this week's row. */
  usingDefaultBackup: boolean
  weekRowUpdatedAt: string | null
  defaultRowUpdatedAt: string | null
}

function mergeField(
  weekVal: number | null,
  defaultVal: number | null,
  envVal: number | null
): number | null {
  if (weekVal != null && weekVal > 0) return weekVal
  if (defaultVal != null && defaultVal > 0) return defaultVal
  if (envVal != null && envVal > 0) return envVal
  return null
}

function buildEffectiveGoals(
  weekTargets: BakeryWeekGoals,
  defaultBackup: BakeryWeekGoals,
  env: BakeryWeekGoals
): BakeryWeekGoals {
  const revenueGoalCents = mergeField(
    weekTargets.revenueGoalCents,
    defaultBackup.revenueGoalCents,
    env.revenueGoalCents
  )
  const orderGoalCount = mergeField(
    weekTargets.orderGoalCount,
    defaultBackup.orderGoalCount,
    env.orderGoalCount
  )

  const weekHas =
    (weekTargets.revenueGoalCents ?? 0) > 0 ||
    (weekTargets.orderGoalCount ?? 0) > 0
  const defaultHas =
    (defaultBackup.revenueGoalCents ?? 0) > 0 ||
    (defaultBackup.orderGoalCount ?? 0) > 0

  let source: BakeryWeekGoals["source"] = "none"
  if (weekHas) source = "sheet"
  else if (defaultHas) source = "sheet"
  else if (
    (env.revenueGoalCents ?? 0) > 0 ||
    (env.orderGoalCount ?? 0) > 0
  ) {
    source = "env"
  }

  const notes = weekTargets.notes ?? defaultBackup.notes ?? env.notes

  return {
    revenueGoalCents,
    orderGoalCount,
    source,
    notes,
  }
}

export function resolveWeeklyGoalsContext(
  rows: WeeklyGoalRow[],
  fulfillmentDate: string,
  batchLabel: string
): WeeklyGoalsContext {
  const weekRow = findWeekSpecificGoalRow(rows, fulfillmentDate, batchLabel)
  const defaultRow = findDefaultGoalRow(rows)
  const weekTargets = goalsFromWeeklyGoalRow(weekRow)
  const defaultBackup = goalsFromWeeklyGoalRow(defaultRow)
  const env = getBakeryWeekGoalsFromEnv()
  const effective = buildEffectiveGoals(weekTargets, defaultBackup, env)

  const hasWeekSpecificRow =
    (weekTargets.revenueGoalCents ?? 0) > 0 ||
    (weekTargets.orderGoalCount ?? 0) > 0
  const defaultHasTargets =
    (defaultBackup.revenueGoalCents ?? 0) > 0 ||
    (defaultBackup.orderGoalCount ?? 0) > 0
  const usingDefaultBackup = !hasWeekSpecificRow && defaultHasTargets

  return {
    effective,
    weekTargets,
    defaultBackup,
    hasWeekSpecificRow,
    usingDefaultBackup,
    weekRowUpdatedAt: weekRow?.updatedAt ?? null,
    defaultRowUpdatedAt: defaultRow?.updatedAt ?? null,
  }
}
