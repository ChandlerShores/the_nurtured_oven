import type { CatalogItem } from "@/lib/order/catalog-types"

export interface CartLineItem {
  slug: string
  quantity: number
}

export function calculateSubtotalCentsFromCatalog(
  lineItems: CartLineItem[],
  catalog: CatalogItem[]
): number {
  const bySlug = new Map(catalog.map((item) => [item.slug, item]))
  return lineItems.reduce((sum, { slug, quantity }) => {
    const item = bySlug.get(slug)
    if (!item || quantity < 1) return sum
    return sum + item.priceCents * quantity
  }, 0)
}

/** Delivery fee in cents; $0 for pickup or orders at/above free-delivery minimum. */
export function getDeliveryFeeCents(
  subtotalCents: number,
  fulfillment: "pickup" | "delivery",
  freeDeliveryMinimumCents: number,
  deliveryFeeCents: number
): number {
  if (fulfillment !== "delivery") return 0
  if (subtotalCents >= freeDeliveryMinimumCents) return 0
  return deliveryFeeCents
}

export function calculateOrderTotalCentsFromCatalog(
  lineItems: CartLineItem[],
  fulfillment: "pickup" | "delivery",
  catalog: CatalogItem[],
  options: {
    freeDeliveryMinimumCents: number
    deliveryFeeCents: number
  }
): { subtotalCents: number; deliveryFeeCents: number; totalCents: number } {
  const subtotalCents = calculateSubtotalCentsFromCatalog(lineItems, catalog)
  const deliveryFee = getDeliveryFeeCents(
    subtotalCents,
    fulfillment,
    options.freeDeliveryMinimumCents,
    options.deliveryFeeCents
  )
  return {
    subtotalCents,
    deliveryFeeCents: deliveryFee,
    totalCents: subtotalCents + deliveryFee,
  }
}
