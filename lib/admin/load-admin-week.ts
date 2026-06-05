import {
  filterLineItemsForWeek,
  filterOrdersForWeek,
  listFulfillmentWeekOptions,
  operationalFulfillmentWeekKey,
  resolveSelectedFulfillmentWeek,
} from "@/lib/admin/fulfillment-weeks"
import type { FulfillmentWeekOption } from "@/lib/admin/financial-stats-types"
import {
  fetchAllAdminData,
  type AdminOrderLineRow,
  type AdminOrderRow,
} from "@/lib/google-sheets/orders"

export interface AdminWeekLoadResult {
  weekOptions: FulfillmentWeekOption[]
  selectedWeek: FulfillmentWeekOption
  currentWeekKey: string
  batchLabel: string
  fulfillmentDate: string
  orders: AdminOrderRow[]
  lineItems: AdminOrderLineRow[]
}

export async function loadAdminWeekData(
  weekKey?: string
): Promise<AdminWeekLoadResult> {
  const { orders: allOrders, lineItems: allLineItems } =
    await fetchAllAdminData()
  const weekOptions = listFulfillmentWeekOptions(allOrders)
  const currentWeekKey = operationalFulfillmentWeekKey()
  const selectedWeek = resolveSelectedFulfillmentWeek(weekOptions, weekKey)

  return {
    weekOptions,
    selectedWeek,
    currentWeekKey,
    batchLabel: selectedWeek.batchLabel,
    fulfillmentDate: selectedWeek.fulfillmentDate,
    orders: filterOrdersForWeek(allOrders, selectedWeek),
    lineItems: filterLineItemsForWeek(allLineItems, selectedWeek),
  }
}
