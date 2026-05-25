/**
 * Webhook idempotency boundary for Square payment.updated events.
 *
 * Serverless instances do not share memory, so in-process Sets are unsafe in production.
 * Implement durable storage (Vercel KV, Postgres, etc.) before relying on dedupe in prod.
 */

export async function hasProcessedSquarePayment(
  paymentId: string
): Promise<boolean> {
  // TODO: Query durable store by paymentId (e.g. `square_webhook_payments` table / KV key).
  // Return true when confirmation emails were already sent for this payment.
  void paymentId
  return false
}

export async function markSquarePaymentProcessed(
  paymentId: string,
  orderId?: string
): Promise<void> {
  // TODO: Upsert paymentId (+ optional orderId + processedAt) after successful email send.
  void paymentId
  void orderId
}
