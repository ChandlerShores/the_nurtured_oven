import { mkdirSync, readFileSync, writeFileSync } from "fs"
import { dirname, join } from "path"
import { isRedisConfigured } from "@/lib/square/redis-client"
import {
  claimSquarePaymentRedis,
  hasProcessedSquarePaymentRedis,
  markSquarePaymentProcessedRedis,
  releaseSquarePaymentClaimRedis,
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
  processedPaymentIds: Record<string, { orderId?: string; processedAt: string }>
}

const STORE_KEY = "__tnoWebsiteOrderStore__"

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
  return Boolean(snapshot.processedPaymentIds[paymentId])
}

export async function claimSquarePayment(
  paymentId: string,
  orderId?: string
): Promise<boolean> {
  if (isRedisConfigured()) {
    return claimSquarePaymentRedis(paymentId, orderId)
  }

  const snapshot = loadSnapshot()
  if (snapshot.processedPaymentIds[paymentId]) return false

  snapshot.processedPaymentIds[paymentId] = {
    orderId,
    processedAt: new Date().toISOString(),
  }
  persistSnapshot(snapshot)
  return true
}

export async function releaseSquarePaymentClaim(paymentId: string): Promise<void> {
  if (isRedisConfigured()) {
    await releaseSquarePaymentClaimRedis(paymentId)
    return
  }

  const snapshot = loadSnapshot()
  delete snapshot.processedPaymentIds[paymentId]
  persistSnapshot(snapshot)
}

export async function markSquarePaymentProcessed(
  paymentId: string,
  orderId?: string
): Promise<void> {
  if (isRedisConfigured()) {
    await markSquarePaymentProcessedRedis(paymentId, orderId)
    return
  }

  const snapshot = loadSnapshot()
  snapshot.processedPaymentIds[paymentId] = {
    orderId,
    processedAt: new Date().toISOString(),
  }
  persistSnapshot(snapshot)
}

/** Test helper — clears in-memory snapshot only. */
export function resetWebsiteOrderStoreForTests(): void {
  const globalStore = globalThis as typeof globalThis & {
    [STORE_KEY]?: WebsiteOrderStoreSnapshot
  }
  globalStore[STORE_KEY] = emptySnapshot()
}
