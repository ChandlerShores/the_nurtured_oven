import { randomUUID } from "crypto"
import type { Square } from "square"
import {
  calculateSubtotalCents,
  getDeliveryFeeCents,
} from "@/lib/order/delivery-fee"
import { getCatalogItem } from "@/lib/order/catalog"
import { fulfillmentPolicy } from "@/lib/content/fulfillment"
import { formatPhoneForSquare } from "@/lib/phone"
import { getWeeklyFulfillmentContext } from "@/lib/order/weekly-fulfillment"
import { buildPaymentNote } from "@/lib/square/payment-note"
import {
  buildDeliveryFeeLineItemMetadata,
  buildMenuLineItemMetadata,
  buildOrderMetadata,
} from "@/lib/square/order-metadata"
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
  deliveryCity?: string
  deliveryAddress?: string
  dietary?: string
  message?: string
}

export async function createWeeklyCheckout(
  input: WeeklyCheckoutInput
): Promise<{
  checkoutUrl: string
  orderReferenceId: string
  internalRef: string
}> {
  const client = getSquareClient()
  const locationId = getSquareLocationId()
  const batch = getWeeklyFulfillmentContext()
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
      metadata: buildMenuLineItemMetadata(slug, batch),
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
      metadata: buildDeliveryFeeLineItemMetadata(batch),
    })
  }

  const buyerPhoneNumber = formatPhoneForSquare(input.phone)
  const paymentNote = buildPaymentNote({
    name: input.name,
    phone: input.phone,
    fulfillment: input.fulfillment,
    deliveryCity: input.deliveryCity,
    deliveryAddress: input.deliveryAddress,
    dietary: input.dietary,
    message: input.message,
    batch,
  })

  const result = await client.checkout.paymentLinks.create({
    idempotencyKey: randomUUID(),
    description: `Weekly order for ${input.name} (${batch.batchLabel})`,
    order: {
      locationId,
      referenceId: batch.internalRef,
      lineItems: orderLineItems,
      metadata: buildOrderMetadata(batch, input.fulfillment, input.deliveryCity),
    },
    checkoutOptions: {
      redirectUrl: `${appUrl}/order/success`,
      merchantSupportEmail: process.env.OWNER_EMAIL,
      askForShippingAddress: false,
    },
    prePopulatedData: {
      buyerEmail: input.email,
      ...(buyerPhoneNumber ? { buyerPhoneNumber } : {}),
    },
    paymentNote,
  })

  const checkoutUrl =
    result.paymentLink?.url || result.paymentLink?.longUrl

  if (!checkoutUrl) {
    const detail = result.errors?.[0]?.detail || "No checkout URL returned"
    throw new Error(detail)
  }

  return {
    checkoutUrl,
    orderReferenceId: batch.internalRef,
    internalRef: batch.internalRef,
  }
}
