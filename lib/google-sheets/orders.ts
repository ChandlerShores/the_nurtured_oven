import {
  getSheetsClient,
  sheetTabFromRange,
} from "@/lib/google-sheets/client"
import {
  formatBatchLabel,
  getWeeklyFulfillmentContext,
} from "@/lib/order/weekly-fulfillment"

export interface AdminOrderRow {
  /** 1-based row number in the Orders tab (includes header row). */
  sheetRow: number
  orderedAt: string
  customerName: string
  customerEmail: string
  customerPhone: string
  fulfillmentLabel: string
  itemsSummary: string
  totalQuantity: string
  fulfillmentMethod: string
  deliveryAddress: string
  deliveryCity: string
  dietary: string
  message: string
  paymentStatus: string
  internalRef: string
  squareOrderId: string
  receiptUrl: string
  amount: string
  orderStatus: string
}

function parseOrdersDataRows(values: string[][]): AdminOrderRow[] {
  const rows: AdminOrderRow[] = []

  for (let i = 0; i < values.length; i++) {
    const row = values[i]
    if (!row?.length) continue

    const internalRef = (row[13] ?? "").trim()
    const squareOrderId = (row[14] ?? "").trim()
    if (!internalRef && !squareOrderId) continue

    rows.push({
      sheetRow: i + 2,
      orderedAt: row[0] ?? "",
      customerName: row[1] ?? "",
      customerEmail: row[2] ?? "",
      customerPhone: row[3] ?? "",
      fulfillmentLabel: row[4] ?? "",
      itemsSummary: row[5] ?? "",
      totalQuantity: String(row[6] ?? ""),
      fulfillmentMethod: row[7] ?? "",
      deliveryAddress: row[8] ?? "",
      deliveryCity: row[9] ?? "",
      dietary: row[10] ?? "",
      message: row[11] ?? "",
      paymentStatus: row[12] ?? "",
      internalRef,
      squareOrderId,
      receiptUrl: row[15] ?? "",
      amount: row[16] ?? "",
      orderStatus: (row[17] ?? "New").trim() || "New",
    })
  }

  return rows
}

function matchesCurrentWeek(
  fulfillmentLabel: string,
  fulfillmentDate: string,
  batchLabel: string
): boolean {
  const label = fulfillmentLabel.trim()
  if (!label) return false
  if (label === fulfillmentDate || label === batchLabel) return true
  if (label.includes(fulfillmentDate)) return true

  const fridayParts = fulfillmentDate.split("-").map(Number)
  if (fridayParts.length === 3) {
    const [, month, day] = fridayParts
    const short = formatBatchLabel(fridayParts[0], month, day)
    if (label === short || label.includes(`${month}/${day}`)) return true
  }

  return false
}

export async function fetchAllOrdersFromSheet(): Promise<AdminOrderRow[]> {
  const client = getSheetsClient()
  if (!client) {
    throw new Error(
      "Google Sheets is not configured. Set GOOGLE_SHEET_ID and service account credentials."
    )
  }

  const tab = sheetTabFromRange(client.ordersRange)
  const res = await client.sheets.spreadsheets.values.get({
    spreadsheetId: client.spreadsheetId,
    range: `${tab}!A2:R`,
  })

  return parseOrdersDataRows((res.data.values as string[][]) ?? [])
}

/** One row in the Order Line Items tab (column layout matches append-paid-order export). */
export interface AdminOrderLineRow {
  sheetRow: number
  orderedAt: string
  fulfillmentLabel: string
  internalRef: string
  squareOrderId: string
  customerName: string
  slug: string
  name: string
  category: string
  quantity: number
  fulfillmentMethod: string
  orderStatus: string
}

function parseOrderLineItemRows(values: string[][]): AdminOrderLineRow[] {
  const rows: AdminOrderLineRow[] = []

  for (let i = 0; i < values.length; i++) {
    const row = values[i]
    if (!row?.length) continue

    const internalRef = (row[2] ?? "").trim()
    const squareOrderId = (row[3] ?? "").trim()
    const name = (row[6] ?? "").trim()
    const slug = (row[5] ?? "").trim()
    if (!internalRef && !squareOrderId) continue
    if (!name && !slug) continue

    const qty = Number(row[8])
    rows.push({
      sheetRow: i + 2,
      orderedAt: row[0] ?? "",
      fulfillmentLabel: row[1] ?? "",
      internalRef,
      squareOrderId,
      customerName: row[4] ?? "",
      slug,
      name,
      category: row[7] ?? "",
      quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
      fulfillmentMethod: row[11] ?? "",
      orderStatus: (row[12] ?? "New").trim() || "New",
    })
  }

  return rows
}

