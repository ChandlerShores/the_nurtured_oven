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
  street?: string,
  zip?: string
): string | null {
  const c = city?.trim()
  const s = street?.trim()
  const z = zip?.trim()
  if (c && s && z) return `${c}, ${s}, ${z}`
  if (c && s) return `${c}, ${s}`
  if (c) return c
  if (s) return s
  return null
}

export const fulfillmentPolicy = {
  /** Standard Lexington delivery fee (cents). Extended areas and Georgetown differ. */
  deliveryFeeCents: 700,
  /** Standard Lexington free delivery threshold (cents). */
  freeDeliveryMinimumCents: 4000,
  /** Georgetown + extended Lexington free delivery threshold (cents). */
  premiumFreeDeliveryMinimumCents: 5500,
  deliveryLineItemName: "Friday delivery (Georgetown or Lexington)",

  customerFacingBullets: [
    "Free Friday pickup",
    "Local delivery in Georgetown & Lexington — your fee appears at checkout once you enter your zip",
    "Most Lexington orders start at $7; larger orders often qualify for free delivery",
    "Friday delivery window; exact times not guaranteed",
  ] as const,

  /** Warm helper under delivery fields on the order form */
  deliveryCheckoutHint:
    "Delivery fee depends on your address. Choose your city, enter your zip, and we'll show your exact fee in the cart before you pay.",

  /** One-line summary for menu hero / footer */
  menuFulfillmentLine:
    "Friday pickup (free) or local delivery in Georgetown & Lexington (from $7; fee shown at checkout)",

  orderByLine:
    "Order by Wednesday at noon for Friday pickup or local delivery in Georgetown & Lexington.",

  pickupOptionLabel: "Friday pickup (free)",
  deliveryOptionLabel: "Friday delivery (Georgetown or Lexington)",
  deliveryCityLabel: "Delivery city",
  deliveryZipLabel: "Zip code",
  deliveryZipPlaceholder: "40324 or 40502–40517",
  deliveryStreetPlaceholder: "Street address, apt, suite, etc.",
} as const
