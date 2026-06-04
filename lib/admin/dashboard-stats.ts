import { ORDER_STATUS_OPTIONS } from "@/lib/admin/order-status"
import { getOrderDisplayStatus } from "@/lib/admin/order-filters"
import type { OrderStatus } from "@/lib/admin/order-status"
import { parseMoneyToCents } from "@/lib/admin/money"
import {
  buildProductionList,
  totalBakeQuantity,
  type ItemQuantity,
} from "@/lib/admin/production-aggregate"
import type { AdminOrderLineRow, AdminOrderRow } from "@/lib/google-sheets/orders"
import { formatPrepDayLabel } from "@/lib/admin/prep-deadline"

export type { ItemQuantity } from "@/lib/admin/production-aggregate"

const CLOSED_STATUSES = new Set([
  "Complete",
  "Delivered / Picked Up",
  "Delivered",
  "Refunded",
  "Cancelled",
])

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

export interface CustomerDietaryNote {
  customerName: string
  note: string
  fulfillmentMethod: "pickup" | "delivery" | "other"
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
  topItems: ItemQuantity[]
  productionList: ItemQuantity[]
  recentOrders: AdminOrderRow[]
  newOrders: number
  deliveriesStillOut: number
  missingAddressCount: number
  unpaidCount: number
  customerDietaryNotes: CustomerDietaryNote[]
}

function formatRevenue(cents: number): string {
  if (cents <= 0) return "$0"
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

function prepDayFromFulfillmentDate(fulfillmentDate: string): string {
  return formatPrepDayLabel(fulfillmentDate)
}

function normalizeFulfillmentMethod(
  method: string
): CustomerDietaryNote["fulfillmentMethod"] {
  const value = method.trim().toLowerCase()
  if (value === "pickup") return "pickup"
  if (value === "delivery") return "delivery"
  return "other"
}

export function buildCustomerDietaryNotes(
  orders: AdminOrderRow[]
): CustomerDietaryNote[] {
  return orders
    .filter((order) => isPaidPayment(order) && order.dietary.trim())
    .map((order) => ({
      customerName:
        order.customerName.trim() ||
        order.customerEmail.trim() ||
        "Customer",
      note: order.dietary.trim(),
      fulfillmentMethod: normalizeFulfillmentMethod(order.fulfillmentMethod),
    }))
    .sort((a, b) => a.customerName.localeCompare(b.customerName))
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
  let deliveriesStillOut = 0
  let missingAddressCount = 0
  let unpaidCount = 0
  const statusCounts: Record<string, number> = {}

  for (const status of ORDER_STATUS_OPTIONS) {
    statusCounts[status] = 0
  }

  for (const order of orders) {
    if (countsForRevenue(order)) {
      revenueCents += parseMoneyToCents(order.amount)
    }

    const method = order.fulfillmentMethod.trim().toLowerCase()
    if (method === "pickup") pickupCount += 1
    else if (method === "delivery") {
      deliveryCount += 1
      if (!order.deliveryAddress.trim() || !order.deliveryZip.trim()) {
        missingAddressCount += 1
      }
    }

    const status = order.orderStatus.trim() || "New"
    statusCounts[status] = (statusCounts[status] ?? 0) + 1
    if (!CLOSED_STATUSES.has(status)) openCount += 1
    if (status === "New") newOrders += 1
    if (
      method === "delivery" &&
      status !== "Delivered / Picked Up" &&
      status !== "Delivered" &&
      status !== "Complete"
    ) {
      deliveriesStillOut += 1
    }
    if (!isPaidPayment(order)) unpaidCount += 1
  }

  const productionList = buildProductionList(orders, lineItems)
  const itemsToBake = totalBakeQuantity(productionList)
  const topItems = productionList.slice(0, 6)

  const recentOrders = [...orders]
    .sort((a, b) => (b.orderedAt ?? "").localeCompare(a.orderedAt ?? ""))
    .slice(0, 8)

  const customerDietaryNotes = buildCustomerDietaryNotes(orders)

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
    topItems,
    productionList,
    recentOrders,
    newOrders,
    deliveriesStillOut,
    missingAddressCount,
    unpaidCount,
    customerDietaryNotes,
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
