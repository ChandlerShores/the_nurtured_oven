import { isTerminalOrderStatus } from "@/lib/admin/order-status"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"
import { isPaidOrder } from "@/lib/delivery/delivery-orders"

export function isPickupOrder(order: AdminOrderRow): boolean {
  return order.fulfillmentMethod.trim().toLowerCase() === "pickup"
}

export function isPaidPickupOrder(order: AdminOrderRow): boolean {
  return isPickupOrder(order) && isPaidOrder(order.paymentStatus)
}

export function isActivePickupStop(orderStatus: string): boolean {
  return !isTerminalOrderStatus(orderStatus)
}

export function isReadyForPickupStatus(orderStatus: string): boolean {
  return orderStatus.trim() === "Ready"
}
