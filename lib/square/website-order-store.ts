import { mkdirSync, readFileSync, writeFileSync } from "fs"
import { randomUUID } from "crypto"
import { dirname, join } from "path"
import { isRedisConfigured } from "@/lib/square/redis-client"
import { getDeploymentTier } from "@/lib/env/deployment"
import {
  acquirePaymentFulfillmentRedis,
  advancePaymentFulfillmentRedis,
  hasProcessedSquarePaymentRedis,
  releaseSquarePaymentClaimRedis,
  type AcquireFulfillmentResult,
  PAYMENT_PROCESSING_LEASE_MS,
  type PaymentFulfillmentPhase,
  type ProcessedPaymentRecord,
} from "@/lib/square/webhook-idempotency"

export type WebsiteOrderStatus = "pending" | "paid"

export interface WebsiteOrderRecord {
  squareOrderId: string
  internalRef: string
  referenceId: string
  createdAt: string
  status: WebsiteOrderStatus
  processedPaymentId?: string
  processedAt?: string
}

interface WebsiteOrderStoreSnapshot {
  ordersBySquareOrderId: Record<string, WebsiteOrderRecord>
  ordersByInternalRef: Record<string, string>
  processedPaymentIds: Record<string, ProcessedPaymentRecord>
}

const STORE_KEY = "__tnoWebsiteOrderStore__"

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

function fulfillmentLeaseIsActive(record: ProcessedPaymentRecord): boolean {
  if (record.phase === "completed") return false
  const expiresAt = Date.parse(record.leaseExpiresAt ?? "")
  return Number.isFinite(expiresAt) && expiresAt > Date.now()
}

function emptySnapshot(): WebsiteOrderStoreSnapshot {
  return {
    ordersBySquareOrderId: {},
    ordersByInternalRef: {},
    processedPaymentIds: {},
  }
}

function getStorePath(): string | undefined {
  const configured = process.env.WEBSITE_ORDERS_STORE_PATH?.trim()
  if (configured) return configured

  if (process.env.VERCEL) {
    return join("/tmp", "tno-website-orders.json")
  }

  if (process.env.NODE_ENV === "development") {
    return join(process.cwd(), ".data", "website-orders.json")
  }

  return undefined
}

function loadSnapshot(): WebsiteOrderStoreSnapshot {
  const globalStore = globalThis as typeof globalThis & {
    [STORE_KEY]?: WebsiteOrderStoreSnapshot
  }

  if (globalStore[STORE_KEY]) {
    return globalStore[STORE_KEY]!
  }

  const path = getStorePath()
  let snapshot = emptySnapshot()

  if (path) {
    try {
      const raw = readFileSync(path, "utf8")
      snapshot = { ...emptySnapshot(), ...JSON.parse(raw) }
    } catch {
      /* start fresh */
    }
  }

  globalStore[STORE_KEY] = snapshot
  return snapshot
}

function persistSnapshot(snapshot: WebsiteOrderStoreSnapshot): void {
  const globalStore = globalThis as typeof globalThis & {
    [STORE_KEY]?: WebsiteOrderStoreSnapshot
  }
  globalStore[STORE_KEY] = snapshot

  const path = getStorePath()
  if (!path) return

  try {
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, JSON.stringify(snapshot, null, 2), "utf8")
  } catch (err) {
    console.warn("[WebsiteOrderStore] Failed to persist snapshot:", err)
  }
}

export async function registerWebsiteOrder(record: {
  squareOrderId: string
  internalRef: string
  referenceId: string
}): Promise<WebsiteOrderRecord> {
  const snapshot = loadSnapshot()
  const createdAt = new Date().toISOString()

  const existing = snapshot.ordersBySquareOrderId[record.squareOrderId]
  if (existing) return existing

  const entry: WebsiteOrderRecord = {
    squareOrderId: record.squareOrderId,
    internalRef: record.internalRef,
    referenceId: record.referenceId,
    createdAt,
    status: "pending",
  }

  snapshot.ordersBySquareOrderId[record.squareOrderId] = entry
  snapshot.ordersByInternalRef[record.internalRef] = record.squareOrderId
  persistSnapshot(snapshot)
  return entry
}

export async function findWebsiteOrderBySquareOrderId(
  squareOrderId: string
): Promise<WebsiteOrderRecord | undefined> {
  const snapshot = loadSnapshot()
  return snapshot.ordersBySquareOrderId[squareOrderId]
}

export async function findWebsiteOrderByInternalRef(
  internalRef: string
): Promise<WebsiteOrderRecord | undefined> {
  const snapshot = loadSnapshot()
  const squareOrderId = snapshot.ordersByInternalRef[internalRef.trim()]
  if (!squareOrderId) return undefined
  return snapshot.ordersBySquareOrderId[squareOrderId]
}

