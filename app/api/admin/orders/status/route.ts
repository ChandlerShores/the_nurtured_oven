import { NextResponse } from "next/server"
import {
  parseAdminInternalRef,
  parseAdminSheetOrderRef,
  parseAdminSheetRow,
  readAdminJsonBody,
} from "@/lib/admin/api-input"
import { isValidOrderStatus } from "@/lib/admin/order-status"
import { requireAdminApi } from "@/lib/admin/require-admin"
import {
  findOrderByInternalRef,
  findOrderBySheetRow,
  updateOrderStatusInSheet,
} from "@/lib/google-sheets/orders"
import { clampString } from "@/lib/security/public-input"

export async function PATCH(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const parsed = await readAdminJsonBody(request)
  if (!parsed.ok) return parsed.response

  const status = clampString(parsed.body.status, 48)
  if (!isValidOrderStatus(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 })
  }

  const sheetRow = parseAdminSheetRow(parsed.body.sheetRow)
  let order =
    sheetRow !== undefined ? await findOrderBySheetRow(sheetRow) : undefined

  if (!order) {
    const internalRef =
      parseAdminInternalRef(parsed.body.internalRef) ??
      parseAdminSheetOrderRef(parsed.body.internalRef)
    if (!internalRef) {
      return NextResponse.json(
        { error: "Valid order reference is required." },
        { status: 400 }
      )
    }
    order = await findOrderByInternalRef(internalRef)
  }

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 })
  }

  try {
    await updateOrderStatusInSheet(order.sheetRow, status, {
      internalRef: order.internalRef,
      squareOrderId: order.squareOrderId,
    })
    return NextResponse.json({ ok: true, status, sheetRow: order.sheetRow })
  } catch (err) {
    console.error("[admin] order status update failed", err)
    return NextResponse.json(
      { error: "Could not save to Google Sheets." },
      { status: 500 }
    )
  }
}
