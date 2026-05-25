import type { WeeklyFulfillmentContext } from "@/lib/order/weekly-fulfillment"

export type WeeklyFulfillmentMethod = "pickup" | "delivery"

/** Order-level metadata (no PII). Square allows up to 10 keys per application. */
export function buildOrderMetadata(
  batch: WeeklyFulfillmentContext,
  fulfillment: WeeklyFulfillmentMethod,
  deliveryCity?: string
): Record<string, string> {
  const metadata: Record<string, string> = {
    source: "website",
    business: "the-nurtured-oven",
    order_type: "weekly",
    fulfillment_method: fulfillment,
    fulfillment_date: batch.fulfillmentDate,
    order_week: batch.orderWeek,
    cutoff_at: batch.cutoffAt,
    internal_ref: batch.internalRef,
  }

  const city = deliveryCity?.trim()
  if (fulfillment === "delivery" && city) {
    metadata.delivery_city = city
  }

  if (batch.menuCycle) {
    metadata.menu_cycle = batch.menuCycle
  }

  return metadata
}

export function buildMenuLineItemMetadata(
  slug: string,
  batch: Pick<WeeklyFulfillmentContext, "fulfillmentDate" | "menuCycle">
): Record<string, string> {
  const metadata: Record<string, string> = {
    slug,
    type: "menu_item",
    fulfillment_date: batch.fulfillmentDate,
  }

  if (batch.menuCycle) {
    metadata.menu_cycle = batch.menuCycle
  }

  return metadata
}

export function buildDeliveryFeeLineItemMetadata(
  batch: Pick<WeeklyFulfillmentContext, "fulfillmentDate" | "menuCycle">
): Record<string, string> {
  const metadata: Record<string, string> = {
    type: "delivery_fee",
    fulfillment_date: batch.fulfillmentDate,
  }

  if (batch.menuCycle) {
    metadata.menu_cycle = batch.menuCycle
  }

  return metadata
}

/** Parse order metadata from Square Orders API (camelCase or snake_case). */
export function readOrderMetadata(
  raw?: Record<string, string | undefined> | null
): Record<string, string> {
  if (!raw) return {}
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (value != null && value !== "") out[key] = value
  }
  return out
}