export async function markWebsiteOrderPaid(
  squareOrderId: string,
  paymentId: string
): Promise<void> {
  const snapshot = loadSnapshot()
  const order = snapshot.ordersBySquareOrderId[squareOrderId]
  if (order) {
    order.status = "paid"
    order.processedPaymentId = paymentId
    order.processedAt = new Date().toISOString()
  }
  persistSnapshot(snapshot)
}

export async function hasProcessedSquarePayment(
  paymentId: string
): Promise<boolean> {
  if (isRedisConfigured()) {
    return hasProcessedSquarePaymentRedis(paymentId)
  }

  const snapshot = loadSnapshot()
  const record = snapshot.processedPaymentIds[paymentId]
  return record?.phase === "completed"
}

function acquirePaymentFulfillmentLocal(
  paymentId: string,
  orderId?: string
): AcquireFulfillmentResult {
  const snapshot = loadSnapshot()
  const existing = snapshot.processedPaymentIds[paymentId]
  const leaseToken = randomUUID()

  if (existing) {
    const phase = existing.phase ?? "completed"
    if (phase === "completed") {
      return { outcome: "duplicate", phase: "completed" }
    }
    if (fulfillmentLeaseIsActive(existing)) {
      return { outcome: "in_progress", phase }
    }
    if (phase === "processing") {
      snapshot.processedPaymentIds[paymentId] = processingRecord(
        orderId ?? existing.orderId,
        leaseToken
      )
      persistSnapshot(snapshot)
      return { outcome: "claimed", phase: "processing", leaseToken }
    }
    existing.leaseToken = leaseToken
    existing.leaseExpiresAt = new Date(
      Date.now() + PAYMENT_PROCESSING_LEASE_MS
    ).toISOString()
    persistSnapshot(snapshot)
    return { outcome: "resume", phase, leaseToken }
  }

  snapshot.processedPaymentIds[paymentId] = processingRecord(orderId, leaseToken)
  persistSnapshot(snapshot)
  return { outcome: "claimed", phase: "processing", leaseToken }
}

function advancePaymentFulfillmentLocal(
  paymentId: string,
  phase: PaymentFulfillmentPhase,
  orderId?: string,
  leaseToken?: string
): void {
  const snapshot = loadSnapshot()
  const existing = snapshot.processedPaymentIds[paymentId]
  if (!leaseToken || existing?.leaseToken !== leaseToken) {
    throw new Error("Payment fulfillment lease was lost before phase advance.")
  }
  snapshot.processedPaymentIds[paymentId] = {
    orderId: orderId ?? existing?.orderId,
    processedAt: new Date().toISOString(),
    phase,
    leaseToken: phase === "completed" ? undefined : leaseToken,
    leaseExpiresAt:
      phase === "completed"
        ? undefined
        : new Date(Date.now() + PAYMENT_PROCESSING_LEASE_MS).toISOString(),
  }
  persistSnapshot(snapshot)
}

export async function acquirePaymentFulfillment(
  paymentId: string,
  orderId?: string
): Promise<AcquireFulfillmentResult> {
  if (isRedisConfigured()) {
    return acquirePaymentFulfillmentRedis(paymentId, orderId)
  }
  return acquirePaymentFulfillmentLocal(paymentId, orderId)
}

export async function advancePaymentFulfillment(
  paymentId: string,
  phase: PaymentFulfillmentPhase,
  orderId?: string,
  leaseToken?: string
): Promise<void> {
  if (isRedisConfigured()) {
    await advancePaymentFulfillmentRedis(paymentId, phase, orderId, leaseToken)
    return
  }
  advancePaymentFulfillmentLocal(paymentId, phase, orderId, leaseToken)
}

/** Release only when fulfillment failed before any side effect (phase still processing). */
export async function releasePaymentFulfillment(
  paymentId: string,
  leaseToken?: string
): Promise<void> {
  if (isRedisConfigured()) {
    await releaseSquarePaymentClaimRedis(paymentId, leaseToken)
    return
  }

  const snapshot = loadSnapshot()
  const existing = snapshot.processedPaymentIds[paymentId]
  if (leaseToken && existing?.leaseToken !== leaseToken) return
  delete snapshot.processedPaymentIds[paymentId]
  persistSnapshot(snapshot)
}

export function requireRedisInProduction(): void {
  if (getDeploymentTier() === "production" && !isRedisConfigured()) {
    throw new Error(
      "REDIS_URL is required in production for webhook idempotency."
    )
  }
}

/** Test helper — clears in-memory snapshot only. */
export function resetWebsiteOrderStoreForTests(): void {
  const globalStore = globalThis as typeof globalThis & {
    [STORE_KEY]?: WebsiteOrderStoreSnapshot
  }
  globalStore[STORE_KEY] = emptySnapshot()
}
