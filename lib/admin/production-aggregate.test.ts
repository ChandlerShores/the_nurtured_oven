import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  aggregateProductionFromLineItems,
  aggregateProductionFromOrderHeaders,
  buildDeliveryItemTotals,
  buildProductionList,
  totalBakeQuantity,
} from "@/lib/admin/production-aggregate"
import type { AdminOrderLineRow, AdminOrderRow } from "@/lib/google-sheets/orders"

function line(
  partial: Partial<AdminOrderLineRow> & Pick<AdminOrderLineRow, "internalRef" | "name" | "quantity">
): AdminOrderLineRow {
  return {
    sheetRow: 2,
    orderedAt: "",
    fulfillmentLabel: "Friday 6/6",
    squareOrderId: "",
    customerName: "",
    slug: "",
    category: "",
    unitPriceCents: 0,
    lineTotalCents: 0,
    fulfillmentMethod: "pickup",
    orderStatus: "New",
    ...partial,
  }
}

describe("aggregateProductionFromLineItems", () => {
  it("sums quantity by slug", () => {
    const result = aggregateProductionFromLineItems([
      line({ internalRef: "a", slug: "sourdough", name: "Sourdough", quantity: 2 }),
      line({
        internalRef: "b",
        slug: "sourdough",
        name: "Sourdough Loaf",
        quantity: 1,
      }),
    ])
    assert.deepEqual(result, [{ name: "Sourdough", qty: 3 }])
  })

  it("falls back to name key when slug missing", () => {
    const result = aggregateProductionFromLineItems([
      line({ internalRef: "a", slug: "", name: "Brownie", quantity: 2 }),
      line({ internalRef: "b", slug: "", name: "brownie", quantity: 1 }),
    ])
    assert.deepEqual(result, [{ name: "Brownie", qty: 3 }])
  })
})

describe("buildProductionList", () => {
  it("uses line items and skips header parse for covered orders", () => {
    const orders: AdminOrderRow[] = [
      {
        sheetRow: 2,
        orderedAt: "",
        customerName: "A",
        customerEmail: "",
        customerPhone: "",
        fulfillmentLabel: "Friday",
        itemsSummary: "Wrong summary x99",
        totalQuantity: "99",
        fulfillmentMethod: "pickup",
        deliveryAddress: "",
        deliveryCity: "",
        deliveryZip: "",
        dietary: "",
        message: "",
        paymentStatus: "Paid",
        internalRef: "ref-1",
        squareOrderId: "",
        receiptUrl: "",
        amount: "10",
        orderStatus: "New",
        routeOrder: null,
        routeBatchId: "",
      },
    ]
    const lineItems = [
      line({ internalRef: "ref-1", slug: "cookie", name: "Cookie", quantity: 2 }),
    ]
    const list = buildProductionList(orders, lineItems)
    assert.deepEqual(list, [{ name: "Cookie", qty: 2 }])
    assert.equal(totalBakeQuantity(list), 2)
  })

  it("parses headers only for orders without line rows", () => {
    const orders: AdminOrderRow[] = [
      {
        sheetRow: 3,
        orderedAt: "",
        customerName: "B",
        customerEmail: "",
        customerPhone: "",
        fulfillmentLabel: "Friday",
        itemsSummary: "Muffin x2; Cookie x1",
        totalQuantity: "3",
        fulfillmentMethod: "pickup",
        deliveryAddress: "",
        deliveryCity: "",
        deliveryZip: "",
        dietary: "",
        message: "",
        paymentStatus: "Paid",
        internalRef: "legacy",
        squareOrderId: "",
        receiptUrl: "",
        amount: "15",
        orderStatus: "New",
        routeOrder: null,
        routeBatchId: "",
      },
    ]
    const list = buildProductionList(orders, [])
    assert.ok(list.some((i) => i.name === "Muffin" && i.qty === 2))
    assert.ok(list.some((i) => i.name === "Cookie" && i.qty === 1))
  })
})

describe("aggregateProductionFromOrderHeaders", () => {
  it("parses semicolon-separated summaries", () => {
    const result = aggregateProductionFromOrderHeaders([
      {
        sheetRow: 2,
        orderedAt: "",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        fulfillmentLabel: "",
        itemsSummary: "Loaf x1; Roll x2",
        totalQuantity: "3",
        fulfillmentMethod: "",
        deliveryAddress: "",
        deliveryCity: "",
        deliveryZip: "",
        dietary: "",
        message: "",
        paymentStatus: "",
        internalRef: "x",
        squareOrderId: "",
        receiptUrl: "",
        amount: "",
        orderStatus: "New",
        routeOrder: null,
        routeBatchId: "",
      },
    ])
    assert.ok(result.some((i) => i.name === "Loaf" && i.qty === 1))
    assert.ok(result.some((i) => i.name === "Roll" && i.qty === 2))
  })
})

describe("buildDeliveryItemTotals", () => {
  it("totals items for active paid delivery stops only", () => {
    const orders: AdminOrderRow[] = [
      {
        sheetRow: 2,
        orderedAt: "",
        customerName: "Delivery A",
        customerEmail: "",
        customerPhone: "",
        fulfillmentLabel: "Friday",
        itemsSummary: "",
        totalQuantity: "2",
        fulfillmentMethod: "delivery",
        deliveryAddress: "1 Main",
        deliveryCity: "Lexington",
        deliveryZip: "40503",
        dietary: "",
        message: "",
        paymentStatus: "Paid",
        internalRef: "del-1",
        squareOrderId: "",
        receiptUrl: "",
        amount: "20",
        orderStatus: "New",
        routeOrder: null,
        routeBatchId: "",
      },
      {
        sheetRow: 3,
        orderedAt: "",
        customerName: "Pickup",
        customerEmail: "",
        customerPhone: "",
        fulfillmentLabel: "Friday",
        itemsSummary: "",
        totalQuantity: "9",
        fulfillmentMethod: "pickup",
        deliveryAddress: "",
        deliveryCity: "",
        deliveryZip: "",
        dietary: "",
        message: "",
        paymentStatus: "Paid",
        internalRef: "pick-1",
        squareOrderId: "",
        receiptUrl: "",
        amount: "20",
        orderStatus: "New",
        routeOrder: null,
        routeBatchId: "",
      },
      {
        sheetRow: 4,
        orderedAt: "",
        customerName: "Delivered",
        customerEmail: "",
        customerPhone: "",
        fulfillmentLabel: "Friday",
        itemsSummary: "",
        totalQuantity: "5",
        fulfillmentMethod: "delivery",
        deliveryAddress: "2 Main",
        deliveryCity: "Georgetown",
        deliveryZip: "40324",
        dietary: "",
        message: "",
        paymentStatus: "Paid",
        internalRef: "done-1",
        squareOrderId: "",
        receiptUrl: "",
        amount: "20",
        orderStatus: "Delivered / Picked Up",
        routeOrder: null,
        routeBatchId: "",
      },
    ]
    const lineItems = [
      line({ internalRef: "del-1", slug: "cookie", name: "Cookie", quantity: 2 }),
      line({ internalRef: "pick-1", slug: "roll", name: "Roll", quantity: 9 }),
      line({ internalRef: "done-1", slug: "bar", name: "Bar", quantity: 5 }),
    ]

    const list = buildDeliveryItemTotals(orders, lineItems)
    assert.deepEqual(list, [{ name: "Cookie", qty: 2 }])
    assert.equal(totalBakeQuantity(list), 2)
  })
})
