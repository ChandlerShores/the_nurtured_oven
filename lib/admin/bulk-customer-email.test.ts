import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { buildBulkEmailPreview } from "@/lib/admin/bulk-customer-email"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"

function order(partial: Partial<AdminOrderRow> & { internalRef: string }): AdminOrderRow {
  return {
    sheetRow: 2,
    orderedAt: "",
    customerName: "Jane",
    customerEmail: "jane@example.com",
    customerPhone: "",
    fulfillmentLabel: "Friday 6/6",
    itemsSummary: "Cookies",
    totalQuantity: "1",
    fulfillmentMethod: "pickup",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryZip: "",
    dietary: "",
    message: "",
    paymentStatus: "Paid",
    squareOrderId: "",
    receiptUrl: "",
    amount: "20",
    orderStatus: "Ready",
    routeOrder: null,
    routeBatchId: "",
    ...partial,
  }
}

describe("buildBulkEmailPreview", () => {
  it("flags already-sent orders from history", () => {
    const preview = buildBulkEmailPreview(
      [order({ internalRef: "TNO-1" })],
      "ready_pickup",
      [
        {
          timestamp: "",
          internalRef: "TNO-1",
          squareOrderId: "",
          customerName: "Jane",
          customerEmail: "jane@example.com",
          emailType: "Ready for Pickup",
          subject: "",
          message: "",
          sentStatus: "Sent",
          resendMessageId: "",
        },
      ]
    )
    assert.equal(preview?.sendCount, 0)
    assert.equal(preview?.alreadySent.length, 1)
  })

  it("includes eligible ready pickup orders", () => {
    const preview = buildBulkEmailPreview(
      [order({ internalRef: "TNO-2" })],
      "ready_pickup",
      []
    )
    assert.equal(preview?.sendCount, 1)
    assert.equal(preview?.eligible[0]?.internalRef, "TNO-2")
  })
})
