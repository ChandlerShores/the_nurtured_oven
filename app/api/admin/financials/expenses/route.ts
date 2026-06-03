import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin/require-admin"
import { appendWeeklyExpense } from "@/lib/google-sheets/weekly-expenses"

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let body: {
    expenseDate?: string
    fulfillmentDate?: string
    category?: string
    vendor?: string
    description?: string
    amount?: string
    paymentMethod?: string
    notes?: string
  }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const expenseDate = body.expenseDate?.trim() ?? ""
  const fulfillmentDate = body.fulfillmentDate?.trim() ?? ""
  const category = body.category?.trim() ?? ""
  const amount = body.amount?.trim() ?? ""

  if (!expenseDate || !fulfillmentDate || !category || !amount) {
    return NextResponse.json(
      { error: "Date, bake week, category, and amount are required." },
      { status: 400 }
    )
  }

  try {
    await appendWeeklyExpense({
      expenseDate,
      fulfillmentDate,
      category,
      vendor: body.vendor?.trim() ?? "",
      description: body.description?.trim() ?? "",
      amount,
      paymentMethod: body.paymentMethod?.trim() ?? "",
      notes: body.notes?.trim() ?? "",
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[admin] append expense failed", err)
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not save expense.",
      },
      { status: 500 }
    )
  }
}
