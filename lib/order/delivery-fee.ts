import "server-only"

import type { CartLineItem } from "@/lib/order/cart-totals"
import {
  calculateOrderTotalCentsFromCatalog,
  calculateSubtotalCentsFromCatalog,
  getDeliveryFeeCents,
} from "@/lib/order/cart-totals"
import { getWeeklyCatalog } from "@/lib/order/catalog"

export type { CartLineItem } from "@/lib/order/cart-totals"
export {
  calculateSubtotalCentsFromCatalog,
  calculateOrderTotalCentsFromCatalog,
  getDeliveryFeeCents,
  getDeliveryFeeQuote,
} from "@/lib/order/cart-totals"

export async function calculateSubtotalCents(
  lineItems: CartLineItem[]
): Promise<number> {
  const catalog = await getWeeklyCatalog()
  return calculateSubtotalCentsFromCatalog(lineItems, catalog)
}

export async function calculateOrderTotalCents(
  lineItems: CartLineItem[],
  fulfillment: "pickup" | "delivery",
  delivery?: { deliveryCity?: string; deliveryZip?: string }
): Promise<{
  subtotalCents: number
  deliveryFeeCents: number
  totalCents: number
  deliveryLineItemName: string
}> {
  const catalog = await getWeeklyCatalog()
  return calculateOrderTotalCentsFromCatalog(lineItems, fulfillment, catalog, {
    deliveryCity: delivery?.deliveryCity,
    deliveryZip: delivery?.deliveryZip,
  })
}

export function getDeliveryFeeCentsForPolicy(
  subtotalCents: number,
  fulfillment: "pickup" | "delivery",
  delivery?: { deliveryCity?: string; deliveryZip?: string }
): number {
  return getDeliveryFeeCents(subtotalCents, fulfillment, {
    deliveryCity: delivery?.deliveryCity,
    deliveryZip: delivery?.deliveryZip,
  })
}
