import { fulfillmentPolicy } from "@/lib/content/fulfillment"
import { getCatalogItem } from "@/lib/order/catalog"

export interface CartLineItem {
  slug: string
  quantity: number
}

export function calculateSubtotalCents(lineItems: CartLineItem[]): number {
  return lineItems.reduce((sum, { slug, quantity }) => {
    const item = getCatalogItem(slug)
    if (!item || quantity < 1) return sum
    return sum + item.priceCents * quantity
  }, 0)
}

/** Delivery fee in cents; $0 for pickup or orders at/above free-delivery minimum. */
export function getDeliveryFeeCents(
  subtotalCents: number,
  fulfillment: "pickup" | "delivery"
): number {
  if (fulfillment !== "delivery") return 0
  if (subtotalCents >= fulfillmentPolicy.freeDeliveryMinimumCents) return 0
  return fulfillmentPolicy.deliveryFeeCents
}

export function calculateOrderTotalCents(
  lineItems: CartLineItem[],
  fulfillment: "pickup" | "delivery"
): { subtotalCents: number; deliveryFeeCents: number; totalCents: number } {
  const subtotalCents = calculateSubtotalCents(lineItems)
  const deliveryFeeCents = getDeliveryFeeCents(subtotalCents, fulfillment)
  return {
    subtotalCents,
    deliveryFeeCents,
    totalCents: subtotalCents + deliveryFeeCents,
  }
}
