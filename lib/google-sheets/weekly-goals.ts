import "server-only"

import {
  GOOGLE_SHEETS_REQUEST_TIMEOUT_MS,
  getSheetsClient,
  sheetTabFromRange,
} from "@/lib/google-sheets/client"
import {
  findWeeklyGoalForWeek,
  parseWeeklyGoalDataRows,
  type WeeklyGoalRow,
} from "@/lib/google-sheets/weekly-goals-data"
import { WEEKLY_FULFILLMENT_TIMEZONE } from "@/lib/order/weekly-fulfillment"

export type { WeeklyGoalRow } from "@/lib/google-sheets/weekly-goals-data"
export { findWeeklyGoalForWeek, parseWeeklyGoalDataRows } from "@/lib/google-sheets/weekly-goals-data"

const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: WEEKLY_FULFILLMENT_TIMEZONE,
  month: "numeric",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
})

function formatUpdatedAt(date: Date = new Date()): string {
  return timestampFormatter.format(date)
}

export async function fetchAllWeeklyGoalsFromSheet(): Promise<WeeklyGoalRow[]> {
  const client = getSheetsClient()
  if (!client) return []

  const tab = sheetTabFromRange(client.weeklyGoalsRange)
  const res = await client.sheets.spreadsheets.values.get(
    {
      spreadsheetId: client.spreadsheetId,
      range: `${tab}!A1:E`,
    },
    { timeout: GOOGLE_SHEETS_REQUEST_TIMEOUT_MS }
  )

  return parseWeeklyGoalDataRows((res.data.values as string[][]) ?? [])
}

export interface UpsertWeeklyGoalsInput {
  fulfillmentDate: string
  batchLabel: string
  revenueGoalCents: number | null
  orderGoalCount: number | null
  notes: string
}

export async function upsertWeeklyGoals(
  input: UpsertWeeklyGoalsInput
): Promise<WeeklyGoalRow> {
  const client = getSheetsClient()
  if (!client) {
    throw new Error("Google Sheets is not configured.")
  }

  const tab = sheetTabFromRange(client.weeklyGoalsRange)
  const existing = await fetchAllWeeklyGoalsFromSheet()
  const match = findWeeklyGoalForWeek(
    existing,
    input.fulfillmentDate,
    input.batchLabel
  )

  const revenueCell =
    input.revenueGoalCents != null && input.revenueGoalCents > 0
      ? (input.revenueGoalCents / 100).toFixed(
          input.revenueGoalCents % 100 === 0 ? 0 : 2
        )
      : ""
  const orderCell =
    input.orderGoalCount != null && input.orderGoalCount > 0
      ? String(input.orderGoalCount)
      : ""
  const updatedAt = formatUpdatedAt()
  const weekLabel = input.fulfillmentDate.trim() || input.batchLabel

  const rowValues = [
    weekLabel,
    revenueCell,
    orderCell,
    input.notes.trim(),
    updatedAt,
  ]

  if (match && match.sheetRow >= 2) {
    await client.sheets.spreadsheets.values.update({
      spreadsheetId: client.spreadsheetId,
      range: `${tab}!A${match.sheetRow}:E${match.sheetRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [rowValues] },
    })
    return {
      sheetRow: match.sheetRow,
      fulfillmentDate: weekLabel,
      revenueGoalCents: input.revenueGoalCents,
      orderGoalCount: input.orderGoalCount,
      notes: input.notes.trim(),
      updatedAt,
    }
  }

  await client.sheets.spreadsheets.values.append({
    spreadsheetId: client.spreadsheetId,
    range: `${tab}!A:E`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [rowValues] },
  })

  return {
    sheetRow: 0,
    fulfillmentDate: weekLabel,
    revenueGoalCents: input.revenueGoalCents,
    orderGoalCount: input.orderGoalCount,
    notes: input.notes.trim(),
    updatedAt,
  }
}
