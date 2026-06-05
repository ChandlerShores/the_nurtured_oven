import {
  canBulkSetStatusToInProgress,
  canBulkSetStatusToReady,
  isTerminalOrderStatus,
  normalizeOrderStatus,
  ORDER_STATUS_IN_PROGRESS,
  type OrderStatus,
} from "@/lib/admin/order-status"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"

export const BULK_READY_STATUS = "Ready" as const satisfies OrderStatus
export const BULK_IN_PROGRESS_STATUS =
  ORDER_STATUS_IN_PROGRESS satisfies OrderStatus

export type BulkStatusTarget = typeof BULK_READY_STATUS | typeof BULK_IN_PROGRESS_STATUS

export const BULK_STATUS_TARGETS: BulkStatusTarget[] = [
  BULK_IN_PROGRESS_STATUS,
  BULK_READY_STATUS,
]

export function isBulkStatusTarget(value: string): value is BulkStatusTarget {
  return (BULK_STATUS_TARGETS as readonly string[]).includes(value)
}

export interface BulkStatusPreview {
  target: BulkStatusTarget
  eligible: AdminOrderRow[]
  skippedTerminal: AdminOrderRow[]
  /** Already at the bulk target status (e.g. already In progress). */
  skippedAlreadyAtTarget: AdminOrderRow[]
  /** When moving to In progress, orders already Ready are left unchanged. */
  skippedAlreadyReady: AdminOrderRow[]
}

/** @deprecated Use previewBulkStatusUpdate(orders, "Ready") */
export type BulkReadyPreview = BulkStatusPreview

export function previewBulkStatusUpdate(
  orders: AdminOrderRow[],
  target: BulkStatusTarget
): BulkStatusPreview {
  const eligible: AdminOrderRow[] = []
  const skippedTerminal: AdminOrderRow[] = []
  const skippedAlreadyAtTarget: AdminOrderRow[] = []
  const skippedAlreadyReady: AdminOrderRow[] = []

  for (const order of orders) {
    const normalized = normalizeOrderStatus(order.orderStatus)

    if (isTerminalOrderStatus(normalized)) {
      skippedTerminal.push(order)
      continue
    }

    if (target === BULK_READY_STATUS) {
      if (normalized === BULK_READY_STATUS) {
        skippedAlreadyAtTarget.push(order)
        continue
      }
      if (canBulkSetStatusToReady(order.orderStatus)) {
        eligible.push(order)
      }
      continue
    }

    if (normalized === BULK_IN_PROGRESS_STATUS) {
      skippedAlreadyAtTarget.push(order)
      continue
    }
    if (normalized === BULK_READY_STATUS) {
      skippedAlreadyReady.push(order)
      continue
    }
    if (canBulkSetStatusToInProgress(order.orderStatus)) {
      eligible.push(order)
    }
  }

  return {
    target,
    eligible,
    skippedTerminal,
    skippedAlreadyAtTarget,
    skippedAlreadyReady,
  }
}

export function previewBulkMarkReady(orders: AdminOrderRow[]): BulkStatusPreview {
  return previewBulkStatusUpdate(orders, BULK_READY_STATUS)
}

export function previewBulkMarkInProgress(orders: AdminOrderRow[]): BulkStatusPreview {
  return previewBulkStatusUpdate(orders, BULK_IN_PROGRESS_STATUS)
}

export function bulkStatusSkippedCount(preview: BulkStatusPreview): number {
  return (
    preview.skippedTerminal.length +
    preview.skippedAlreadyAtTarget.length +
    preview.skippedAlreadyReady.length
  )
}

export interface BulkStatusApplyResult {
  updated: number
  skipped: number
  failed: { internalRef: string; error: string }[]
}

/** @deprecated Use BulkStatusApplyResult */
export type BulkReadyApplyResult = BulkStatusApplyResult
