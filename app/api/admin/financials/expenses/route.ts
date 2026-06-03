import { NextResponse } from "next/server"
import { parseAdminExpenseBody, readAdminJsonBody } from "@/lib/admin/api-input"
import { requireAdminApi } from "@/lib/admin/require-admin"
import { appendWeeklyExpense } from "@/lib/google-sheets/weekly-expenses"

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const parsed = await readAdminJsonBody(request)
  if (!parsed.ok) return parsed.response

  const expense = parseAdminExpenseBody(parsed.body)
  if (!expense.ok) {
    return NextResponse.json({ error: expense.error }, { status: 400 })
  }

  try {
    await appendWeeklyExpense(expense.expense)
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
