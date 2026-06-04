import "server-only"

import {
  GOOGLE_SHEETS_REQUEST_TIMEOUT_MS,
  getSheetsClient,
  sheetTabFromRange,
} from "@/lib/google-sheets/client"
import {
  fetchAllOrdersFromSheet,
  matchesFulfillmentWeek,
  type AdminOrderRow,
} from "@/lib/google-sheets/orders"
import { formatBatchLabel } from "@/lib/order/weekly-fulfillment"
import type { DeliveryRouteStop } from "@/lib/delivery/route-types"

const ROUTE_ORDER_COL = "T"
const ROUTE_BATCH_COL = "U"

export function adminOrderToRouteStop(order: AdminOrderRow): DeliveryRouteStop {
  return {
    sheetRow: order.sheetRow,
    internalRef: order.internalRef,
    squareOrderId: order.squareOrderId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    deliveryAddress: order.deliveryAddress,
    deliveryCity: order.deliveryCity,
    deliveryZip: order.deliveryZip,
    itemsSummary: order.itemsSummary,
    orderStatus: order.orderStatus,
    lat: null,
    lng: null,
    routeOrder: order.routeOrder,
    routeBatchId: order.routeBatchId,
  }
}

export async function fetchPaidDeliveryOrdersForDate(
  fulfillmentDate: string
): Promise<{
  batchLabel: string
  orders: AdminOrderRow[]
}> {
  const parts = fulfillmentDate.split("-").map(Number)
  const batchLabel =
    parts.length === 3
      ? formatBatchLabel(parts[0]!, parts[1]!, parts[2]!)
      : fulfillmentDate

  const all = await fetchAllOrdersFromSheet()
  const orders = all.filter((order) =>
    matchesFulfillmentWeek(order.fulfillmentLabel, fulfillmentDate, batchLabel)
  )

  return { batchLabel, orders }
}

export async function lockDeliveryRouteInSheet(input: {
  routeBatchId: string
  stops: { sheetRow: number; sequence: number }[]
}): Promise<number> {
  const client = getSheetsClient()
  if (!client) {
    throw new Error("Google Sheets is not configured.")
  }

  const tab = sheetTabFromRange(client.ordersRange)
  const data = input.stops.flatMap(({ sheetRow, sequence }) => [
    {
      range: `${tab}!${ROUTE_ORDER_COL}${sheetRow}`,
      values: [[String(sequence)]],
    },
    {
      range: `${tab}!${ROUTE_BATCH_COL}${sheetRow}`,
      values: [[input.routeBatchId]],
    },
  ])

  if (data.length === 0) return 0

  await client.sheets.spreadsheets.values.batchUpdate(
    {
      spreadsheetId: client.spreadsheetId,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data,
      },
    },
    {
      timeout: GOOGLE_SHEETS_REQUEST_TIMEOUT_MS,
    }
  )

  return input.stops.length
}
