import { google } from "googleapis"

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets"
export const GOOGLE_SHEETS_REQUEST_TIMEOUT_MS = 15_000
export const DEFAULT_ORDERS_RANGE = "Orders!A:U"
export const DEFAULT_LINE_ITEMS_RANGE = "Order Line Items!A:M"
export const DEFAULT_CUSTOMER_EMAILS_RANGE = "Customer Emails!A:J"
export const DEFAULT_PRODUCT_COSTS_RANGE = "Product Costs!A:G"
export const DEFAULT_WEEKLY_EXPENSES_RANGE = "Weekly Expenses!A:J"

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
  customerEmailsRange: string
  productCostsRange: string
  weeklyExpensesRange: string
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
  const customerEmailsRange =
    parseEnv("GOOGLE_SHEETS_CUSTOMER_EMAILS_RANGE") ??
    DEFAULT_CUSTOMER_EMAILS_RANGE
  const productCostsRange =
    parseEnv("GOOGLE_SHEETS_PRODUCT_COSTS_RANGE") ??
    DEFAULT_PRODUCT_COSTS_RANGE
  const weeklyExpensesRange =
    parseEnv("GOOGLE_SHEETS_WEEKLY_EXPENSES_RANGE") ??
    DEFAULT_WEEKLY_EXPENSES_RANGE

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
    customerEmailsRange,
    productCostsRange,
    weeklyExpensesRange,
  }
}

/** Tab name from an A1 range like `Orders!A:R`. */
export function sheetTabFromRange(range: string): string {
  const bang = range.indexOf("!")
  return bang === -1 ? range : range.slice(0, bang)
}
