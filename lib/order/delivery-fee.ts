import "server-only"

import { fulfillmentPolicy } from "@/lib/content/fulfillment"
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
} from "@/lib/order/cart-totals"

export async function calculateSubtotalCents(
  lineItems: CartLineItem[]
): Promise<number> {
  const catalog = await getWeeklyCatalog()
  return calculateSubtotalCentsFromCatalog(lineItems, catalog)
}

export async function calculateOrderTotalCents(
  lineItems: CartLineItem[],
  fulfillment: "pickup" | "delivery"
): Promise<{ subtotalCents: number; deliveryFeeCents: number; totalCents: number }> {
  const catalog = await getWeeklyCatalog()
  return calculateOrderTotalCentsFromCatalog(lineItems, fulfillment, catalog, {
    freeDeliveryMinimumCents: fulfillmentPolicy.freeDeliveryMinimumCents,
    deliveryFeeCents: fulfillmentPolicy.deliveryFeeCents,
  })
}

export function getDeliveryFeeCentsForPolicy(
  subtotalCents: number,
  fulfillment: "pickup" | "delivery"
): number {
  return getDeliveryFeeCents(
    subtotalCents,
    fulfillment,
    fulfillmentPolicy.freeDeliveryMinimumCents,
    fulfillmentPolicy.deliveryFeeCents
  )
}
