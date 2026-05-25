/**
 * Pickup & delivery policy - single source for customer-facing copy.
 */

export const deliveryCities = ["Georgetown", "Lexington"] as const
export type DeliveryCity = (typeof deliveryCities)[number]

export function isDeliveryCity(value: string): value is DeliveryCity {
  return (deliveryCities as readonly string[]).includes(value)
}

/** Owner-facing line for emails and Square payment notes */
export function formatDeliveryLine(
  city?: string,
  street?: string
): string | null {
  const c = city?.trim()
  const s = street?.trim()
  if (c && s) return `${c}, ${s}`
  if (c) return c
  if (s) return s
  return null
}

export const fulfillmentPolicy = {
  /** Local Friday delivery fee (cents) */
  deliveryFeeCents: 700,
  /** Subtotal at or above this (cents) waives delivery fee */
  freeDeliveryMinimumCents: 4000,
  deliveryLineItemName: "Friday delivery (Georgetown or Lexington)",

  customerFacingBullets: [
    "Free Friday pickup",
    "Georgetown & Lexington delivery: $7 (free on orders $40+)",
    "Friday delivery window; exact times not guaranteed",
  ] as const,

  /** One-line summary for menu hero / footer */
  menuFulfillmentLine:
    "Friday pickup (free) or local delivery in Georgetown & Lexington ($7, free on orders $40+)",

  orderByLine:
    "Order by Wednesday at noon for Friday pickup or local delivery in Georgetown & Lexington.",

  pickupOptionLabel: "Friday pickup (free)",
  deliveryOptionLabel: "Friday delivery (Georgetown or Lexington)",
  deliveryCityLabel: "Delivery city",
  deliveryStreetPlaceholder: "Street address, apt, suite, etc.",
} as const
