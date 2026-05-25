import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  formatCustomerPaidOrderBody,
  formatCustomerPaidOrderSubject,
  formatOwnerPaidOrderBody,
  formatOwnerPaidOrderSubject,
} from "@/lib/email/paid-order-email"
import { buildCustomerPaidOrderEmail } from "@/lib/email/html/paid-order-html"
import type { PaidOrderDetails } from "@/lib/order/paid-order-details"

const sample: PaidOrderDetails = {
  internalRef: "TNO-2026-05-29-A8F3K2",
  fulfillmentMethod: "delivery",
  fulfillmentDate: "2026-05-29",
  batchLabel: "Friday 5/29",
  customerName: "Jane Doe",
  customerEmail: "jane@example.com",
  customerPhone: "+18595551234",
  lineItems: [
    { name: "Weekly Comfort Box", quantity: 1, slug: "weekly-comfort-box" },
  ],
  deliveryCity: "Georgetown",
  deliveryAddress: "123 Main St",
  dietary: "No nuts",
  amountCents: 4000,
  deliveryFeeCents: 700,
  squareOrderId: "order_123",
  receiptUrl: "https://squareup.com/receipt",
}

describe("paid order emails", () => {
  it("owner subject includes method, batch, and name", () => {
    assert.equal(
      formatOwnerPaidOrderSubject(sample),
      "Paid weekly order — DELIVERY — Friday 5/29 — Jane Doe"
    )
  })

  it("owner body includes ticket fields", () => {
    const body = formatOwnerPaidOrderBody(sample)
    assert.match(body, /Reference: TNO-2026-05-29-A8F3K2/)
    assert.match(body, /Fulfillment date: Friday 5\/29/)
    assert.match(body, /Jane Doe/)
    assert.match(body, /Weekly Comfort Box × 1/)
    assert.match(body, /Delivery address: Georgetown, 123 Main St/)
    assert.match(body, /Square order: order_123/)
  })

  it("customer body confirms fulfillment and items", () => {
    const body = formatCustomerPaidOrderBody(sample, "thenurturedoven@gmail.com")
    assert.match(body, /Hi Jane/)
    assert.match(body, /Friday 5\/29/)
    assert.match(body, /Delivery fee: \$7\.00/)
    assert.match(body, /Reply to this email/)
    assert.match(body, /receipt/i)
    assert.ok(formatCustomerPaidOrderSubject(sample).includes("confirmed"))
  })

  it("customer HTML email includes branded layout and order details", () => {
    const { html } = buildCustomerPaidOrderEmail(
      sample,
      "thenurturedoven@gmail.com"
    )
    assert.match(html, /<!DOCTYPE html>/i)
    assert.match(html, /Your order is confirmed/)
    assert.match(html, /Weekly Comfort Box/)
    assert.match(html, /#F8F4EE/)
  })
})
