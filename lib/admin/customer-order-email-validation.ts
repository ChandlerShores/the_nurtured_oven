import type { AdminOrderRow } from "@/lib/google-sheets/orders"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isPaidOrder(order: AdminOrderRow): boolean {
  const status = order.paymentStatus.trim().toLowerCase()
  return status === "paid" || status === "completed"
}

export function validateOrderForCustomerEmail(order: AdminOrderRow): string | null {
  if (!order.internalRef.trim()) {
    return "Order is missing an internal reference."
  }
  const email = order.customerEmail.trim()
  if (!email || !EMAIL_RE.test(email)) {
    return "This order does not have a valid customer email."
  }
  if (!isPaidOrder(order)) {
    return "Customer updates can only be sent for paid orders."
  }
  return null
}
