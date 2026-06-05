import { NextResponse } from "next/server"
import { readAdminJsonBody } from "@/lib/admin/api-input"
import {
  BULK_READY_STATUS,
  bulkStatusSkippedCount,
  isBulkStatusTarget,
  previewBulkStatusUpdate,
  type BulkStatusApplyResult,
} from "@/lib/admin/bulk-order-status"
import {
  filterOrdersForWeek,
  listFulfillmentWeekOptions,
  resolveSelectedFulfillmentWeek,
} from "@/lib/admin/fulfillment-weeks"
import { isValidOrderStatus } from "@/lib/admin/order-status"
import { requireAdminApi } from "@/lib/admin/require-admin"
import {
  fetchAllOrdersFromSheet,
  updateOrderStatusInSheet,
} from "@/lib/google-sheets/orders"
import { clampString } from "@/lib/security/public-input"

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const parsed = await readAdminJsonBody(request)
  if (!parsed.ok) return parsed.response

  const weekKey = clampString(parsed.body.weekKey, 64)
  const dryRun = parsed.body.dryRun === true
  const statusParam = clampString(parsed.body.status, 48)
  const target = isBulkStatusTarget(statusParam)
    ? statusParam
    : BULK_READY_STATUS

  if (!isValidOrderStatus(target) || !isBulkStatusTarget(target)) {
    return NextResponse.json({ error: "Invalid bulk status." }, { status: 400 })
  }

  try {
    const allOrders = await fetchAllOrdersFromSheet()
    const weekOptions = listFulfillmentWeekOptions(allOrders)
    const week = resolveSelectedFulfillmentWeek(weekOptions, weekKey)
    const orders = filterOrdersForWeek(allOrders, week)
    const preview = previewBulkStatusUpdate(orders, target)

    if (dryRun) {
      return NextResponse.json({
        preview: {
          target,
          eligibleCount: preview.eligible.length,
          skippedTerminalCount: preview.skippedTerminal.length,
          skippedAlreadyAtTargetCount: preview.skippedAlreadyAtTarget.length,
          skippedAlreadyReadyCount: preview.skippedAlreadyReady.length,
          eligible: preview.eligible.map((o) => ({
            internalRef: o.internalRef,
            customerName: o.customerName,
            orderStatus: o.orderStatus,
          })),
        },
      })
    }

    const result: BulkStatusApplyResult = {
      updated: 0,
      skipped: bulkStatusSkippedCount(preview),
      failed: [],
    }

    for (const order of preview.eligible) {
      try {
        await updateOrderStatusInSheet(order.sheetRow, target, {
          internalRef: order.internalRef,
          squareOrderId: order.squareOrderId,
        })
        result.updated += 1
      } catch (err) {
        result.failed.push({
          internalRef: order.internalRef || `row-${order.sheetRow}`,
          error:
            err instanceof Error ? err.message : "Could not update status.",
        })
      }
    }

    return NextResponse.json({ ok: true, target, ...result })
  } catch (err) {
    console.error("[admin] bulk order status failed", err)
    return NextResponse.json(
      { error: "Could not update order statuses." },
      { status: 500 }
    )
  }
}
