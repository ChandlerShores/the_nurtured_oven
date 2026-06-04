import { isDeliveryCity } from "@/lib/content/fulfillment"
import { normalizeDeliveryZip } from "@/lib/delivery/address-validation"

/** Standard Lexington delivery fee. */
export const STANDARD_DELIVERY_FEE_CENTS = 700

/** Added for Georgetown deliveries (on top of standard when under $40). */
export const GEORGETOWN_SURCHARGE_CENTS = 300

/** Extended Lexington zips (40509, 40515, 40516). */
export const EXTENDED_DELIVERY_FEE_CENTS = 1200

export const STANDARD_FREE_DELIVERY_MINIMUM_CENTS = 4000
export const PREMIUM_FREE_DELIVERY_MINIMUM_CENTS = 5500

export const EXTENDED_LEXINGTON_ZIPS = new Set(["40509", "40515", "40516"])

export type DeliveryFeeTier =
  | "standard_lexington"
  | "extended_lexington"
  | "georgetown"

export function getDeliveryFeeTier(
  city: string,
  zip: string
): DeliveryFeeTier | null {
  const trimmedCity = city.trim()
  if (!isDeliveryCity(trimmedCity)) return null

  const normalizedZip = normalizeDeliveryZip(zip)
  if (!normalizedZip) return null

  if (trimmedCity === "Georgetown") return "georgetown"
  if (EXTENDED_LEXINGTON_ZIPS.has(normalizedZip)) return "extended_lexington"
  return "standard_lexington"
}

export interface DeliveryFeeQuote {
  feeCents: number
  tier: DeliveryFeeTier | null
  lineItemName: string
}

const DEFAULT_LINE_ITEM_NAME = "Friday delivery (Georgetown or Lexington)"

export function quoteDeliveryFee(input: {
  subtotalCents: number
  fulfillment: "pickup" | "delivery"
  deliveryCity?: string
  deliveryZip?: string
}): DeliveryFeeQuote {
  if (input.fulfillment !== "delivery") {
    return { feeCents: 0, tier: null, lineItemName: DEFAULT_LINE_ITEM_NAME }
  }

  const tier = getDeliveryFeeTier(
    input.deliveryCity ?? "",
    input.deliveryZip ?? ""
  )
  const subtotalCents = input.subtotalCents

  if (!tier) {
    const feeCents =
      subtotalCents >= STANDARD_FREE_DELIVERY_MINIMUM_CENTS
        ? 0
        : STANDARD_DELIVERY_FEE_CENTS
    return { feeCents, tier: null, lineItemName: DEFAULT_LINE_ITEM_NAME }
  }

  if (tier === "standard_lexington") {
    return {
      feeCents:
        subtotalCents >= STANDARD_FREE_DELIVERY_MINIMUM_CENTS
          ? 0
          : STANDARD_DELIVERY_FEE_CENTS,
      tier,
      lineItemName: "Friday delivery (Lexington)",
    }
  }

  if (tier === "extended_lexington") {
    return {
      feeCents:
        subtotalCents >= PREMIUM_FREE_DELIVERY_MINIMUM_CENTS
          ? 0
          : EXTENDED_DELIVERY_FEE_CENTS,
      tier,
      lineItemName: "Friday delivery (extended Lexington area)",
    }
  }

  // Georgetown: $10 under $40, $3 surcharge at $40–54.99, free at $55+
  if (subtotalCents >= PREMIUM_FREE_DELIVERY_MINIMUM_CENTS) {
    return {
      feeCents: 0,
      tier,
      lineItemName: "Friday delivery (Georgetown)",
    }
  }

  if (subtotalCents >= STANDARD_FREE_DELIVERY_MINIMUM_CENTS) {
    return {
      feeCents: GEORGETOWN_SURCHARGE_CENTS,
      tier,
      lineItemName: "Friday delivery (Georgetown area surcharge)",
    }
  }

  return {
    feeCents: STANDARD_DELIVERY_FEE_CENTS + GEORGETOWN_SURCHARGE_CENTS,
    tier,
    lineItemName: "Friday delivery (Georgetown)",
  }
}

function formatCentsDisplay(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

const TIER_AREA_LABELS: Record<DeliveryFeeTier, string> = {
  standard_lexington: "Lexington",
  extended_lexington: "Extended Lexington area",
  georgetown: "Georgetown area",
}

export interface DeliveryFeeCartDisplay {
  amountLabel: string
  detail?: string
  nudge?: string
}

function getFreeDeliveryThresholdCents(
  tier: DeliveryFeeTier | null
): number {
  if (tier === "extended_lexington" || tier === "georgetown") {
    return PREMIUM_FREE_DELIVERY_MINIMUM_CENTS
  }
  return STANDARD_FREE_DELIVERY_MINIMUM_CENTS
}

function getFreeDeliveryNudge(
  quote: DeliveryFeeQuote,
  subtotalCents: number
): string | undefined {
  if (quote.feeCents === 0 || !quote.tier) return undefined

  const threshold = getFreeDeliveryThresholdCents(quote.tier)
  const remaining = threshold - subtotalCents
  if (remaining < 100) return undefined

  return `Add ${formatCentsDisplay(remaining)} for free delivery`
}

export function getDeliveryFeeCartDisplay(
  quote: DeliveryFeeQuote,
  subtotalCents: number
): DeliveryFeeCartDisplay {
  if (quote.feeCents === 0) {
    if (quote.tier === "standard_lexington") {
      return {
        amountLabel: "Free",
        detail: "Your order qualifies for free Lexington delivery",
      }
    }
    if (quote.tier === "extended_lexington" || quote.tier === "georgetown") {
      return {
        amountLabel: "Free",
        detail: `Your order qualifies for free delivery (${TIER_AREA_LABELS[quote.tier]})`,
      }
    }
    return { amountLabel: "Free", detail: "Included with your order" }
  }

  if (!quote.tier) {
    return {
      amountLabel: "—",
      detail: "Enter your city and zip above to see your delivery fee",
    }
  }

  const threshold = getFreeDeliveryThresholdCents(quote.tier)
  const detail = `${TIER_AREA_LABELS[quote.tier]} · free on orders ${formatCentsDisplay(threshold)}+`

  return {
    amountLabel: formatCentsDisplay(quote.feeCents),
    detail,
    nudge: getFreeDeliveryNudge(quote, subtotalCents),
  }
}

/** Short one-line label for compact UI (legacy). */
export function formatDeliveryFeeSummary(quote: DeliveryFeeQuote): string {
  return getDeliveryFeeCartDisplay(quote, 0).amountLabel
}

export function formatDeliveryFeeConfirmationNote(input: {
  feeCents: number
  subtotalCents?: number
  deliveryCity?: string
  deliveryZip?: string
}): string {
  if (input.feeCents === 0) {
    return "Delivery included with your order"
  }

  const quote = quoteDeliveryFee({
    subtotalCents: input.subtotalCents ?? 0,
    fulfillment: "delivery",
    deliveryCity: input.deliveryCity,
    deliveryZip: input.deliveryZip,
  })
  const area = quote.tier ? TIER_AREA_LABELS[quote.tier] : null
  const amount = formatCentsDisplay(input.feeCents)

  if (area) {
    return `Delivery fee: ${amount} (${area})`
  }
  return `Delivery fee: ${amount}`
}
