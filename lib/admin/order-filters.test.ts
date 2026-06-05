import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { orderMatchesSearch } from "@/lib/admin/order-filters"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"

function sampleOrder(overrides: Partial<AdminOrderRow> = {}): AdminOrderRow {
  return {
    sheetRow: 2,
    orderedAt: "",
    customerName: "Jane Doe",
    customerEmail: "jane@example.com",
    customerPhone: "555-0100",
    fulfillmentLabel: "Friday",
    itemsSummary: "Oatmeal cookie x2",
    totalQuantity: "2",
    fulfillmentMethod: "delivery",
    deliveryAddress: "1 Main St",
    deliveryCity: "Lexington",
    deliveryZip: "40503",
    dietary: "",
    message: "",
    paymentStatus: "Paid",
    internalRef: "TNO-2026-06-05-ABC12",
    squareOrderId: "",
    receiptUrl: "",
    amount: "24",
    orderStatus: "New",
    routeOrder: null,
    routeBatchId: "",
    ...overrides,
  }
}

describe("orderMatchesSearch", () => {
  it("matches customer name and city tokens", () => {
    const order = sampleOrder()
    assert.equal(orderMatchesSearch(order, "jane lexington"), true)
    assert.equal(orderMatchesSearch(order, "pickup"), false)
  })

  it("matches internal ref fragment", () => {
    assert.equal(orderMatchesSearch(sampleOrder(), "abc12"), true)
  })

  it("returns all orders when query empty", () => {
    assert.equal(orderMatchesSearch(sampleOrder(), ""), true)
    assert.equal(orderMatchesSearch(sampleOrder(), "   "), true)
  })
})
