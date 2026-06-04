import { randomUUID } from "crypto"
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
  leaseExpiresAt?: string
  leaseToken?: string
}

export type AcquireFulfillmentOutcome =
  | "claimed"
  | "resume"
  | "duplicate"
  | "in_progress"

export interface AcquireFulfillmentResult {
  outcome: AcquireFulfillmentOutcome
  phase?: PaymentFulfillmentPhase
  leaseToken?: string
}

export const PAYMENT_PROCESSING_LEASE_MS = 30 * 60 * 1000

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
      leaseExpiresAt: parsed.leaseExpiresAt,
      leaseToken: parsed.leaseToken,
    }
  } catch {
    return { processedAt: raw, phase: "completed" }
  }
}

function processingRecord(
  orderId: string | undefined,
  leaseToken: string
): ProcessedPaymentRecord {
  const now = Date.now()
  return {
    orderId,
    processedAt: new Date(now).toISOString(),
    phase: "processing",
    leaseExpiresAt: new Date(now + PAYMENT_PROCESSING_LEASE_MS).toISOString(),
    leaseToken,
  }
}

function processingLockRedisKey(paymentId: string): string {
  return `${processedPaymentRedisKey(paymentId)}:lock`
}

async function releaseLockIfOwned(
  paymentId: string,
  leaseToken: string
): Promise<void> {
  const client = await getRedisClient()
  if (!client) return

  await client.eval(
    "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end",
    {
      keys: [processingLockRedisKey(paymentId)],
      arguments: [leaseToken],
    }
  )
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
  const lockKey = processingLockRedisKey(paymentId)
  const leaseToken = randomUUID()
  const existingRaw = await client.get(key)
  const existing = parseRecord(existingRaw)

  if (existing) {
    if (existing.phase === "completed") {
      return { outcome: "duplicate", phase: "completed" }
    }

    const locked = await client.set(lockKey, leaseToken, {
      NX: true,
      PX: PAYMENT_PROCESSING_LEASE_MS,
    })
    if (locked !== "OK") {
      return { outcome: "in_progress", phase: existing.phase }
    }

    if (existing.phase === "processing") {
      const record = processingRecord(orderId ?? existing.orderId, leaseToken)
      await client.set(key, serializeRecord(record), {
        EX: PROCESSED_PAYMENT_TTL_SECONDS,
      })
      return { outcome: "claimed", phase: "processing", leaseToken }
    }

    return { outcome: "resume", phase: existing.phase, leaseToken }
  }

  const locked = await client.set(lockKey, leaseToken, {
    NX: true,
    PX: PAYMENT_PROCESSING_LEASE_MS,
  })
  if (locked !== "OK") {
    return { outcome: "in_progress", phase: "processing" }
  }

  const record = processingRecord(orderId, leaseToken)

  const result = await client.set(key, serializeRecord(record), {
    NX: true,
    EX: PROCESSED_PAYMENT_TTL_SECONDS,
  })

  if (result === "OK") {
    return { outcome: "claimed", phase: "processing", leaseToken }
  }

  await releaseLockIfOwned(paymentId, leaseToken)
  const raced = parseRecord(await client.get(key))
  if (!raced) {
    return { outcome: "in_progress", phase: "processing" }
  }
  if (raced.phase === "completed") {
    return { outcome: "duplicate", phase: "completed" }
  }
  if (raced.phase === "processing") {
    return { outcome: "in_progress", phase: "processing" }
  }
  return { outcome: "in_progress", phase: raced.phase }
}

export async function advancePaymentFulfillmentRedis(
  paymentId: string,
  phase: PaymentFulfillmentPhase,
  orderId?: string,
  leaseToken?: string
): Promise<void> {
  const client = await getRedisClient()
  if (!client) return
  if (!leaseToken) {
    throw new Error("Cannot advance payment fulfillment without a lease token.")
  }

  const existing = parseRecord(await client.get(processedPaymentRedisKey(paymentId)))
  const record: ProcessedPaymentRecord = {
    orderId: orderId ?? existing?.orderId,
    processedAt: new Date().toISOString(),
    phase,
    leaseToken: phase === "completed" ? undefined : leaseToken,
    leaseExpiresAt:
      phase === "completed"
        ? undefined
        : new Date(Date.now() + PAYMENT_PROCESSING_LEASE_MS).toISOString(),
  }

  const script = `
    if redis.call('GET', KEYS[2]) ~= ARGV[1] then
      return 0
    end
    redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3])
    if ARGV[4] == 'completed' then
      redis.call('DEL', KEYS[2])
    else
      redis.call('PEXPIRE', KEYS[2], ARGV[5])
    end
    return 1
  `
  const updated = await client.eval(script, {
    keys: [processedPaymentRedisKey(paymentId), processingLockRedisKey(paymentId)],
    arguments: [
      leaseToken,
      serializeRecord(record),
      String(PROCESSED_PAYMENT_TTL_SECONDS),
      phase,
      String(PAYMENT_PROCESSING_LEASE_MS),
    ],
  })

  if (updated !== 1) {
    throw new Error("Payment fulfillment lease was lost before phase advance.")
  }
}

export async function releaseSquarePaymentClaimRedis(
  paymentId: string,
  leaseToken?: string
): Promise<void> {
  const client = await getRedisClient()
  if (!client) return

  if (!leaseToken) {
    await client.del(processedPaymentRedisKey(paymentId))
    await client.del(processingLockRedisKey(paymentId))
    return
  }

  const script = `
    if redis.call('GET', KEYS[2]) ~= ARGV[1] then
      return 0
    end
    redis.call('DEL', KEYS[1])
    redis.call('DEL', KEYS[2])
    return 1
  `
  await client.eval(script, {
    keys: [processedPaymentRedisKey(paymentId), processingLockRedisKey(paymentId)],
    arguments: [leaseToken],
  })
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
