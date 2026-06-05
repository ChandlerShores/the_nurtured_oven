import { NextResponse } from "next/server"
import {
  buildBulkEmailPreview,
  sendBulkCustomerEmails,
} from "@/lib/admin/bulk-customer-email"
import { isCustomerEmailType } from "@/lib/admin/customer-email-types"
import { readAdminJsonBody } from "@/lib/admin/api-input"
import { requireAdminApi } from "@/lib/admin/require-admin"
import { fetchAllCustomerEmailLogs } from "@/lib/google-sheets/customer-emails"
import { fetchAllOrdersFromSheet } from "@/lib/google-sheets/orders"
import { filterOrdersForWeek, resolveSelectedFulfillmentWeek } from "@/lib/admin/fulfillment-weeks"
import { listFulfillmentWeekOptions } from "@/lib/admin/fulfillment-weeks"
import { clampString } from "@/lib/security/public-input"

function isPaidForWeek(order: { paymentStatus: string; orderStatus: string }) {
  const payment = order.paymentStatus.trim().toLowerCase()
  if (payment !== "paid" && payment !== "completed") return false
  const status = order.orderStatus.trim()
  return status !== "Refunded" && status !== "Cancelled"
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const parsed = await readAdminJsonBody(request)
  if (!parsed.ok) return parsed.response

  const type = clampString(parsed.body.type, 32)
  const dryRun = parsed.body.dryRun === true
  const weekKey = clampString(parsed.body.weekKey, 64)
  const internalRefs = Array.isArray(parsed.body.internalRefs)
    ? (parsed.body.internalRefs as unknown[])
        .map((v) => clampString(String(v), 64))
        .filter(Boolean)
    : []

  if (!isCustomerEmailType(type) || type === "custom") {
    return NextResponse.json(
      { error: "Bulk send supports ready_pickup or out_for_delivery only." },
      { status: 400 }
    )
  }

  try {
    const allOrders = await fetchAllOrdersFromSheet()
    const weekOptions = listFulfillmentWeekOptions(allOrders, {
      includeOrder: isPaidForWeek,
    })
    const week = resolveSelectedFulfillmentWeek(weekOptions, weekKey)
    const orders = filterOrdersForWeek(allOrders, week)
    const history = await fetchAllCustomerEmailLogs()
    const preview = buildBulkEmailPreview(orders, type, history)

    if (!preview) {
      return NextResponse.json({ error: "Invalid email type." }, { status: 400 })
    }

    if (dryRun) {
      return NextResponse.json({ preview })
    }

    const refs =
      internalRefs.length > 0
        ? internalRefs
        : preview.eligible.map((c) => c.internalRef)

    if (refs.length === 0) {
      return NextResponse.json(
        { error: "No eligible orders to email.", preview },
        { status: 400 }
      )
    }

    const result = await sendBulkCustomerEmails(refs, type)
    return NextResponse.json({ preview, result })
  } catch (err) {
    console.error("[admin] bulk customer email failed", err)
    return NextResponse.json(
      { error: "Could not process bulk customer email." },
      { status: 500 }
    )
  }
}
