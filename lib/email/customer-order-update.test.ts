import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { customerFirstName } from "@/lib/email/customer-first-name"
import {
  buildReadyForPickupEmail,
  buildOutForDeliveryEmail,
} from "@/lib/email/customer-order-update"

describe("customerFirstName", () => {
  it("uses first token of customer name", () => {
    assert.equal(customerFirstName("Jamie Lee"), "Jamie")
  })

  it("falls back when name missing", () => {
    assert.equal(customerFirstName(""), "there")
  })
})

describe("customer order update emails", () => {
  const ctx = {
    customerName: "Jamie Lee",
    internalRef: "TNO-2025-06-06-ABC12",
  }

  it("builds ready for pickup subject and reference", () => {
    const email = buildReadyForPickupEmail(ctx)
    assert.equal(email.subject, "Your order is ready for pickup")
    assert.match(email.text, /Jamie/)
    assert.match(email.text, /TNO-2025-06-06-ABC12/)
  })

  it("builds out for delivery subject", () => {
    const email = buildOutForDeliveryEmail(ctx)
    assert.equal(email.subject, "Your order is out for delivery")
    assert.match(email.text, /keep an eye out/i)
  })
})
