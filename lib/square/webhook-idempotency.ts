import {
  getRedisClient,
  isRedisConfigured,
  processedPaymentRedisKey,
  PROCESSED_PAYMENT_TTL_SECONDS,
} from "@/lib/square/redis-client"

export interface ProcessedPaymentRecord {
  orderId?: string
  processedAt: string
}

function serializeRecord(record: ProcessedPaymentRecord): string {
  return JSON.stringify(record)
}

function parseRecord(raw: string | null): ProcessedPaymentRecord | undefined {
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as ProcessedPaymentRecord
  } catch {
    return { processedAt: raw }
  }
}

export async function hasProcessedSquarePaymentRedis(
  paymentId: string
): Promise<boolean> {
  const client = await getRedisClient()
  if (!client) return false

  const exists = await client.exists(processedPaymentRedisKey(paymentId))
  return exists === 1
}

/**
 * Atomically claim a payment for processing. Returns true when this caller
 * won the claim, false when another webhook already processed/claimed it.
 */
export async function claimSquarePaymentRedis(
  paymentId: string,
  orderId?: string
): Promise<boolean> {
  const client = await getRedisClient()
  if (!client) return false

  const record: ProcessedPaymentRecord = {
    orderId,
    processedAt: new Date().toISOString(),
  }

  const result = await client.set(processedPaymentRedisKey(paymentId), serializeRecord(record), {
    NX: true,
    EX: PROCESSED_PAYMENT_TTL_SECONDS,
  })

  return result === "OK"
}

export async function markSquarePaymentProcessedRedis(
  paymentId: string,
  orderId?: string
): Promise<void> {
  const client = await getRedisClient()
  if (!client) return

  const record: ProcessedPaymentRecord = {
    orderId,
    processedAt: new Date().toISOString(),
  }

  await client.set(processedPaymentRedisKey(paymentId), serializeRecord(record), {
    EX: PROCESSED_PAYMENT_TTL_SECONDS,
  })
}

export async function releaseSquarePaymentClaimRedis(
  paymentId: string
): Promise<void> {
  const client = await getRedisClient()
  if (!client) return

  await client.del(processedPaymentRedisKey(paymentId))
}

export async function getProcessedSquarePaymentRedis(
  paymentId: string
): Promise<ProcessedPaymentRecord | undefined> {
  const client = await getRedisClient()
  if (!client) return undefined

  const raw = await client.get(processedPaymentRedisKey(paymentId))
  return parseRecord(raw)
}

export { isRedisConfigured }
