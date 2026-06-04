import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  isPaidDeliveryOrder,
  isRoutablePaidDeliveryOrder,
} from "@/lib/delivery/delivery-orders"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"

function sampleOrder(overrides: Partial<AdminOrderRow> = {}): AdminOrderRow {
  return {
    sheetRow: 2,
    orderedAt: "",
    customerName: "Alex",
    customerEmail: "",
    customerPhone: "",
    fulfillmentLabel: "Friday 6/6",
    itemsSummary: "Loaf x1",
    totalQuantity: "1",
    fulfillmentMethod: "delivery",
    deliveryAddress: "123 Main St",
    deliveryCity: "Georgetown",
    deliveryZip: "40324",
    dietary: "",
    message: "",
    paymentStatus: "Paid",
    internalRef: "TNO-2026-06-06-ABC23",
    squareOrderId: "sq-1",
    receiptUrl: "",
    amount: "12.00",
    orderStatus: "New",
    routeOrder: null,
    routeBatchId: "",
    ...overrides,
  }
}

describe("delivery order filters", () => {
  it("accepts paid delivery orders", () => {
    assert.equal(isPaidDeliveryOrder(sampleOrder()), true)
  })

  it("rejects unpaid pickup orders", () => {
    assert.equal(
      isPaidDeliveryOrder(
        sampleOrder({
          fulfillmentMethod: "pickup",
          paymentStatus: "Pending",
        })
      ),
      false
    )
  })

  it("requires address for routable stops", () => {
    assert.equal(isRoutablePaidDeliveryOrder(sampleOrder()), true)
    assert.equal(
      isRoutablePaidDeliveryOrder(sampleOrder({ deliveryAddress: "" })),
      false
    )
    assert.equal(
      isRoutablePaidDeliveryOrder(sampleOrder({ deliveryZip: "" })),
      false
    )
  })
})
