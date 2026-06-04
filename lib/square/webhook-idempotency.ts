import {
  getRedisClient,
  isRedisConfigured,
  processedPaymentRedisKey,
  PROCESSED_PAYMENT_TTL_SECONDS,
} from "@/lib/square/redis-client"

export type PaymentFulfillmentPhase =
  | "processing"
  | "emails_sent"
  | "sheet_written"
  | "completed"

export interface ProcessedPaymentRecord {
  orderId?: string
  processedAt: string
  phase: PaymentFulfillmentPhase
}

export type AcquireFulfillmentOutcome = "claimed" | "resume" | "duplicate"

export interface AcquireFulfillmentResult {
  outcome: AcquireFulfillmentOutcome
  phase?: PaymentFulfillmentPhase
}

function serializeRecord(record: ProcessedPaymentRecord): string {
  return JSON.stringify(record)
}

function parseRecord(raw: string | null): ProcessedPaymentRecord | undefined {
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw) as Partial<ProcessedPaymentRecord>
    return {
      orderId: parsed.orderId,
      processedAt: parsed.processedAt ?? new Date().toISOString(),
      phase: parsed.phase ?? "completed",
    }
  } catch {
    return { processedAt: raw, phase: "completed" }
  }
}

export async function hasProcessedSquarePaymentRedis(
  paymentId: string
): Promise<boolean> {
  const record = await getProcessedSquarePaymentRedis(paymentId)
  return record?.phase === "completed"
}

export async function acquirePaymentFulfillmentRedis(
  paymentId: string,
  orderId?: string
): Promise<AcquireFulfillmentResult> {
  const client = await getRedisClient()
  if (!client) return { outcome: "claimed", phase: "processing" }

  const key = processedPaymentRedisKey(paymentId)
  const existingRaw = await client.get(key)
  const existing = parseRecord(existingRaw)

  if (existing) {
    if (existing.phase === "completed") {
      return { outcome: "duplicate", phase: "completed" }
    }
    return { outcome: "resume", phase: existing.phase }
  }

  const record: ProcessedPaymentRecord = {
    orderId,
    processedAt: new Date().toISOString(),
    phase: "processing",
  }

  const result = await client.set(key, serializeRecord(record), {
    NX: true,
    EX: PROCESSED_PAYMENT_TTL_SECONDS,
  })

  if (result === "OK") {
    return { outcome: "claimed", phase: "processing" }
  }

  const raced = parseRecord(await client.get(key))
  if (!raced) {
    return { outcome: "claimed", phase: "processing" }
  }
  if (raced.phase === "completed") {
    return { outcome: "duplicate", phase: "completed" }
  }
  return { outcome: "resume", phase: raced.phase }
}

export async function advancePaymentFulfillmentRedis(
  paymentId: string,
  phase: PaymentFulfillmentPhase,
  orderId?: string
): Promise<void> {
  const client = await getRedisClient()
  if (!client) return

  const existing = parseRecord(await client.get(processedPaymentRedisKey(paymentId)))
  const record: ProcessedPaymentRecord = {
    orderId: orderId ?? existing?.orderId,
    processedAt: new Date().toISOString(),
    phase,
  }

  await client.set(processedPaymentRedisKey(paymentId), serializeRecord(record), {
    EX: PROCESSED_PAYMENT_TTL_SECONDS,
  })
}

/** @deprecated Use acquirePaymentFulfillmentRedis */
export async function claimSquarePaymentRedis(
  paymentId: string,
  orderId?: string
): Promise<boolean> {
  const result = await acquirePaymentFulfillmentRedis(paymentId, orderId)
  return result.outcome === "claimed"
}

export async function markSquarePaymentProcessedRedis(
  paymentId: string,
  orderId?: string
): Promise<void> {
  await advancePaymentFulfillmentRedis(paymentId, "completed", orderId)
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
