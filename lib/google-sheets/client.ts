import { google } from "googleapis"

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets"
export const DEFAULT_ORDERS_RANGE = "Orders!A:R"
export const DEFAULT_LINE_ITEMS_RANGE = "Order Line Items!A:M"

function parseEnv(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

function normalizeSpreadsheetId(value: string): string {
  const match = value.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return match?.[1] ?? value
}

function normalizePrivateKey(value: string): string {
  return value.replace(/\\n/g, "\n")
}

export interface GoogleSheetsClient {
  sheets: ReturnType<typeof google.sheets>
  spreadsheetId: string
  ordersRange: string
  lineItemsRange: string
}

export function getSheetsClient(): GoogleSheetsClient | null {
  const rawSpreadsheetId = parseEnv("GOOGLE_SHEET_ID")
  if (!rawSpreadsheetId) return null
  const spreadsheetId = normalizeSpreadsheetId(rawSpreadsheetId)

  const clientEmail = parseEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL")
  const privateKey = parseEnv("GOOGLE_PRIVATE_KEY")
  if (!clientEmail || !privateKey) {
    return null
  }

  const ordersRange =
    parseEnv("GOOGLE_SHEETS_ORDERS_RANGE") ??
    parseEnv("GOOGLE_SHEETS_RANGE") ??
    DEFAULT_ORDERS_RANGE
  const lineItemsRange =
    parseEnv("GOOGLE_SHEETS_LINE_ITEMS_RANGE") ?? DEFAULT_LINE_ITEMS_RANGE

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: normalizePrivateKey(privateKey),
    scopes: [SHEETS_SCOPE],
  })

  return {
    sheets: google.sheets({ version: "v4", auth }),
    spreadsheetId,
    ordersRange,
    lineItemsRange,
  }
}

/** Tab name from an A1 range like `Orders!A:R`. */
export function sheetTabFromRange(range: string): string {
  const bang = range.indexOf("!")
  return bang === -1 ? range : range.slice(0, bang)
}
