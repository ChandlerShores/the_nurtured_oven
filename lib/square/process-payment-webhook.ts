import type { Square } from "square"
import { sendPaidOrderEmails } from "@/lib/email"
import { siteConfig } from "@/lib/content/site"
import {
  matchWebsitePayment,
  type SquareWebhookPaymentLike,
} from "@/lib/square/match-website-payment"
import { resolvePaidOrderDetails } from "@/lib/square/resolve-paid-order"
import { appendPaidOrderToSheet } from "@/lib/google-sheets/append-paid-order"
import { getSquareClient } from "@/lib/square/client"
import type { PaymentFulfillmentPhase } from "@/lib/square/webhook-idempotency"
import {
  acquirePaymentFulfillment,
  advancePaymentFulfillment,
  hasProcessedSquarePayment,
  markWebsiteOrderPaid,
  releasePaymentFulfillment,
  requireRedisInProduction,
} from "@/lib/square/website-order-store"

const PAYMENT_EVENT_TYPES = new Set(["payment.created", "payment.updated"])

export interface SquareWebhookEvent {
  type?: string
  data?: {
    type?: string
    object?: {
      payment?: SquareWebhookPaymentLike
    }
  }
}

export interface ProcessPaymentWebhookResult {
  action: "processed" | "ignored" | "duplicate" | "skipped"
  reason?: string
  paymentId?: string
  orderId?: string
}

export function isPaymentWebhookEvent(eventType?: string): boolean {
  return Boolean(eventType && PAYMENT_EVENT_TYPES.has(eventType))
}

export async function fetchSquarePayment(
  paymentId: string
): Promise<SquareWebhookPaymentLike | undefined> {
  try {
    const client = getSquareClient()
    const result = await client.payments.get({ paymentId })
    return result.payment ?? undefined
  } catch (err) {
    console.error("[Square webhook] Failed to retrieve payment:", err)
    return undefined
  }
}

export async function fetchSquareOrder(
  orderId: string
): Promise<Square.Order | undefined> {
  try {
    const client = getSquareClient()
    const result = await client.orders.get({ orderId })
    return result.order ?? undefined
  } catch (err) {
    console.error("[Square webhook] Failed to retrieve order:", err)
    return undefined
  }
}

export async function resolveWebhookPayment(
  event: SquareWebhookEvent
): Promise<SquareWebhookPaymentLike | undefined> {
  const embedded = event.data?.object?.payment
  const paymentId = embedded?.id

  if (!paymentId) return embedded

  const needsHydration =
    !embedded?.status ||
    !(embedded.order_id ?? embedded.orderId) ||
    !(embedded.amount_money ?? embedded.amountMoney)

  if (!needsHydration) return embedded

  const fetched = await fetchSquarePayment(paymentId)
  return fetched ?? embedded
}

function phaseAtLeast(
  current: PaymentFulfillmentPhase,
  target: PaymentFulfillmentPhase
): boolean {
  const order: PaymentFulfillmentPhase[] = [
    "processing",
    "emails_sent",
    "sheet_written",
    "completed",
  ]
  return order.indexOf(current) >= order.indexOf(target)
}

export async function processPaymentWebhookEvent(
  event: SquareWebhookEvent,
  ownerEmail: string = process.env.OWNER_EMAIL || siteConfig.ownerEmail
): Promise<ProcessPaymentWebhookResult> {
  requireRedisInProduction()

  const eventType = event.type

  if (!isPaymentWebhookEvent(eventType)) {
    return {
      action: "skipped",
      reason: `Unhandled event type: ${eventType ?? "unknown"}`,
    }
  }

  const payment = await resolveWebhookPayment(event)
  const paymentId = payment?.id

  if (!payment) {
    return {
      action: "ignored",
      reason: "Payment webhook payload did not include a payment object",
    }
  }

  if (payment.status !== "COMPLETED") {
    return {
      action: "ignored",
      reason: `Payment status is ${payment.status ?? "unknown"}, waiting for COMPLETED`,
      paymentId,
      orderId: payment.order_id ?? payment.orderId,
    }
  }

  if (paymentId && (await hasProcessedSquarePayment(paymentId))) {
    return {
      action: "duplicate",
      reason: "Payment already processed",
      paymentId,
      orderId: payment.order_id ?? payment.orderId,
    }
  }

  const orderId = payment.order_id ?? payment.orderId
  const order = orderId ? await fetchSquareOrder(orderId) : undefined
  const match = await matchWebsitePayment(payment, order)

  if (!match.matched) {
    console.info(
      `[Square webhook] Ignored ${eventType} payment ${paymentId ?? "unknown"}: ${match.reason}`
    )
    return {
      action: "ignored",
      reason: match.reason,
      paymentId,
      orderId,
    }
  }

  if (!paymentId) {
    return {
      action: "ignored",
      reason: "Completed website payment is missing payment id",
      orderId: match.squareOrderId,
    }
  }

  const fulfillment = await acquirePaymentFulfillment(
    paymentId,
    match.squareOrderId
  )

  if (fulfillment.outcome === "duplicate") {
    return {
      action: "duplicate",
      reason: "Payment already processed",
      paymentId,
      orderId: match.squareOrderId,
    }
  }

  const startPhase = fulfillment.phase ?? "processing"
  let sideEffectsStarted = startPhase !== "processing"

  try {
    const details = await resolvePaidOrderDetails(payment, match.order)

    if (!phaseAtLeast(startPhase, "emails_sent")) {
      await sendPaidOrderEmails(details, ownerEmail)
      await advancePaymentFulfillment(paymentId, "emails_sent", match.squareOrderId)
      sideEffectsStarted = true
    }

    if (!phaseAtLeast(startPhase, "sheet_written")) {
      await appendPaidOrderToSheet(details)
      await advancePaymentFulfillment(paymentId, "sheet_written", match.squareOrderId)
      sideEffectsStarted = true
    }

    await markWebsiteOrderPaid(match.squareOrderId, paymentId)
    await advancePaymentFulfillment(paymentId, "completed", match.squareOrderId)
  } catch (err) {
    if (!sideEffectsStarted) {
      await releasePaymentFulfillment(paymentId)
    }
    throw err
  }

  console.info(
    `[Square webhook] Processed ${eventType} for website order ${match.internalRef} (payment ${paymentId})`
  )

  return {
    action: "processed",
    paymentId,
    orderId: match.squareOrderId,
  }
}
