import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  calculateSubtotalCents,
  getDeliveryFeeCents,
  calculateOrderTotalCents,
} from "@/lib/order/delivery-fee"

describe("delivery fee", () => {
  it("charges $7 delivery under $40 subtotal", () => {
    const items = [{ slug: "marshmallow-cloud-bar", quantity: 2 }]
    const subtotal = calculateSubtotalCents(items)
    assert.equal(subtotal, 3200)
    assert.equal(getDeliveryFeeCents(subtotal, "delivery"), 700)
  })

  it("waives delivery at $40+ subtotal", () => {
    const items = [{ slug: "cinnamon-rolls", quantity: 2 }]
    const subtotal = calculateSubtotalCents(items)
    assert.equal(subtotal, 4200)
    assert.equal(getDeliveryFeeCents(subtotal, "delivery"), 0)
  })

  it("no delivery fee for pickup", () => {
    assert.equal(getDeliveryFeeCents(2100, "pickup"), 0)
  })

  it("totals include delivery fee when applicable", () => {
    const items = [{ slug: "marshmallow-cloud-bar", quantity: 1 }]
    const totals = calculateOrderTotalCents(items, "delivery")
    assert.equal(totals.subtotalCents, 1600)
    assert.equal(totals.deliveryFeeCents, 700)
    assert.equal(totals.totalCents, 2300)
  })
})
