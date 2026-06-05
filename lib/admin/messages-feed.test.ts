import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  buildMessageFeed,
  classifyEmailDeliveryStatus,
  messageMatchesSearch,
} from "@/lib/admin/messages-feed"
import type { CustomerEmailLogRow } from "@/lib/google-sheets/customer-emails"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"

function log(partial: Partial<CustomerEmailLogRow>): CustomerEmailLogRow {
  return {
    timestamp: "6/6/2026, 10:00 AM",
    internalRef: "TNO-1",
    squareOrderId: "",
    customerName: "Jane",
    customerEmail: "jane@example.com",
    emailType: "Ready for Pickup",
    subject: "Ready",
    message: "Your order is ready",
    sentStatus: "Sent",
    resendMessageId: "",
    ...partial,
  }
}

function order(ref: string): AdminOrderRow {
  return {
    sheetRow: 2,
    orderedAt: "",
    customerName: "Jane",
    customerEmail: "jane@example.com",
    customerPhone: "",
    fulfillmentLabel: "Fri 6/6",
    itemsSummary: "",
    totalQuantity: "",
    fulfillmentMethod: "pickup",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryZip: "",
    dietary: "",
    message: "",
    paymentStatus: "paid",
    internalRef: ref,
    squareOrderId: "",
    receiptUrl: "",
    amount: "20",
    orderStatus: "Ready",
    routeOrder: null,
    routeBatchId: "",
  }
}

describe("messages feed", () => {
  it("classifies delivery status from sentStatus", () => {
    assert.equal(classifyEmailDeliveryStatus("Sent"), "sent")
    assert.equal(classifyEmailDeliveryStatus("Failed: timeout"), "failed")
    assert.equal(
      classifyEmailDeliveryStatus("Skipped (Resend not configured)"),
      "skipped"
    )
  })

  it("filters logs to orders in the selected week", () => {
    const feed = buildMessageFeed(
      [log({ internalRef: "TNO-1" }), log({ internalRef: "TNO-OTHER" })],
      [order("TNO-1")]
    )
    assert.equal(feed.length, 1)
    assert.equal(feed[0].log.internalRef, "TNO-1")
  })

  it("matches search across customer and subject", () => {
    const item = buildMessageFeed([log({ subject: "Pickup today" })], [
      order("TNO-1"),
    ])[0]
    assert.equal(messageMatchesSearch(item, "pickup"), true)
    assert.equal(messageMatchesSearch(item, "zzz"), false)
  })
})
