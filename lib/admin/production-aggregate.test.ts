import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  aggregateProductionFromLineItems,
  aggregateProductionFromOrderHeaders,
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
        dietary: "",
        message: "",
        paymentStatus: "Paid",
        internalRef: "ref-1",
        squareOrderId: "",
        receiptUrl: "",
        amount: "10",
        orderStatus: "New",
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
        dietary: "",
        message: "",
        paymentStatus: "Paid",
        internalRef: "legacy",
        squareOrderId: "",
        receiptUrl: "",
        amount: "15",
        orderStatus: "New",
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
        dietary: "",
        message: "",
        paymentStatus: "",
        internalRef: "x",
        squareOrderId: "",
        receiptUrl: "",
        amount: "",
        orderStatus: "New",
      },
    ])
    assert.ok(result.some((i) => i.name === "Loaf" && i.qty === 1))
    assert.ok(result.some((i) => i.name === "Roll" && i.qty === 2))
  })
})
