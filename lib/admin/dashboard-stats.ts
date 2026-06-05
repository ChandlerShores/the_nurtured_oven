import {
  isTerminalOrderStatus,
  normalizeOrderStatus,
  ORDER_STATUS_OPTIONS,
} from "@/lib/admin/order-status"
import { getOrderDisplayStatus } from "@/lib/admin/order-filters"
import type { OrderStatus } from "@/lib/admin/order-status"
import { parseMoneyToCents } from "@/lib/admin/money"
import {
  buildProductionList,
  totalBakeQuantity,
} from "@/lib/admin/production-aggregate"
import type { AdminOrderLineRow, AdminOrderRow } from "@/lib/google-sheets/orders"
import { formatPrepDayLabel } from "@/lib/admin/prep-deadline"

export type { ItemQuantity } from "@/lib/admin/production-aggregate"

const EXCLUDED_REVENUE_STATUSES = new Set(["Refunded", "Cancelled"])

function isPaidPayment(order: AdminOrderRow): boolean {
  const status = order.paymentStatus.trim().toLowerCase()
  return status === "paid" || status === "completed"
}

function countsForRevenue(order: AdminOrderRow): boolean {
  if (!isPaidPayment(order)) return false
  const status = order.orderStatus.trim()
  return !EXCLUDED_REVENUE_STATUSES.has(status)
}

export interface DashboardStats {
  batchLabel: string
  fulfillmentDate: string
  prepDayLabel: string
  totalOrders: number
  revenueDisplay: string
  itemsToBake: number
  pickupCount: number
  deliveryCount: number
  openCount: number
  statusCounts: Record<string, number>
  recentOrders: AdminOrderRow[]
  newOrders: number
  /** Paid delivery orders not yet Delivered / Picked Up. */
  deliveriesNotDelivered: number
  readyPickupCount: number
  readyDeliveryCount: number
  missingAddressCount: number
  unpaidCount: number
  issueCount: number
  revenueCents: number
  paidOrderCount: number
}

function formatRevenue(cents: number): string {
  if (cents <= 0) return "$0"
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

function prepDayFromFulfillmentDate(fulfillmentDate: string): string {
  return formatPrepDayLabel(fulfillmentDate)
}

export function buildDashboardStats(
  orders: AdminOrderRow[],
  batchLabel: string,
  fulfillmentDate: string,
  lineItems: AdminOrderLineRow[] = []
): DashboardStats {
  let revenueCents = 0
  let pickupCount = 0
  let deliveryCount = 0
  let openCount = 0
  let newOrders = 0
  let deliveriesNotDelivered = 0
  let readyPickupCount = 0
  let readyDeliveryCount = 0
  let missingAddressCount = 0
  let unpaidCount = 0
  let issueCount = 0
  let paidOrderCount = 0
  const statusCounts: Record<string, number> = {}

  for (const status of ORDER_STATUS_OPTIONS) {
    statusCounts[status] = 0
  }

  for (const order of orders) {
    if (countsForRevenue(order)) {
      revenueCents += parseMoneyToCents(order.amount)
      paidOrderCount += 1
    }

    const method = order.fulfillmentMethod.trim().toLowerCase()
    if (method === "pickup") pickupCount += 1
    else if (method === "delivery") {
      deliveryCount += 1
      if (!order.deliveryAddress.trim() || !order.deliveryZip.trim()) {
        missingAddressCount += 1
      }
    }

    const status = normalizeOrderStatus(order.orderStatus)
    statusCounts[status] = (statusCounts[status] ?? 0) + 1
    if (!isTerminalOrderStatus(status)) openCount += 1
    if (status === "New") newOrders += 1
    if (status === "Issue") issueCount += 1
    if (method === "pickup" && status === "Ready") readyPickupCount += 1
    if (method === "delivery") {
      if (status === "Ready") readyDeliveryCount += 1
      if (!isTerminalOrderStatus(status)) deliveriesNotDelivered += 1
    }
    if (!isPaidPayment(order)) unpaidCount += 1
  }

  const itemsToBake = totalBakeQuantity(buildProductionList(orders, lineItems))

  const recentOrders = [...orders]
    .sort((a, b) => (b.orderedAt ?? "").localeCompare(a.orderedAt ?? ""))
    .slice(0, 5)

  return {
    batchLabel,
    fulfillmentDate,
    prepDayLabel: prepDayFromFulfillmentDate(fulfillmentDate),
    totalOrders: orders.length,
    revenueDisplay: formatRevenue(revenueCents),
    itemsToBake,
    pickupCount,
    deliveryCount,
    openCount,
    statusCounts,
    recentOrders,
    newOrders,
    deliveriesNotDelivered,
    readyPickupCount,
    readyDeliveryCount,
    missingAddressCount,
    unpaidCount,
    issueCount,
    revenueCents,
    paidOrderCount,
  }
}

export function getOrderStatusForDisplay(
  order: AdminOrderRow,
  statusByRef?: Record<string, OrderStatus>
): string {
  if (statusByRef) {
    return getOrderDisplayStatus(order, statusByRef)
  }
  return order.orderStatus.trim() || "New"
}

export function formatPaymentLabel(paymentStatus: string): string {
  const v = paymentStatus.trim().toLowerCase()
  if (!v) return "Paid"
  if (v === "completed" || v === "paid") return "Paid"
  return paymentStatus.trim()
}
