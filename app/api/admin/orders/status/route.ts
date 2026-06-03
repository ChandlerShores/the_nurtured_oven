import { NextResponse } from "next/server"
import { isValidOrderStatus } from "@/lib/admin/order-status"
import { requireAdminApi } from "@/lib/admin/require-admin"
import {
  findOrderByInternalRef,
  updateOrderStatusInSheet,
} from "@/lib/google-sheets/orders"

export async function PATCH(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let body: { internalRef?: string; sheetRow?: number; status?: string }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const status = body.status?.trim() ?? ""
  if (!isValidOrderStatus(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 })
  }

  const internalRef = body.internalRef?.trim()
  let sheetRow = body.sheetRow

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
