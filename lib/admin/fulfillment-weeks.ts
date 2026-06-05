import type { FulfillmentWeekOption } from "@/lib/admin/financial-stats-types"
import {
  fulfillmentWeekKeysMatch,
  matchesFulfillmentWeek,
  weekMetaFromLabel,
} from "@/lib/admin/fulfillment-label-match"
import type { AdminOrderLineRow, AdminOrderRow } from "@/lib/google-sheets/orders"
import {
  addCalendarDays,
  formatYmd,
  getEasternYmdHm,
  getFulfillmentFridayYmd,
  getWeeklyFulfillmentContext,
} from "@/lib/order/weekly-fulfillment"

export {
  fulfillmentDateFromWeekKey,
  fulfillmentWeekKeysMatch,
  isViewingPriorBakeWeek,
  weekMetaFromLabel,
} from "@/lib/admin/fulfillment-label-match"

export function orderInFulfillmentWeek(
  fulfillmentLabel: string,
  week: FulfillmentWeekOption
): boolean {
  const label = fulfillmentLabel.trim()
  if (!label) return false
  if (label === week.weekKey) return true
  return matchesFulfillmentWeek(
    label,
    week.fulfillmentDate,
    week.batchLabel
  )
}

export function listFulfillmentWeekOptions(
  orders: AdminOrderRow[],
  options?: { includeOrder?: (order: AdminOrderRow) => boolean }
): FulfillmentWeekOption[] {
  const include = options?.includeOrder ?? (() => true)
  const map = new Map<string, FulfillmentWeekOption>()

  for (const order of orders) {
    if (!include(order)) continue
    const weekKey = order.fulfillmentLabel.trim()
    if (!weekKey) continue

    const { fulfillmentDate, batchLabel } = weekMetaFromLabel(weekKey)
    const existing = map.get(weekKey)
    if (existing) {
      existing.paidOrderCount += 1
    } else {
      map.set(weekKey, {
        weekKey,
        fulfillmentDate,
        batchLabel,
        paidOrderCount: 1,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    b.weekKey.localeCompare(a.weekKey)
  )
}

export function resolveSelectedFulfillmentWeek(
  weekOptions: FulfillmentWeekOption[],
  weekKey?: string,
  now?: Date
): FulfillmentWeekOption {
  const ctx = getWeeklyFulfillmentContext(now)
  const operationalDate = operationalFulfillmentWeekKey(now)
  const trimmed = weekKey?.trim()

  if (trimmed) {
    const match = weekOptions.find((w) => w.weekKey === trimmed)
    if (match) return match
  }

  const operationalMatch = weekOptions.find(
    (w) =>
      fulfillmentWeekKeysMatch(w.weekKey, operationalDate) ||
      matchesFulfillmentWeek(w.weekKey, ctx.fulfillmentDate, ctx.batchLabel)
  )

  return (
    operationalMatch ??
    weekOptions[0] ?? {
      weekKey: operationalDate,
      fulfillmentDate: operationalDate,
      batchLabel: ctx.batchLabel,
      paidOrderCount: 0,
    }
  )
}

export function filterOrdersForWeek(
  orders: AdminOrderRow[],
  week: FulfillmentWeekOption
): AdminOrderRow[] {
  return orders.filter((order) =>
    orderInFulfillmentWeek(order.fulfillmentLabel, week)
  )
}

export function filterLineItemsForWeek(
  lineItems: AdminOrderLineRow[],
  week: FulfillmentWeekOption
): AdminOrderLineRow[] {
  return lineItems.filter((line) =>
    orderInFulfillmentWeek(line.fulfillmentLabel, week)
  )
}

/**

 * Live bake week for admin (orders / pickup).
 * Saturday is wrap-up for the Friday that just finished; the next cycle starts Sunday.
 */
export function operationalFulfillmentWeekKey(now: Date = new Date()): string {
  const eastern = getEasternYmdHm(now)
  const upcoming = getFulfillmentFridayYmd(now)

  if (eastern.weekday === 6) {
    const prev = addCalendarDays(
      upcoming.year,
      upcoming.month,
      upcoming.day,
      -7
    )
    return formatYmd(prev.year, prev.month, prev.day)
  }

  return formatYmd(upcoming.year, upcoming.month, upcoming.day)
}

/** @deprecated Use operationalFulfillmentWeekKey — kept as alias for callers. */
export function currentFulfillmentWeekKey(now?: Date): string {
  return operationalFulfillmentWeekKey(now)
}

