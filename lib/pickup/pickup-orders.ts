import type { AdminOrderRow } from "@/lib/google-sheets/orders"
import { isPaidOrder } from "@/lib/delivery/delivery-orders"

const CLOSED_PICKUP_STATUSES = new Set([
  "Delivered / Picked Up",
  "Delivered",
  "Complete",
  "Cancelled",
  "Refunded",
])

export function isPickupOrder(order: AdminOrderRow): boolean {
  return order.fulfillmentMethod.trim().toLowerCase() === "pickup"
}

export function isPaidPickupOrder(order: AdminOrderRow): boolean {
  return isPickupOrder(order) && isPaidOrder(order.paymentStatus)
}

export function isActivePickupStop(orderStatus: string): boolean {
  const status = orderStatus.trim()
  return !CLOSED_PICKUP_STATUSES.has(status)
}

export function isReadyForPickupStatus(orderStatus: string): boolean {
  const status = orderStatus.trim()
  return status === "Ready" || status === "Packed"
}
