import type { CatalogItem } from "@/lib/order/catalog-types"
import { getWeeklyCatalogFallback } from "@/lib/order/catalog-build"
import type {
  PaidOrderDetails,
  PaidOrderLineItem,
} from "@/lib/order/paid-order-details"
import { WEEKLY_FULFILLMENT_TIMEZONE } from "@/lib/order/weekly-fulfillment"
import { getSheetsClient } from "@/lib/google-sheets/client"
import { sheetHasPaidOrder } from "@/lib/google-sheets/orders"
import { getDeploymentTier } from "@/lib/env/deployment"
import type { sheets_v4 } from "googleapis"

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

function resolveLineItemPricing(
  item: PaidOrderLineItem,
  catalogBySlug: Map<string, CatalogItem>
): {
  unitPriceCents: number | undefined
  lineTotalCents: number | undefined
} {
  const catalog = item.slug ? catalogBySlug.get(item.slug) : undefined
  const unitPriceCents =
    item.unitPriceCents ?? catalog?.priceCents ?? undefined
  const lineTotalCents =
    item.lineTotalCents ??
    (unitPriceCents != null ? unitPriceCents * item.quantity : undefined)

  return { unitPriceCents, lineTotalCents }
}

function resolveItemCategory(
  slug: string | undefined,
  catalogBySlug: Map<string, CatalogItem>
): string {
  if (!slug) return ""
  return catalogBySlug.get(slug)?.category ?? ""
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
  orderTimestamp: string,
  catalogBySlug: Map<string, CatalogItem>
): (string | number)[][] {
  const fulfillmentDate = details.fulfillmentDate ?? details.batchLabel ?? ""
  const internalRef = details.internalRef ?? ""
  const squareOrderId = details.squareOrderId ?? ""
  const customerName = details.customerName ?? ""
  const fulfillmentMethod = details.fulfillmentMethod
  const orderStatus = details.orderStatus ?? "New"

  return menuLineItems(details.lineItems).map((item) => {
    const { unitPriceCents, lineTotalCents } = resolveLineItemPricing(
      item,
      catalogBySlug
    )

    return [
      orderTimestamp,
      fulfillmentDate,
      internalRef,
      squareOrderId,
      customerName,
      item.slug ?? "",
      item.name,
      resolveItemCategory(item.slug, catalogBySlug),
      item.quantity,
      formatMoney(unitPriceCents),
      formatMoney(lineTotalCents),
      fulfillmentMethod,
      orderStatus,
    ]
  })
}

async function appendValues(
  sheets: sheets_v4.Sheets,
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

async function loadCatalogForExport(): Promise<CatalogItem[]> {
  try {
    const { getWeeklyCatalog } = await import("@/lib/order/catalog")
    return await getWeeklyCatalog()
  } catch {
    return getWeeklyCatalogFallback()
  }
}

export async function appendPaidOrdersToSheet(
  entries: SheetOrderEntry[]
): Promise<void> {
  if (entries.length === 0) return

  const client = getSheetsClient()
  if (!client) {
    if (getDeploymentTier() === "production") {
      throw new Error(
        "Google Sheets is not configured. Set GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY."
      )
    }
    console.warn(
      "[Google Sheets] Skipping export: set GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY."
    )
    return
  }

  const ordersRows: (string | number)[][] = []
  const lineItemRows: (string | number)[][] = []
  const catalog = await loadCatalogForExport()
  const catalogBySlug = new Map(catalog.map((item) => [item.slug, item]))

  for (const { details, orderedAt } of entries) {
    if (
      await sheetHasPaidOrder(details.squareOrderId, details.internalRef)
    ) {
      continue
    }

    const orderTimestamp = formatOrderTimestamp(orderedAt ?? new Date())
    ordersRows.push(buildOrdersRow(details, orderTimestamp))
    lineItemRows.push(
      ...buildLineItemRows(details, orderTimestamp, catalogBySlug)
    )
  }

  if (ordersRows.length === 0) return

  try {
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
  } catch (err) {
    console.error("[Google Sheets] Failed to append paid order:", err)
    throw err
  }
}

export async function appendPaidOrderToSheet(
  details: PaidOrderDetails,
  options?: { orderedAt?: Date }
): Promise<void> {
  await appendPaidOrdersToSheet([{ details, orderedAt: options?.orderedAt }])
}
