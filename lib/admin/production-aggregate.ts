import type { AdminOrderLineRow, AdminOrderRow } from "@/lib/google-sheets/orders"
import {
  isActiveDeliveryStop,
  isPaidDeliveryOrder,
} from "@/lib/delivery/delivery-orders"

export interface ItemQuantity {
  name: string
  qty: number
}

function mergeItemQuantities(rows: ItemQuantity[]): ItemQuantity[] {
  const map = new Map<string, number>()
  for (const { name, qty } of rows) {
    const key = name.trim()
    if (!key) continue
    map.set(key, (map.get(key) ?? 0) + qty)
  }
  return Array.from(map.entries())
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
}

function lineItemGroupKey(line: AdminOrderLineRow): string {
  const slug = line.slug.trim()
  if (slug) return `slug:${slug}`
  const name = line.name.trim().toLowerCase()
  return name ? `name:${name}` : ""
}

function parseItemsFromSummary(summary: string): ItemQuantity[] {
  const items: ItemQuantity[] = []
  for (const part of summary.split(/[,;]+/)) {
    const trimmed = part.trim()
    if (!trimmed) continue

    const qtyFirst = trimmed.match(/^(\d+)\s*[x×]?\s*(.+)$/i)
    if (qtyFirst) {
      const qty = Number(qtyFirst[1])
      const name = (qtyFirst[2] ?? "").trim()
      if (name && qty > 0) items.push({ name, qty })
      continue
    }

    const nameFirst = trimmed.match(/^(.+?)\s*[x×]\s*(\d+)$/i)
    if (nameFirst) {
      const name = (nameFirst[1] ?? "").trim()
      const qty = Number(nameFirst[2])
      if (name && qty > 0) items.push({ name, qty })
      continue
    }

    items.push({ name: trimmed, qty: 1 })
  }
  return items
}

/** Roll up bake quantities from structured Order Line Items rows. */
export function aggregateProductionFromLineItems(
  lineItems: AdminOrderLineRow[]
): ItemQuantity[] {
  const qtyByKey = new Map<string, number>()
  const nameByKey = new Map<string, string>()

  for (const line of lineItems) {
    const key = lineItemGroupKey(line)
    if (!key) continue
    qtyByKey.set(key, (qtyByKey.get(key) ?? 0) + line.quantity)
    if (!nameByKey.has(key)) {
      nameByKey.set(key, line.name.trim() || line.slug.trim())
    }
  }

  const rows: ItemQuantity[] = []
  for (const [key, qty] of Array.from(qtyByKey.entries())) {
    const name = nameByKey.get(key)
    if (name) rows.push({ name, qty })
  }
  return rows.sort((a, b) => b.qty - a.qty)
}

/** Legacy fallback when an order has no rows in Order Line Items. */
export function aggregateProductionFromOrderHeaders(
  orders: AdminOrderRow[]
): ItemQuantity[] {
  const parsed: ItemQuantity[] = []
  for (const order of orders) {
    const qty = Number(order.totalQuantity)
    const fromSummary = parseItemsFromSummary(order.itemsSummary)
    if (fromSummary.length > 0) {
      parsed.push(...fromSummary)
      continue
    }
    if (order.itemsSummary.trim()) {
      parsed.push({
        name: order.itemsSummary.trim(),
        qty: Number.isFinite(qty) && qty > 0 ? qty : 1,
      })
    }
  }
  return mergeItemQuantities(parsed)
}

/**
 * Prefer Order Line Items; only parse order headers for orders missing line rows.
 */
export function buildProductionList(
  orders: AdminOrderRow[],
  lineItems: AdminOrderLineRow[]
): ItemQuantity[] {
  const refsWithLines = new Set(
    lineItems.map((l) => l.internalRef).filter(Boolean)
  )
  const fromLines = aggregateProductionFromLineItems(lineItems)
  const headerOnlyOrders = orders.filter(
    (o) => o.internalRef && !refsWithLines.has(o.internalRef)
  )
  if (headerOnlyOrders.length === 0) {
    return fromLines
  }
  return mergeItemQuantities([
    ...fromLines,
    ...aggregateProductionFromOrderHeaders(headerOnlyOrders),
  ])
}

export function totalBakeQuantity(productionList: ItemQuantity[]): number {
  return productionList.reduce((sum, item) => sum + item.qty, 0)
}

/** Paid delivery stops still on the route (not yet delivered). */
export function filterActiveDeliveryOrders(
  orders: AdminOrderRow[]
): AdminOrderRow[] {
  return orders.filter(
    (order) =>
      isPaidDeliveryOrder(order) &&
      isActiveDeliveryStop(order.orderStatus) &&
      order.fulfillmentMethod.trim().toLowerCase() === "delivery"
  )
}

/** Item totals for active paid delivery stops this week. */
export function buildDeliveryItemTotals(
  orders: AdminOrderRow[],
  lineItems: AdminOrderLineRow[]
): ItemQuantity[] {
  const activeOrders = filterActiveDeliveryOrders(orders)
  const refs = new Set(
    activeOrders.map((order) => order.internalRef).filter(Boolean)
  )
  const activeLines = lineItems.filter(
    (line) => line.internalRef && refs.has(line.internalRef)
  )
  return buildProductionList(activeOrders, activeLines)
}
