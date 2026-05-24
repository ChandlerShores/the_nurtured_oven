/**
 * Pickup & delivery policy — single source for customer-facing copy.
 */
export const fulfillmentPolicy = {
  /** Local Friday delivery fee (cents) */
  deliveryFeeCents: 700,
  /** Subtotal at or above this (cents) waives delivery fee */
  freeDeliveryMinimumCents: 4000,
  deliveryLineItemName: "Friday delivery (Georgetown or Lexington)",

  customerFacing:
    "Pickup is free. Local Friday delivery is available in Georgetown and Lexington for $7, or free on orders of $40+. Deliveries are made during a set Friday delivery window, so exact delivery times are not guaranteed.",

  /** One-line summary for menu hero / footer */
  menuFulfillmentLine:
    "Friday pickup (free) or local delivery in Georgetown & Lexington ($7, free on orders $40+)",

  orderByLine:
    "Order by Wednesday at noon for Friday pickup or local delivery in Georgetown & Lexington.",

  pickupOptionLabel: "Friday pickup (free)",
  deliveryOptionLabel: "Friday delivery — Georgetown or Lexington",
  deliveryAddressPlaceholder: "Street address — Georgetown or Lexington",

  /** Appended to Square payment notes for owner reference */
  squareNote:
    "Policy: pickup free; Georgetown/Lexington delivery $7 or free $40+; Friday delivery window; exact times not guaranteed.",
} as const
