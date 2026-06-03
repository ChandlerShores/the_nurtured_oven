import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { fulfillmentPolicy } from "@/lib/content/fulfillment"
import {
  calculateOrderTotalCentsFromCatalog,
  calculateSubtotalCentsFromCatalog,
  getDeliveryFeeCents,
} from "@/lib/order/cart-totals"
import { getWeeklyCatalogFallback } from "@/lib/order/catalog-build"

const catalog = getWeeklyCatalogFallback()
const feeOptions = {
  freeDeliveryMinimumCents: fulfillmentPolicy.freeDeliveryMinimumCents,
  deliveryFeeCents: fulfillmentPolicy.deliveryFeeCents,
}

describe("delivery fee", () => {
  it("charges $7 delivery under $40 subtotal", () => {
    const items = [{ slug: "marshmallow-cloud-bar", quantity: 2 }]
    const subtotal = calculateSubtotalCentsFromCatalog(items, catalog)
    assert.equal(subtotal, 3200)
    assert.equal(
      getDeliveryFeeCents(
        subtotal,
        "delivery",
        feeOptions.freeDeliveryMinimumCents,
        feeOptions.deliveryFeeCents
      ),
      700
    )
  })

  it("waives delivery at $40+ subtotal", () => {
    const items = [{ slug: "cinnamon-rolls", quantity: 2 }]
    const subtotal = calculateSubtotalCentsFromCatalog(items, catalog)
    assert.equal(subtotal, 4200)
    assert.equal(
      getDeliveryFeeCents(
        subtotal,
        "delivery",
        feeOptions.freeDeliveryMinimumCents,
        feeOptions.deliveryFeeCents
      ),
      0
    )
  })

  it("no delivery fee for pickup", () => {
    assert.equal(
      getDeliveryFeeCents(
        2100,
        "pickup",
        feeOptions.freeDeliveryMinimumCents,
        feeOptions.deliveryFeeCents
      ),
      0
    )
  })

  it("totals include delivery fee when applicable", () => {
    const items = [{ slug: "marshmallow-cloud-bar", quantity: 1 }]
    const totals = calculateOrderTotalCentsFromCatalog(
      items,
      "delivery",
      catalog,
      feeOptions
    )
    assert.equal(totals.subtotalCents, 1600)
    assert.equal(totals.deliveryFeeCents, 700)
    assert.equal(totals.totalCents, 2300)
  })
})
