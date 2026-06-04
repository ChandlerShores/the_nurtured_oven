import type { FulfillmentWeekOption } from "@/lib/admin/financial-stats-types"
import {
  matchesFulfillmentWeek,
  type AdminOrderLineRow,
  type AdminOrderRow,
} from "@/lib/google-sheets/orders"
import {
  formatBatchLabel,
  getWeeklyFulfillmentContext,
} from "@/lib/order/weekly-fulfillment"

export function weekMetaFromLabel(label: string): {
  fulfillmentDate: string
  batchLabel: string
} {
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    const parts = label.split("-").map(Number)
    return {
      fulfillmentDate: label,
      batchLabel: formatBatchLabel(parts[0], parts[1], parts[2]),
    }
  }
  return { fulfillmentDate: label, batchLabel: label }
}

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
  weekKey?: string
): FulfillmentWeekOption {
  const ctx = getWeeklyFulfillmentContext()
  const trimmed = weekKey?.trim()

  if (trimmed) {
    const match = weekOptions.find((w) => w.weekKey === trimmed)
    if (match) return match
  }

  return (
    weekOptions.find((w) =>
      matchesFulfillmentWeek(w.weekKey, ctx.fulfillmentDate, ctx.batchLabel)
    ) ??
    weekOptions[0] ?? {
      weekKey: ctx.fulfillmentDate,
      fulfillmentDate: ctx.fulfillmentDate,
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

export function currentFulfillmentWeekKey(): string {
  const ctx = getWeeklyFulfillmentContext()
  return ctx.fulfillmentDate
}
