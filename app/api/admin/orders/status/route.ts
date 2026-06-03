import { NextResponse } from "next/server"
import {
  parseAdminInternalRef,
  parseAdminSheetRow,
  readAdminJsonBody,
} from "@/lib/admin/api-input"
import { isValidOrderStatus } from "@/lib/admin/order-status"
import { requireAdminApi } from "@/lib/admin/require-admin"
import {
  findOrderByInternalRef,
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

  const internalRef = parseAdminInternalRef(parsed.body.internalRef)
  let sheetRow = parseAdminSheetRow(parsed.body.sheetRow)

  if (internalRef) {
    const order = await findOrderByInternalRef(internalRef)
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }
    sheetRow = order.sheetRow
  }

  if (!sheetRow || sheetRow < 2) {
    return NextResponse.json(
      { error: "Order reference is required." },
      { status: 400 }
    )
  }

  try {
    await updateOrderStatusInSheet(
      sheetRow,
      status,
      internalRef ?? ""
    )
    return NextResponse.json({ ok: true, status, sheetRow })
  } catch (err) {
    console.error("[admin] order status update failed", err)
    return NextResponse.json(
      { error: "Could not save to Google Sheets." },
      { status: 500 }
    )
  }
}
