import { google } from "googleapis"
import { getCatalogItem } from "@/lib/order/catalog"
import type {
  PaidOrderDetails,
  PaidOrderLineItem,
} from "@/lib/order/paid-order-details"
import { WEEKLY_FULFILLMENT_TIMEZONE } from "@/lib/order/weekly-fulfillment"

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets"
const DEFAULT_ORDERS_RANGE = "Orders!A:R"
const DEFAULT_LINE_ITEMS_RANGE = "Order Line Items!A:M"

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

function normalizeLineItemsSummary(items: PaidOrderLineItem[]): string {
  const menuItems = items.filter((item) => item.type !== "delivery_fee")
  if (menuItems.length === 0) return "See Square receipt"
  return menuItems.map((item) => `${item.name} x${item.quantity}`).join("; ")
}

function totalItemQuantity(items: PaidOrderLineItem[]): number {
  return items
    .filter((item) => item.type !== "delivery_fee")
    .reduce((sum, item) => sum + item.quantity, 0)
}

function formatMoney(cents?: number): string {
  if (cents == null) return ""
  return (cents / 100).toFixed(2)
}

function menuLineItems(items: PaidOrderLineItem[]): PaidOrderLineItem[] {
  return items.filter((item) => item.type !== "delivery_fee")
}

const orderTimestampFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: WEEKLY_FULFILLMENT_TIMEZONE,
  month: "numeric",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
})

function formatOrderTimestamp(date: Date = new Date()): string {
  return orderTimestampFormatter.format(date)
}

function resolveLineItemPricing(item: PaidOrderLineItem): {
  unitPriceCents: number | undefined
  lineTotalCents: number | undefined
} {
  const catalog = item.slug ? getCatalogItem(item.slug) : undefined
  const unitPriceCents =
    item.unitPriceCents ?? catalog?.priceCents ?? undefined
  const lineTotalCents =
    item.lineTotalCents ??
    (unitPriceCents != null ? unitPriceCents * item.quantity : undefined)

  return { unitPriceCents, lineTotalCents }
}

function resolveItemCategory(slug?: string): string {
  if (!slug) return ""
  return getCatalogItem(slug)?.category ?? ""
}

/** One row for the Orders tab (column G = total quantity; header is "Total quantity" in sheet). */
function buildOrdersRow(
  details: PaidOrderDetails,
  orderTimestamp: string
): (string | number)[] {
  return [
    orderTimestamp,
    details.customerName ?? "",
    details.customerEmail ?? "",
    details.customerPhone ?? "",
    details.fulfillmentDate ?? details.batchLabel ?? "",
    normalizeLineItemsSummary(details.lineItems),
    totalItemQuantity(details.lineItems),
    details.fulfillmentMethod,
    details.deliveryAddress ?? "",
    details.deliveryCity ?? "",
    details.dietary ?? "",
    details.message ?? "",
    "Paid",
    details.internalRef ?? "",
    details.squareOrderId ?? "",
    details.receiptUrl ?? "",
    formatMoney(details.amountCents),
    details.orderStatus ?? "New",
  ]
}

/** One row per menu line item for the Order Line Items tab. */
function buildLineItemRows(
  details: PaidOrderDetails,
  orderTimestamp: string
): (string | number)[][] {
  const fulfillmentDate = details.fulfillmentDate ?? details.batchLabel ?? ""
  const internalRef = details.internalRef ?? ""
  const squareOrderId = details.squareOrderId ?? ""
  const customerName = details.customerName ?? ""
  const fulfillmentMethod = details.fulfillmentMethod
  const orderStatus = details.orderStatus ?? "New"

  return menuLineItems(details.lineItems).map((item) => {
    const { unitPriceCents, lineTotalCents } = resolveLineItemPricing(item)

    return [
      orderTimestamp,
      fulfillmentDate,
      internalRef,
      squareOrderId,
      customerName,
      item.slug ?? "",
      item.name,
      resolveItemCategory(item.slug),
      item.quantity,
      formatMoney(unitPriceCents),
      formatMoney(lineTotalCents),
      fulfillmentMethod,
      orderStatus,
    ]
  })
}

async function appendValues(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  range: string,
  values: (string | number)[][]
): Promise<void> {
  if (values.length === 0) return

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  })
}

export interface SheetOrderEntry {
  details: PaidOrderDetails
  /** When the customer placed the order (sheet column A). Defaults to now. */
  orderedAt?: Date
}

function getSheetsClient(): {
  sheets: ReturnType<typeof google.sheets>
  spreadsheetId: string
  ordersRange: string
  lineItemsRange: string
} | null {
  const rawSpreadsheetId = parseEnv("GOOGLE_SHEET_ID")
  if (!rawSpreadsheetId) return null
  const spreadsheetId = normalizeSpreadsheetId(rawSpreadsheetId)

  const clientEmail = parseEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL")
  const privateKey = parseEnv("GOOGLE_PRIVATE_KEY")
  if (!clientEmail || !privateKey) {
    console.warn(
      "[Google Sheets] Skipping export: set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY."
    )
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

export async function appendPaidOrdersToSheet(
  entries: SheetOrderEntry[]
): Promise<void> {
  if (entries.length === 0) return

  const client = getSheetsClient()
  if (!client) return

  const ordersRows: (string | number)[][] = []
  const lineItemRows: (string | number)[][] = []

  for (const { details, orderedAt } of entries) {
    const orderTimestamp = formatOrderTimestamp(orderedAt ?? new Date())
    ordersRows.push(buildOrdersRow(details, orderTimestamp))
    lineItemRows.push(...buildLineItemRows(details, orderTimestamp))
  }

  await appendValues(
    client.sheets,
    client.spreadsheetId,
    client.ordersRange,
    ordersRows
  )
  await appendValues(
    client.sheets,
    client.spreadsheetId,
    client.lineItemsRange,
    lineItemRows
  )
}

export async function appendPaidOrderToSheet(
  details: PaidOrderDetails,
  options?: { orderedAt?: Date }
): Promise<void> {
  await appendPaidOrdersToSheet([{ details, orderedAt: options?.orderedAt }])
}
