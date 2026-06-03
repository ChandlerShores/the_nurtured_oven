import { ORDER_STATUS_OPTIONS } from "@/lib/admin/order-status"
import { getOrderDisplayStatus } from "@/lib/admin/order-filters"
import type { OrderStatus } from "@/lib/admin/order-status"
import {
  buildProductionList,
  totalBakeQuantity,
  type ItemQuantity,
} from "@/lib/admin/production-aggregate"
import type { AdminOrderLineRow, AdminOrderRow } from "@/lib/google-sheets/orders"
import { formatBatchLabel } from "@/lib/order/weekly-fulfillment"

export type { ItemQuantity } from "@/lib/admin/production-aggregate"

const CLOSED_STATUSES = new Set(["Complete", "Delivered", "Refunded"])

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
}

function parseAmountCents(amount: string): number {
  const cleaned = amount.replace(/[$,\s]/g, "").trim()
  if (!cleaned) return 0
  const n = Number(cleaned)
  if (!Number.isFinite(n)) return 0
  if (cleaned.includes(".") || n < 500) return Math.round(n * 100)
  return Math.round(n)
}

function formatRevenue(cents: number): string {
  if (cents <= 0) return "$0"
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

function prepDayFromFulfillmentDate(fulfillmentDate: string): string {
  const parts = fulfillmentDate.split("-").map(Number)
  if (parts.length !== 3) return "Wednesday before fulfillment"
  const [year, month, day] = parts
  const wed = new Date(Date.UTC(year, month - 1, day - 2, 12, 0, 0))
  const wMonth = wed.getUTCMonth() + 1
  const wDay = wed.getUTCDate()
  return `Prep by ${formatBatchLabel(wed.getUTCFullYear(), wMonth, wDay).replace("Friday ", "Wednesday ")} noon`
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
  const statusCounts: Record<string, number> = {}

  for (const status of ORDER_STATUS_OPTIONS) {
    statusCounts[status] = 0
  }

  for (const order of orders) {
    revenueCents += parseAmountCents(order.amount)

    const method = order.fulfillmentMethod.trim().toLowerCase()
    if (method === "pickup") pickupCount += 1
    else if (method === "delivery") deliveryCount += 1

    const status = order.orderStatus.trim() || "New"
    statusCounts[status] = (statusCounts[status] ?? 0) + 1
    if (!CLOSED_STATUSES.has(status)) openCount += 1
  }

  const productionList = buildProductionList(orders, lineItems)
  const itemsToBake = totalBakeQuantity(productionList)
  const topItems = productionList.slice(0, 6)

  const recentOrders = [...orders]
    .sort((a, b) => (b.orderedAt ?? "").localeCompare(a.orderedAt ?? ""))
    .slice(0, 8)

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
