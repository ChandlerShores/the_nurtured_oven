import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  getFulfillmentRecoveryPlan,
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

  it("writes the sheet before email for new fulfillment", () => {
    assert.deepEqual(getFulfillmentRecoveryPlan("processing"), {
      writeSheet: true,
      sendEmail: true,
    })
  })

  it("recovers legacy emails_sent payments by writing the sheet without resending email", () => {
    assert.deepEqual(getFulfillmentRecoveryPlan("emails_sent"), {
      writeSheet: true,
      sendEmail: false,
    })
  })

  it("recovers sheet_written payments by sending email without duplicating sheet rows", () => {
    assert.deepEqual(getFulfillmentRecoveryPlan("sheet_written"), {
      writeSheet: false,
      sendEmail: true,
    })
  })

  it("does not rerun side effects for completed payments", () => {
    assert.deepEqual(getFulfillmentRecoveryPlan("completed"), {
      writeSheet: false,
      sendEmail: false,
    })
  })
})
