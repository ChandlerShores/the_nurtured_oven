import { isRedisConfigured } from "@/lib/square/redis-client"
import {
  claimSquarePaymentRedis,
  hasProcessedSquarePaymentRedis,
  markSquarePaymentProcessedRedis,
  releaseSquarePaymentClaimRedis,
} from "@/lib/square/webhook-idempotency"

export async function hasProcessedSquarePayment(
  paymentId: string
): Promise<boolean> {
  if (!isRedisConfigured()) return false
  return hasProcessedSquarePaymentRedis(paymentId)
}

/** Atomically claim a payment before sending emails. Returns false if already processed. */
export async function claimSquarePayment(
  paymentId: string,
  orderId?: string
): Promise<boolean> {
  if (!isRedisConfigured()) return true
  return claimSquarePaymentRedis(paymentId, orderId)
}

export async function releaseSquarePaymentClaim(
  paymentId: string
): Promise<void> {
  if (!isRedisConfigured()) return
  await releaseSquarePaymentClaimRedis(paymentId)
}

export async function markSquarePaymentProcessed(
  paymentId: string,
  orderId?: string
): Promise<void> {
  if (!isRedisConfigured()) return
  await markSquarePaymentProcessedRedis(paymentId, orderId)
}
