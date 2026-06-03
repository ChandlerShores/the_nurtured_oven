import "server-only"

import { parseMoneyToCents } from "@/lib/admin/money"
import { getSheetsClient, sheetTabFromRange } from "@/lib/google-sheets/client"
import { matchesFulfillmentWeek } from "@/lib/google-sheets/orders"
import { formatBatchLabel } from "@/lib/order/weekly-fulfillment"
import { WEEKLY_FULFILLMENT_TIMEZONE } from "@/lib/order/weekly-fulfillment"

export interface WeeklyExpenseRow {
  sheetRow: number
  expenseTimestamp: string
  expenseDate: string
  fulfillmentDate: string
  category: string
  vendor: string
  description: string
  amountCents: number
  paymentMethod: string
  notes: string
}

const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: WEEKLY_FULFILLMENT_TIMEZONE,
  month: "numeric",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
})

function formatExpenseTimestamp(date: Date = new Date()): string {
  return timestampFormatter.format(date)
}

function parseExpenseRows(values: string[][]): WeeklyExpenseRow[] {
  const rows: WeeklyExpenseRow[] = []
  for (let i = 0; i < values.length; i++) {
    const row = values[i]
    if (!row?.length) continue
    const amountCents = parseMoneyToCents(row[6] ?? "")
    if (!row[2]?.trim() && amountCents <= 0) continue
    rows.push({
      sheetRow: i + 2,
      expenseTimestamp: row[0] ?? "",
      expenseDate: row[1] ?? "",
      fulfillmentDate: row[2] ?? "",
      category: row[3] ?? "",
      vendor: row[4] ?? "",
      description: row[5] ?? "",
      amountCents,
      paymentMethod: row[7] ?? "",
      notes: row[8] ?? "",
    })
  }
  return rows
}

export async function fetchAllWeeklyExpensesFromSheet(): Promise<
  WeeklyExpenseRow[]
> {
  const client = getSheetsClient()
  if (!client) return []

  const tab = sheetTabFromRange(client.weeklyExpensesRange)
  const res = await client.sheets.spreadsheets.values.get({
    spreadsheetId: client.spreadsheetId,
    range: `${tab}!A2:J`,
  })

  return parseExpenseRows((res.data.values as string[][]) ?? [])
}

export async function fetchWeeklyExpensesForFulfillment(
  fulfillmentDate: string,
  batchLabel: string
): Promise<WeeklyExpenseRow[]> {
  const all = await fetchAllWeeklyExpensesFromSheet()
  return all.filter((row) =>
    matchesFulfillmentWeek(row.fulfillmentDate, fulfillmentDate, batchLabel)
  )
}

export interface AppendWeeklyExpenseInput {
  expenseDate: string
  fulfillmentDate: string
  category: string
  vendor: string
  description: string
  amount: string
  paymentMethod: string
  notes: string
}

export async function appendWeeklyExpense(
  input: AppendWeeklyExpenseInput
): Promise<void> {
  const client = getSheetsClient()
  if (!client) throw new Error("Google Sheets is not configured.")

  const amountCents = parseMoneyToCents(input.amount)
  if (amountCents <= 0) {
    throw new Error("Amount must be greater than zero.")
  }

  const fulfillmentDate = input.fulfillmentDate.trim()
  const parts = fulfillmentDate.split("-").map(Number)
  const batchLabel =
    parts.length === 3
      ? formatBatchLabel(parts[0], parts[1], parts[2])
      : fulfillmentDate

  const row = [
    formatExpenseTimestamp(),
    input.expenseDate.trim(),
    fulfillmentDate || batchLabel,
    input.category.trim(),
    input.vendor.trim(),
    input.description.trim(),
    (amountCents / 100).toFixed(2),
    input.paymentMethod.trim(),
    input.notes.trim(),
  ]

  await client.sheets.spreadsheets.values.append({
    spreadsheetId: client.spreadsheetId,
    range: client.weeklyExpensesRange,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  })
}
