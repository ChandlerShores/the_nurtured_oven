import type { Square } from "square"
import type { PaidOrderDetails, PaidOrderLineItem } from "@/lib/order/paid-order-details"
import { formatBatchLabel } from "@/lib/order/weekly-fulfillment"
import { parsePaymentNote } from "@/lib/square/payment-note"
import { readOrderMetadata } from "@/lib/square/order-metadata"
import { getSquareClient } from "@/lib/square/client"

interface SquareWebhookPayment {
  id?: string
  status?: string
  order_id?: string
  note?: string
  receipt_url?: string
  buyer_email_address?: string
  amount_money?: { amount?: bigint | number | null; currency?: string }
}

function parseQuantity(value: string | number | undefined): number {
  if (typeof value === "number") return value
  if (!value) return 1
  const n = Number.parseInt(String(value), 10)
  return Number.isNaN(n) ? 1 : n
}

function moneyToCents(
  money?: { amount?: bigint | number | null } | null
): number | undefined {
  if (money?.amount == null) return undefined
  return Number(money.amount)
}

function mapLineItems(order?: Square.Order | null): {
  lineItems: PaidOrderLineItem[]
  subtotalCents: number
  deliveryFeeCents: number
} {
  const lineItems: PaidOrderLineItem[] = []
  let subtotalCents = 0
  let deliveryFeeCents = 0

  for (const item of order?.lineItems ?? []) {
    const qty = parseQuantity(item.quantity)
    const meta = readOrderMetadata(item.metadata as Record<string, string> | undefined)
    const type = meta.type === "delivery_fee" ? "delivery_fee" : "menu_item"
    const cents = moneyToCents(item.basePriceMoney) ?? 0
    const lineTotal = cents * qty

    lineItems.push({
      name: item.name ?? "Item",
      quantity: qty,
      slug: meta.slug,
      type,
    })

    if (type === "delivery_fee") {
      deliveryFeeCents += lineTotal
    } else {
      subtotalCents += lineTotal
    }
  }

  return { lineItems, subtotalCents, deliveryFeeCents }
}

function splitDeliveryLine(line?: string): {
  deliveryCity?: string
  deliveryAddress?: string
} {
  if (!line) return {}
  const comma = line.indexOf(",")
  if (comma === -1) return { deliveryCity: line.trim() }
  return {
    deliveryCity: line.slice(0, comma).trim(),
    deliveryAddress: line.slice(comma + 1).trim(),
  }
}

function fulfillmentDateToBatchLabel(fulfillmentDate?: string): string | undefined {
  if (!fulfillmentDate) return undefined
  const [y, m, d] = fulfillmentDate.split("-").map(Number)
  if (!y || !m || !d) return undefined
  return formatBatchLabel(y, m, d)
}

export async function resolvePaidOrderDetails(
  payment: SquareWebhookPayment,
  orderFromMatch?: Square.Order | null
): Promise<PaidOrderDetails> {
  const parsedNote = parsePaymentNote(payment.note)
  let order = orderFromMatch

  if (!order && payment.order_id) {
    try {
      const client = getSquareClient()
      const result = await client.orders.get({ orderId: payment.order_id })
      order = result.order
    } catch (err) {
      console.error("[Square webhook] Failed to retrieve order:", err)
    }
  }

  const orderMeta = readOrderMetadata(
    order?.metadata as Record<string, string> | undefined
  )
  const { lineItems, subtotalCents, deliveryFeeCents } = mapLineItems(order)

  const fulfillmentMethod =
    (orderMeta.fulfillment_method as "pickup" | "delivery" | undefined) ??
    parsedNote.fulfillmentMethod ??
    "pickup"

  const fulfillmentDate = orderMeta.fulfillment_date
  const deliveryFromNote = splitDeliveryLine(parsedNote.deliveryLine)

  return {
    internalRef:
      order?.referenceId ??
      orderMeta.internal_ref ??
      parsedNote.internalRef,
    fulfillmentMethod,
    fulfillmentDate,
    batchLabel: fulfillmentDateToBatchLabel(fulfillmentDate) ?? parsedNote.batchShort,
    orderWeek: orderMeta.order_week,
    menuCycle: orderMeta.menu_cycle,
    customerName: parsedNote.customerName,
    customerEmail: payment.buyer_email_address,
    customerPhone: parsedNote.phone,
    lineItems,
    deliveryCity: orderMeta.delivery_city ?? deliveryFromNote.deliveryCity,
    deliveryAddress: deliveryFromNote.deliveryAddress,
    dietary: parsedNote.dietary,
    message: parsedNote.message,
    subtotalCents: lineItems.length > 0 ? subtotalCents : undefined,
    deliveryFeeCents: deliveryFeeCents > 0 ? deliveryFeeCents : undefined,
    amountCents: moneyToCents(payment.amount_money),
    squareOrderId: payment.order_id,
    receiptUrl: payment.receipt_url,
  }
}
