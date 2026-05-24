import { randomUUID } from "crypto"
import type { Square } from "square"
import {
  calculateSubtotalCents,
  getDeliveryFeeCents,
} from "@/lib/order/delivery-fee"
import { getCatalogItem } from "@/lib/order/catalog"
import { fulfillmentPolicy } from "@/lib/content/fulfillment"
import {
  getAppUrl,
  getSquareClient,
  getSquareLocationId,
} from "@/lib/square/client"

export interface CheckoutLineItem {
  slug: string
  quantity: number
}

export interface WeeklyCheckoutInput {
  name: string
  email: string
  phone?: string
  lineItems: CheckoutLineItem[]
  fulfillment: "pickup" | "delivery"
  deliveryAddress?: string
  dietary?: string
  message?: string
}

function buildPaymentNote(input: WeeklyCheckoutInput): string {
  const parts = [
    `Weekly order — ${input.fulfillment}`,
    `Customer: ${input.name}`,
    input.phone ? `Phone: ${input.phone}` : null,
    input.deliveryAddress ? `Address: ${input.deliveryAddress}` : null,
    input.dietary ? `Dietary: ${input.dietary}` : null,
    input.message ? `Notes: ${input.message}` : null,
  ]
  parts.push(fulfillmentPolicy.squareNote)
  return parts.filter(Boolean).join(" | ")
}

export async function createWeeklyCheckout(
  input: WeeklyCheckoutInput
): Promise<{ checkoutUrl: string; orderReferenceId: string }> {
  const client = getSquareClient()
  const locationId = getSquareLocationId()
  const orderReferenceId = randomUUID()
  const appUrl = getAppUrl()

  const orderLineItems: Square.OrderLineItem[] = []

  for (const { slug, quantity } of input.lineItems) {
    if (!quantity || quantity < 1) continue

    const catalogItem = getCatalogItem(slug)
    if (!catalogItem) {
      throw new Error(`Unknown menu item: ${slug}`)
    }

    const label = catalogItem.unitLabel
      ? `${catalogItem.name} (${catalogItem.unitLabel})`
      : catalogItem.name

    orderLineItems.push({
      name: label,
      quantity: String(quantity),
      basePriceMoney: {
        amount: BigInt(catalogItem.priceCents),
        currency: "USD",
      },
      metadata: { slug },
    })
  }

  if (orderLineItems.length === 0) {
    throw new Error("Cart is empty")
  }

  const subtotalCents = calculateSubtotalCents(input.lineItems)
  const deliveryFeeCents = getDeliveryFeeCents(subtotalCents, input.fulfillment)

  if (deliveryFeeCents > 0) {
    orderLineItems.push({
      name: fulfillmentPolicy.deliveryLineItemName,
      quantity: "1",
      basePriceMoney: {
        amount: BigInt(deliveryFeeCents),
        currency: "USD",
      },
      metadata: { type: "delivery_fee" },
    })
  }

  const result = await client.checkout.paymentLinks.create({
    idempotencyKey: randomUUID(),
    description: `Weekly order for ${input.name} — ${fulfillmentPolicy.menuFulfillmentLine}`,
    order: {
      locationId,
      referenceId: orderReferenceId,
      lineItems: orderLineItems,
    },
    checkoutOptions: {
      redirectUrl: `${appUrl}/order/success`,
      merchantSupportEmail: process.env.OWNER_EMAIL,
      askForShippingAddress: false,
    },
    prePopulatedData: {
      buyerEmail: input.email,
      buyerPhoneNumber: input.phone || undefined,
    },
    paymentNote: buildPaymentNote(input),
  })

  const checkoutUrl =
    result.paymentLink?.url || result.paymentLink?.longUrl

  if (!checkoutUrl) {
    const detail = result.errors?.[0]?.detail || "No checkout URL returned"
    throw new Error(detail)
  }

  return { checkoutUrl, orderReferenceId }
}
