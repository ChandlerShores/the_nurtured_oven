import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  bulkStatusSkippedCount,
  previewBulkMarkInProgress,
  previewBulkMarkReady,
} from "@/lib/admin/bulk-order-status"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"

function order(status: string): AdminOrderRow {
  return {
    sheetRow: 2,
    orderedAt: "",
    customerName: "Test",
    customerEmail: "",
    customerPhone: "",
    fulfillmentLabel: "",
    itemsSummary: "",
    totalQuantity: "",
    fulfillmentMethod: "pickup",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryZip: "",
    dietary: "",
    message: "",
    paymentStatus: "paid",
    internalRef: "TNO-1",
    squareOrderId: "",
    receiptUrl: "",
    amount: "10",
    orderStatus: status,
    routeOrder: null,
    routeBatchId: "",
  }
}

describe("previewBulkMarkReady", () => {
  it("includes New and legacy Baking, skips terminal and already Ready", () => {
    const preview = previewBulkMarkReady([
      order("New"),
      order("In progress"),
      order("Baking"),
      order("Ready"),
      order("Delivered / Picked Up"),
      order("Refunded"),
      order("Issue"),
    ])
    assert.equal(preview.eligible.length, 3)
    assert.equal(preview.skippedAlreadyAtTarget.length, 1)
    assert.equal(preview.skippedTerminal.length, 3)
  })
})

describe("previewBulkMarkInProgress", () => {
  it("includes only New orders, skips Ready and terminal", () => {
    const preview = previewBulkMarkInProgress([
      order("New"),
      order("In progress"),
      order("Baking"),
      order("Ready"),
      order("Delivered / Picked Up"),
    ])
    assert.equal(preview.eligible.length, 1)
    assert.equal(preview.skippedAlreadyAtTarget.length, 2)
    assert.equal(preview.skippedAlreadyReady.length, 1)
    assert.equal(preview.skippedTerminal.length, 1)
    assert.equal(bulkStatusSkippedCount(preview), 4)
  })
})
