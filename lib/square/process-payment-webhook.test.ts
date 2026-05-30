import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  isPaymentWebhookEvent,
  type SquareWebhookEvent,
} from "@/lib/square/process-payment-webhook"

describe("process-payment-webhook helpers", () => {
  it("recognizes payment webhook event types", () => {
    assert.equal(isPaymentWebhookEvent("payment.created"), true)
    assert.equal(isPaymentWebhookEvent("payment.updated"), true)
    assert.equal(isPaymentWebhookEvent("order.created"), false)
  })

  it("types a minimal payment.updated payload", () => {
    const event: SquareWebhookEvent = {
      type: "payment.updated",
      data: {
        object: {
          payment: {
            id: "pay_123",
            status: "COMPLETED",
            order_id: "order_123",
          },
        },
      },
    }

    assert.equal(event.data?.object?.payment?.id, "pay_123")
  })
})
