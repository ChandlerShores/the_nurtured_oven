import type { CatalogItem } from "@/lib/order/catalog-types"
import { getWeeklyCatalogFallback } from "@/lib/order/catalog-build"
import type {
  PaidOrderDetails,
  PaidOrderLineItem,
} from "@/lib/order/paid-order-details"
import { WEEKLY_FULFILLMENT_TIMEZONE } from "@/lib/order/weekly-fulfillment"
import {
  GOOGLE_SHEETS_REQUEST_TIMEOUT_MS,
  getSheetsClient,
} from "@/lib/google-sheets/client"
import {
  fetchPaidOrderLineItemMap,
  orderLineItemDedupeKey,
  sheetHasPaidOrder,
} from "@/lib/google-sheets/orders"
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

function assertExistingLineItemMatches(
  existing: {
    quantity: number
    unitPriceCents: number
    lineTotalCents: number
  },
  expected: {
    key: string
    quantity: number
    unitPriceCents?: number
    lineTotalCents?: number
  }
): void {
  if (
    existing.quantity !== expected.quantity ||
    (expected.unitPriceCents != null &&
      existing.unitPriceCents !== expected.unitPriceCents) ||
    (expected.lineTotalCents != null &&
      existing.lineTotalCents !== expected.lineTotalCents)
  ) {
    throw new Error(
      `Existing line item ${expected.key} does not match paid Square order.`
    )
  }
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

  await sheets.spreadsheets.values.append(
    {
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values },
    },
    {
      timeout: GOOGLE_SHEETS_REQUEST_TIMEOUT_MS,
    }
  )
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
    const orderTimestamp = formatOrderTimestamp(orderedAt ?? new Date())
    const hasOrder = await sheetHasPaidOrder(
      details.squareOrderId,
      details.internalRef
    )
    const existingLineItems = await fetchPaidOrderLineItemMap(
      details.squareOrderId,
      details.internalRef
    )

    if (!hasOrder) {
      ordersRows.push(buildOrdersRow(details, orderTimestamp))
    }

    const detailRows = buildLineItemRows(details, orderTimestamp, catalogBySlug)
    const expectedMenuItems = menuLineItems(details.lineItems)
    for (let i = 0; i < detailRows.length; i++) {
      const item = expectedMenuItems[i]
      if (!item) continue
      const key = orderLineItemDedupeKey(item)
      const { unitPriceCents, lineTotalCents } = resolveLineItemPricing(
        item,
        catalogBySlug
      )
      if (key === "name:") {
        throw new Error(`Line item "${item.name}" is missing a stable slug.`)
      }
      const existing = existingLineItems.get(key)
      if (existing) {
        assertExistingLineItemMatches(existing, {
          key,
          quantity: item.quantity,
          unitPriceCents,
          lineTotalCents,
        })
        continue
      }
      lineItemRows.push(detailRows[i]!)
      existingLineItems.set(key, {
        sheetRow: -1,
        orderedAt: "",
        fulfillmentLabel: "",
        internalRef: details.internalRef ?? "",
        squareOrderId: details.squareOrderId ?? "",
        customerName: details.customerName ?? "",
        slug: item.slug ?? "",
        name: item.name,
        category: resolveItemCategory(item.slug, catalogBySlug),
        quantity: item.quantity,
        unitPriceCents: unitPriceCents ?? 0,
        lineTotalCents: lineTotalCents ?? 0,
        fulfillmentMethod: details.fulfillmentMethod,
        orderStatus: details.orderStatus ?? "New",
      })
    }
  }

  if (ordersRows.length === 0 && lineItemRows.length === 0) return

  try {
    if (ordersRows.length > 0) {
      await appendValues(
        client.sheets,
        client.spreadsheetId,
        client.ordersRange,
        ordersRows
      )
    }
    if (lineItemRows.length > 0) {
      await appendValues(
        client.sheets,
        client.spreadsheetId,
        client.lineItemsRange,
        lineItemRows
      )
    }
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