export async function fetchAllOrderLineItemsFromSheet(): Promise<
  AdminOrderLineRow[]
> {
  const client = getSheetsClient()
  if (!client) {
    throw new Error(
      "Google Sheets is not configured. Set GOOGLE_SHEET_ID and service account credentials."
    )
  }

  const tab = sheetTabFromRange(client.lineItemsRange)
  const res = await client.sheets.spreadsheets.values.get({
    spreadsheetId: client.spreadsheetId,
    range: `${tab}!A2:M`,
  })

  return parseOrderLineItemRows((res.data.values as string[][]) ?? [])
}

export async function fetchCurrentWeekOrders(): Promise<{
  batchLabel: string
  fulfillmentDate: string
  orders: AdminOrderRow[]
}> {
  const ctx = getWeeklyFulfillmentContext()
  const all = await fetchAllOrdersFromSheet()
  const orders = all.filter((order) =>
    matchesCurrentWeek(order.fulfillmentLabel, ctx.fulfillmentDate, ctx.batchLabel)
  )

  return {
    batchLabel: ctx.batchLabel,
    fulfillmentDate: ctx.fulfillmentDate,
    orders,
  }
}

export async function fetchCurrentWeekOrderLineItems(): Promise<{
  batchLabel: string
  fulfillmentDate: string
  lineItems: AdminOrderLineRow[]
}> {
  const ctx = getWeeklyFulfillmentContext()
  const all = await fetchAllOrderLineItemsFromSheet()
  const lineItems = all.filter((line) =>
    matchesCurrentWeek(line.fulfillmentLabel, ctx.fulfillmentDate, ctx.batchLabel)
  )

  return {
    batchLabel: ctx.batchLabel,
    fulfillmentDate: ctx.fulfillmentDate,
    lineItems,
  }
}

export async function fetchCurrentWeekAdminData(): Promise<{
  batchLabel: string
  fulfillmentDate: string
  orders: AdminOrderRow[]
  lineItems: AdminOrderLineRow[]
}> {
  const ctx = getWeeklyFulfillmentContext()
  const [allOrders, allLineItems] = await Promise.all([
    fetchAllOrdersFromSheet(),
    fetchAllOrderLineItemsFromSheet(),
  ])

  const matches = (fulfillmentLabel: string) =>
    matchesCurrentWeek(
      fulfillmentLabel,
      ctx.fulfillmentDate,
      ctx.batchLabel
    )

  return {
    batchLabel: ctx.batchLabel,
    fulfillmentDate: ctx.fulfillmentDate,
    orders: allOrders.filter((order) => matches(order.fulfillmentLabel)),
    lineItems: allLineItems.filter((line) => matches(line.fulfillmentLabel)),
  }
}

function columnLetter(index: number): string {
  let n = index + 1
  let letters = ""
  while (n > 0) {
    const rem = (n - 1) % 26
    letters = String.fromCharCode(65 + rem) + letters
    n = Math.floor((n - 1) / 26)
  }
  return letters
}

async function updateLineItemStatuses(
  client: NonNullable<ReturnType<typeof getSheetsClient>>,
  internalRef: string,
  status: string
): Promise<void> {
  const tab = sheetTabFromRange(client.lineItemsRange)
  const res = await client.sheets.spreadsheets.values.get({
    spreadsheetId: client.spreadsheetId,
    range: `${tab}!A2:M`,
  })

  const values = (res.data.values as string[][]) ?? []
  const data: { range: string; values: string[][] }[] = []

  for (let i = 0; i < values.length; i++) {
    const row = values[i]
    const ref = (row?.[2] ?? "").trim()
    if (ref !== internalRef) continue
    data.push({
      range: `${tab}!M${i + 2}`,
      values: [[status]],
    })
  }

  if (data.length === 0) return

  await client.sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: client.spreadsheetId,
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data,
    },
  })
}

export async function updateOrderStatusInSheet(
  sheetRow: number,
  status: string,
  internalRef: string
): Promise<void> {
  const client = getSheetsClient()
  if (!client) {
    throw new Error("Google Sheets is not configured.")
  }

  const tab = sheetTabFromRange(client.ordersRange)
  const statusCol = columnLetter(17)

  await client.sheets.spreadsheets.values.update({
    spreadsheetId: client.spreadsheetId,
    range: `${tab}!${statusCol}${sheetRow}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[status]] },
  })

  if (internalRef.trim()) {
    await updateLineItemStatuses(client, internalRef.trim(), status)
  }
}

export async function findOrderByInternalRef(
  internalRef: string
): Promise<AdminOrderRow | undefined> {
  const all = await fetchAllOrdersFromSheet()
  return all.find((o) => o.internalRef === internalRef.trim())
}
