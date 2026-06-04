import type { CatalogItem } from "@/lib/order/catalog-types"
import { quoteDeliveryFee } from "@/lib/delivery/delivery-fee-policy"

export interface CartLineItem {
  slug: string
  quantity: number
}

export interface DeliveryFeeOptions {
  deliveryCity?: string
  deliveryZip?: string
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

export function getDeliveryFeeCents(
  subtotalCents: number,
  fulfillment: "pickup" | "delivery",
  options: DeliveryFeeOptions = {}
): number {
  return quoteDeliveryFee({
    subtotalCents,
    fulfillment,
    deliveryCity: options.deliveryCity,
    deliveryZip: options.deliveryZip,
  }).feeCents
}

export function getDeliveryFeeQuote(
  subtotalCents: number,
  fulfillment: "pickup" | "delivery",
  options: DeliveryFeeOptions = {}
) {
  return quoteDeliveryFee({
    subtotalCents,
    fulfillment,
    deliveryCity: options.deliveryCity,
    deliveryZip: options.deliveryZip,
  })
}

export function calculateOrderTotalCentsFromCatalog(
  lineItems: CartLineItem[],
  fulfillment: "pickup" | "delivery",
  catalog: CatalogItem[],
  options: DeliveryFeeOptions = {}
): {
  subtotalCents: number
  deliveryFeeCents: number
  totalCents: number
  deliveryLineItemName: string
} {
  const subtotalCents = calculateSubtotalCentsFromCatalog(lineItems, catalog)
  const quote = getDeliveryFeeQuote(subtotalCents, fulfillment, options)
  return {
    subtotalCents,
    deliveryFeeCents: quote.feeCents,
    totalCents: subtotalCents + quote.feeCents,
    deliveryLineItemName: quote.lineItemName,
  }
}
