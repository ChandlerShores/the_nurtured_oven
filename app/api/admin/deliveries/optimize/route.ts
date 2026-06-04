import { NextResponse } from "next/server"
import { parseAdminDateField, readAdminJsonBody } from "@/lib/admin/api-input"
import { requireAdminApi } from "@/lib/admin/require-admin"
import { optimizeDeliveryRoute } from "@/lib/delivery/build-route"

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const parsed = await readAdminJsonBody(request)
  if (!parsed.ok) return parsed.response

  const deliveryDate = parseAdminDateField(
    parsed.body.deliveryDate ?? parsed.body.fulfillmentDate,
    "Delivery date"
  )
  if (!deliveryDate.ok) {
    return NextResponse.json({ error: deliveryDate.error }, { status: 400 })
  }

  try {
    const result = await optimizeDeliveryRoute(deliveryDate.value)
    return NextResponse.json(result)
  } catch (err) {
    console.error("[admin] delivery route optimize failed", err)
    return NextResponse.json(
      {
        ok: false,
        optimized: false,
        error: "Could not optimize the delivery route. Try again later.",
      },
      { status: 500 }
    )
  }
}
