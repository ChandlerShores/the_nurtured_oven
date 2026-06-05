import { isTerminalOrderStatus } from "@/lib/admin/order-status"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"
import { hasDeliveryStreetAddress } from "@/lib/delivery/address"

export function isPaidOrder(paymentStatus: string): boolean {
  const status = paymentStatus.trim().toLowerCase()
  return status === "paid" || status === "completed"
}

export function isActiveDeliveryStop(orderStatus: string): boolean {
  return !isTerminalOrderStatus(orderStatus)
}

export function isDeliveryOrder(order: AdminOrderRow): boolean {
  return order.fulfillmentMethod.trim().toLowerCase() === "delivery"
}

export function isPaidDeliveryOrder(order: AdminOrderRow): boolean {
  return isDeliveryOrder(order) && isPaidOrder(order.paymentStatus)
}

export function isRoutablePaidDeliveryOrder(order: AdminOrderRow): boolean {
  return (
    isPaidDeliveryOrder(order) &&
    isActiveDeliveryStop(order.orderStatus) &&
    hasDeliveryStreetAddress(order.deliveryAddress) &&
    Boolean(order.deliveryZip.trim())
  )
}
