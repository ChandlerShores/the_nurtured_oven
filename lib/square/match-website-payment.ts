import type { Square } from "square"
import { isInternalRef } from "@/lib/order/internal-ref"
import { readOrderMetadata } from "@/lib/square/order-metadata"
import {
  findWebsiteOrderByInternalRef,
  findWebsiteOrderBySquareOrderId,
  type WebsiteOrderRecord,
} from "@/lib/square/website-order-store"

export const WEBSITE_ORDER_SOURCE = "website"
export const WEBSITE_ORDER_BUSINESS = "the-nurtured-oven"
export const WEBSITE_ORDER_TYPE = "weekly"

export interface SquareWebhookPaymentLike {
  id?: string
  status?: string
  order_id?: string
  orderId?: string
  reference_id?: string
  referenceId?: string
  note?: string
  receipt_url?: string
  receiptUrl?: string
  buyer_email_address?: string
  buyerEmailAddress?: string
  amount_money?: { amount?: bigint | number; currency?: string }
  amountMoney?: { amount?: bigint | number; currency?: string }
  source_type?: string
  sourceType?: string
}

export interface WebsitePaymentMatch {
  matched: true
  squareOrderId: string
  internalRef: string
  websiteOrder: WebsiteOrderRecord | null
  order: Square.Order
}

export interface WebsitePaymentIgnored {
  matched: false
  reason: string
}

export type WebsitePaymentMatchResult = WebsitePaymentMatch | WebsitePaymentIgnored

function normalizePayment(
  payment: SquareWebhookPaymentLike
): SquareWebhookPaymentLike {
  return {
    id: payment.id,
    status: payment.status,
    order_id: payment.order_id ?? payment.orderId,
    reference_id: payment.reference_id ?? payment.referenceId,
    note: payment.note,
    receipt_url: payment.receipt_url ?? payment.receiptUrl,
    buyer_email_address:
      payment.buyer_email_address ?? payment.buyerEmailAddress,
    amount_money: payment.amount_money ?? payment.amountMoney,
    source_type: payment.source_type ?? payment.sourceType,
  }
}

export function orderHasWebsiteMetadata(order: Square.Order): boolean {
  const meta = readOrderMetadata(
    order.metadata as Record<string, string> | undefined
  )

  return (
    meta.source === WEBSITE_ORDER_SOURCE &&
    meta.business === WEBSITE_ORDER_BUSINESS &&
    meta.order_type === WEBSITE_ORDER_TYPE &&
    Boolean(meta.internal_ref?.trim())
  )
}

export function resolveInternalRefFromOrder(order: Square.Order): string | undefined {
  const meta = readOrderMetadata(
    order.metadata as Record<string, string> | undefined
  )
  const referenceId = order.referenceId?.trim()
  const metaRef = meta.internal_ref?.trim()

  if (metaRef && isInternalRef(metaRef)) return metaRef
  if (referenceId && isInternalRef(referenceId)) return referenceId
  return metaRef || referenceId || undefined
}

function isLikelyNonWebsitePaymentSource(sourceType?: string): boolean {
  if (!sourceType) return false
  const normalized = sourceType.toUpperCase()
  return (
    normalized.includes("INVOICE") ||
    normalized === "EXTERNAL" ||
    normalized === "WALLET" ||
    normalized === "CASH" ||
    normalized === "BANK_ACCOUNT"
  )
}

export async function matchWebsitePayment(
  paymentInput: SquareWebhookPaymentLike,
  order?: Square.Order | null
): Promise<WebsitePaymentMatchResult> {
  const payment = normalizePayment(paymentInput)
  const squareOrderId = payment.order_id?.trim()

  if (!squareOrderId) {
    return {
      matched: false,
      reason: "Payment has no Square order_id (invoice, POS, or manual payment)",
    }
  }

  if (!order) {
    return {
      matched: false,
      reason: `Could not retrieve Square order ${squareOrderId}`,
    }
  }

  if (order.id && order.id !== squareOrderId) {
    return {
      matched: false,
      reason: "Retrieved Square order does not match payment order_id",
    }
  }

  if (isLikelyNonWebsitePaymentSource(payment.source_type)) {
    return {
      matched: false,
      reason: `Payment source_type ${payment.source_type} is not a website checkout payment`,
    }
  }

  const internalRef = resolveInternalRefFromOrder(order)
  if (!internalRef) {
    return {
      matched: false,
      reason: "Square order is missing a website internal reference",
    }
  }

  const storedByOrderId = await findWebsiteOrderBySquareOrderId(squareOrderId)
  const storedByRef = await findWebsiteOrderByInternalRef(internalRef)
  const hasWebsiteMetadata = orderHasWebsiteMetadata(order)

  if (!storedByOrderId && !storedByRef && !hasWebsiteMetadata) {
    return {
      matched: false,
      reason:
        "Square order is not registered as a website checkout and lacks website metadata",
    }
  }

  if (hasWebsiteMetadata) {
    const meta = readOrderMetadata(
      order.metadata as Record<string, string> | undefined
    )
    if (meta.internal_ref && meta.internal_ref !== internalRef) {
      return {
        matched: false,
        reason: "Square order metadata internal_ref does not match referenceId",
      }
    }
  }

  if (storedByOrderId && storedByOrderId.internalRef !== internalRef) {
    return {
      matched: false,
      reason: "Stored website order internal_ref does not match Square order",
    }
  }

  if (storedByRef && storedByRef.squareOrderId !== squareOrderId) {
    return {
      matched: false,
      reason: "Stored website order squareOrderId does not match payment order_id",
    }
  }

  return {
    matched: true,
    squareOrderId,
    internalRef,
    websiteOrder: storedByOrderId ?? storedByRef ?? null,
    order,
  }
}
