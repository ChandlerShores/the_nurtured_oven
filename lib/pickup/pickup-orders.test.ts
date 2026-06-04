import { describe, it } from "node:test"
import assert from "node:assert/strict"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"
import {
  isActivePickupStop,
  isPaidPickupOrder,
  isPickupOrder,
} from "@/lib/pickup/pickup-orders"

function baseOrder(overrides: Partial<AdminOrderRow>): AdminOrderRow {
  return {
    sheetRow: 2,
    orderedAt: "",
    customerName: "Alex",
    customerEmail: "a@example.com",
    customerPhone: "",
    fulfillmentLabel: "2026-06-05",
    itemsSummary: "Cookies",
    totalQuantity: "1",
    fulfillmentMethod: "pickup",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryZip: "",
    dietary: "",
    message: "",
    paymentStatus: "paid",
    internalRef: "TNO-1",
    squareOrderId: "sq-1",
    receiptUrl: "",
    amount: "$20",
    orderStatus: "Ready",
    routeOrder: null,
    routeBatchId: "",
    ...overrides,
  }
}

describe("pickup orders", () => {
  it("detects pickup and paid pickup", () => {
    const order = baseOrder({})
    assert.equal(isPickupOrder(order), true)
    assert.equal(isPaidPickupOrder(order), true)
  })

  it("treats delivered pickup as inactive", () => {
    assert.equal(
      isActivePickupStop("Delivered / Picked Up"),
      false
    )
    assert.equal(isActivePickupStop("Ready"), true)
  })
})
