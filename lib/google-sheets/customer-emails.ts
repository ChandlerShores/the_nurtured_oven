import {
  getSheetsClient,
  sheetTabFromRange,
} from "@/lib/google-sheets/client"
import type { CustomerEmailType } from "@/lib/admin/customer-email-types"
import { customerEmailTypeLabel } from "@/lib/admin/customer-email-types"
import { WEEKLY_FULFILLMENT_TIMEZONE } from "@/lib/order/weekly-fulfillment"

export interface CustomerEmailLogRow {
  timestamp: string
  internalRef: string
  squareOrderId: string
  customerName: string
  customerEmail: string
  emailType: string
  subject: string
  message: string
  sentStatus: string
  resendMessageId: string
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

function formatLogTimestamp(date: Date = new Date()): string {
  return timestampFormatter.format(date)
}

function parseCustomerEmailRows(values: string[][]): CustomerEmailLogRow[] {
  const rows: CustomerEmailLogRow[] = []
  for (const row of values) {
    if (!row?.length) continue
    const internalRef = (row[1] ?? "").trim()
    if (!internalRef) continue
    rows.push({
      timestamp: row[0] ?? "",
      internalRef,
      squareOrderId: row[2] ?? "",
      customerName: row[3] ?? "",
      customerEmail: row[4] ?? "",
      emailType: row[5] ?? "",
      subject: row[6] ?? "",
      message: row[7] ?? "",
      sentStatus: row[8] ?? "",
      resendMessageId: row[9] ?? "",
    })
  }
  return rows
}

export async function appendCustomerEmailLog(entry: {
  internalRef: string
  squareOrderId: string
  customerName: string
  customerEmail: string
  emailType: CustomerEmailType
  subject: string
  message: string
  sentStatus: string
  resendMessageId: string
  sentAt?: Date
}): Promise<void> {
  const client = getSheetsClient()
  if (!client) {
    console.warn(
      "[Customer Emails] Skipping log append — Google Sheets not configured."
    )
    return
  }

  const row: (string | number)[] = [
    formatLogTimestamp(entry.sentAt ?? new Date()),
    entry.internalRef,
    entry.squareOrderId,
    entry.customerName,
    entry.customerEmail,
    customerEmailTypeLabel(entry.emailType),
    entry.subject,
    entry.message,
    entry.sentStatus,
    entry.resendMessageId,
  ]

  await client.sheets.spreadsheets.values.append({
    spreadsheetId: client.spreadsheetId,
    range: client.customerEmailsRange,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  })
}

export async function fetchAllCustomerEmailLogs(): Promise<CustomerEmailLogRow[]> {
  const client = getSheetsClient()
  if (!client) return []

  const tab = sheetTabFromRange(client.customerEmailsRange)
  const res = await client.sheets.spreadsheets.values.get({
    spreadsheetId: client.spreadsheetId,
    range: `${tab}!A2:J`,
  })

  return parseCustomerEmailRows((res.data.values as string[][]) ?? [])
}

export async function fetchCustomerEmailsForOrder(
  internalRef: string
): Promise<CustomerEmailLogRow[]> {
  const ref = internalRef.trim()
  return (await fetchAllCustomerEmailLogs())
    .filter((row) => row.internalRef === ref)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}
