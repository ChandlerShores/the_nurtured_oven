import { fulfillmentPolicy } from "@/lib/content/fulfillment"
import type { PaidOrderDetails } from "@/lib/order/paid-order-details"
import { formatBatchLabel } from "@/lib/order/weekly-fulfillment"
import { customerEmailSignature, ownerEmailFooter } from "@/lib/email/signature"

export function formatMoney(cents?: number): string {
  if (cents == null) return "See your Square receipt"
  return `$${(cents / 100).toFixed(2)}`
}

function formatLineItemsList(lineItems: PaidOrderDetails["lineItems"]): string {
  const menuItems = lineItems.filter((i) => i.type !== "delivery_fee")
  if (menuItems.length === 0) return "  (see your receipt for item details)"
  return menuItems.map((item) => `  • ${item.name} × ${item.quantity}`).join("\n")
}

export function resolveBatchLabel(details: PaidOrderDetails): string {
  if (details.batchLabel) return details.batchLabel
  if (details.fulfillmentDate) {
    const [y, m, d] = details.fulfillmentDate.split("-").map(Number)
    if (y && m && d) return formatBatchLabel(y, m, d)
  }
  return "this Friday"
}

export function formatDeliveryBlock(details: PaidOrderDetails): string | null {
  if (details.fulfillmentMethod !== "delivery") return null

  const parts: string[] = []
  if (details.deliveryCity) parts.push(details.deliveryCity)
  if (details.deliveryAddress) parts.push(details.deliveryAddress)

  if (parts.length === 0) return null
  return parts.join(", ")
}

export function formatOwnerPaidOrderSubject(details: PaidOrderDetails): string {
  const method =
    details.fulfillmentMethod === "delivery" ? "DELIVERY" : "PICKUP"
  const batch = resolveBatchLabel(details)
  const name =
    details.customerName?.trim() || details.customerEmail || "Customer"
  return `Paid weekly order — ${method} — ${batch} — ${name}`
}

export function formatCustomerPaidOrderSubject(
  details: PaidOrderDetails
): string {
  const batch = resolveBatchLabel(details)
  return `Your order is confirmed — ${batch}`
}

export function formatOwnerPaidOrderBody(details: PaidOrderDetails): string {
  const batch = resolveBatchLabel(details)
  const methodLabel =
    details.fulfillmentMethod === "delivery"
      ? fulfillmentPolicy.deliveryOptionLabel
      : fulfillmentPolicy.pickupOptionLabel
  const divider = "—".repeat(36)

  const lines: (string | null)[] = [
    `WEEKLY ORDER — ${batch.toUpperCase()}`,
    divider,
    "",
    details.internalRef ? `Reference: ${details.internalRef}` : null,
    `Fulfillment date: ${batch}`,
    `Pickup / delivery: ${methodLabel}`,
    "",
    "CUSTOMER",
    details.customerName ? `Name: ${details.customerName}` : null,
    details.customerEmail ? `Email: ${details.customerEmail}` : null,
    details.customerPhone ? `Phone: ${details.customerPhone}` : null,
    "",
    "ORDER",
    formatLineItemsList(details.lineItems),
    details.deliveryFeeCents
      ? `  • ${fulfillmentPolicy.deliveryLineItemName} (${formatMoney(details.deliveryFeeCents)})`
      : null,
  ]

  const deliveryBlock = formatDeliveryBlock(details)
  if (deliveryBlock) {
    lines.push("", `Delivery address: ${deliveryBlock}`)
  }

  lines.push(
    details.dietary?.trim()
      ? `\nDietary / allergies: ${details.dietary.trim()}`
      : null,
    details.message?.trim()
      ? `Customer message: ${details.message.trim()}`
      : null,
    "",
    `Total paid: ${formatMoney(details.amountCents)}`,
    details.receiptUrl ? `Receipt: ${details.receiptUrl}` : null,
    details.squareOrderId ? `Square order: ${details.squareOrderId}` : null,
    "",
    "Customer confirmation email sent.",
    ownerEmailFooter()
  )

  return lines.filter((l): l is string => l !== null).join("\n")
}

export function formatCustomerPaidOrderBody(
  details: PaidOrderDetails,
  replyToEmail: string
): string {
  const batch = resolveBatchLabel(details)
  const firstName =
    details.customerName?.trim().split(/\s+/)[0] || "there"
  const method =
    details.fulfillmentMethod === "delivery"
      ? "Friday delivery in Georgetown or Lexington"
      : "Friday pickup (free)"

  const lines: string[] = [
    `Hi ${firstName},`,
    "",
    `Thank you for your order. Payment was received and your spot for ${batch} is confirmed.`,
    "",
    "YOUR ORDER",
    formatLineItemsList(details.lineItems),
  ]

  if (details.deliveryFeeCents) {
    lines.push(`Delivery fee: ${formatMoney(details.deliveryFeeCents)}`)
  } else if (details.fulfillmentMethod === "delivery") {
    lines.push("Delivery: included with your order")
  }

  lines.push("", "FULFILLMENT", `When: ${batch}`, `How: ${method}`)

  if (details.fulfillmentMethod === "delivery") {
    const addr = formatDeliveryBlock(details)
    if (addr) lines.push(`Deliver to: ${addr}`)
    lines.push(
      "",
      "We deliver on Friday within our local window. Exact times are not guaranteed—we will be in touch if anything changes."
    )
  } else {
    lines.push(
      "",
      "We will follow up with pickup details closer to Friday."
    )
  }

  lines.push("", `Total paid: ${formatMoney(details.amountCents)}`)
  if (details.receiptUrl) lines.push(`Receipt: ${details.receiptUrl}`)
  lines.push(
    "",
    "Questions or need to change something? Reply to this email as soon as you can so we can help before bake day."
  )

  lines.push(
    customerEmailSignature(
      `Reply to this email (${replyToEmail}) and we will get back to you promptly.`
    )
  )

  return lines.join("\n")
}
