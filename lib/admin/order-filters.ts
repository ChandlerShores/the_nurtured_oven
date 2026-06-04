import {
  ORDER_STATUS_OPTIONS,
  type OrderStatus,
} from "@/lib/admin/order-status"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"

export interface AdminOrderSlicerFilters {
  status: Set<string>
  fulfillment: Set<string>
}

export type OrderSlicerDimension = "status" | "fulfillment"

export interface OrderSlicerOption {
  value: string
  label: string
  count: number
}

export function adminOrderKey(order: AdminOrderRow): string {
  return order.internalRef || `row-${order.sheetRow}`
}

export function getOrderDisplayStatus(
  order: AdminOrderRow,
  statusByRef: Record<string, OrderStatus>
): string {
  const status =
    statusByRef[adminOrderKey(order)] ??
    (order.orderStatus.trim() || "New")
  return status
}

export function orderPassesFilters(
  order: AdminOrderRow,
  filters: AdminOrderSlicerFilters,
  statusByRef: Record<string, OrderStatus>,
  except?: OrderSlicerDimension
): boolean {
  if (except !== "status" && filters.status.size > 0) {
    const status = getOrderDisplayStatus(order, statusByRef)
    if (!filters.status.has(status)) return false
  }

  if (except !== "fulfillment" && filters.fulfillment.size > 0) {
    const method = order.fulfillmentMethod.trim().toLowerCase()
    if (!filters.fulfillment.has(method)) return false
  }

  return true
}

function statusSortIndex(status: string): number {
  const idx = (ORDER_STATUS_OPTIONS as readonly string[]).indexOf(status)
  return idx === -1 ? ORDER_STATUS_OPTIONS.length : idx
}

function countByKey(
  orders: AdminOrderRow[],
  keyFn: (order: AdminOrderRow) => string
): Map<string, number> {
  const counts = new Map<string, number>()
  for (const order of orders) {
    const key = keyFn(order)
    if (!key) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

export function buildStatusSlicerOptions(
  orders: AdminOrderRow[],
  statusByRef: Record<string, OrderStatus>
): OrderSlicerOption[] {
  const counts = countByKey(orders, (o) =>
    getOrderDisplayStatus(o, statusByRef)
  )
  return Array.from(counts.entries())
    .sort(([a], [b]) => statusSortIndex(a) - statusSortIndex(b))
    .map(([value, count]) => ({ value, label: value, count }))
}

export function formatFulfillmentLabel(method: string): string {
  if (method === "delivery") return "Delivery"
  if (method === "pickup") return "Pickup"
  return method
}

export function buildFulfillmentSlicerOptions(
  orders: AdminOrderRow[]
): OrderSlicerOption[] {
  const counts = countByKey(orders, (o) =>
    o.fulfillmentMethod.trim().toLowerCase()
  )
  return Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([value, count]) => ({
      value,
      label: formatFulfillmentLabel(value),
      count,
    }))
}

export function pruneSlicerFilters(
  filters: AdminOrderSlicerFilters,
  statusOptions: OrderSlicerOption[],
  fulfillmentOptions: OrderSlicerOption[]
): AdminOrderSlicerFilters {
  const statusValues = new Set(statusOptions.map((o) => o.value))
  const fulfillmentValues = new Set(fulfillmentOptions.map((o) => o.value))

  const status = new Set(
    Array.from(filters.status).filter((v) => statusValues.has(v))
  )
  const fulfillment = new Set(
    Array.from(filters.fulfillment).filter((v) => fulfillmentValues.has(v))
  )

  return { status, fulfillment }
}

export function slicerFiltersChanged(
  a: AdminOrderSlicerFilters,
  b: AdminOrderSlicerFilters
): boolean {
  if (a.status.size !== b.status.size || a.fulfillment.size !== b.fulfillment.size) {
    return true
  }
  for (const v of Array.from(a.status)) {
    if (!b.status.has(v)) return true
  }
  for (const v of Array.from(a.fulfillment)) {
    if (!b.fulfillment.has(v)) return true
  }
  return false
}

/** Hide slicer when there is nothing meaningful to choose (0–1 distinct values). */
export function shouldShowSlicerGroup(
  options: OrderSlicerOption[],
  selected: Set<string>
): boolean {
  if (options.length > 1) return true
  return selected.size > 0
}
