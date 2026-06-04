import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  calculateOrderTotalCentsFromCatalog,
  calculateSubtotalCentsFromCatalog,
  getDeliveryFeeCents,
} from "@/lib/order/cart-totals"
import { getWeeklyCatalogFallback } from "@/lib/order/catalog-build"

const catalog = getWeeklyCatalogFallback()

describe("delivery fee", () => {
  it("charges $7 standard Lexington under $40 subtotal", () => {
    const items = [{ slug: "marshmallow-cloud-bar", quantity: 2 }]
    const subtotal = calculateSubtotalCentsFromCatalog(items, catalog)
    assert.equal(subtotal, 3200)
    assert.equal(
      getDeliveryFeeCents(subtotal, "delivery", {
        deliveryCity: "Lexington",
        deliveryZip: "40503",
      }),
      700
    )
  })

  it("waives standard Lexington delivery at $40+ subtotal", () => {
    const items = [{ slug: "cinnamon-rolls", quantity: 2 }]
    const subtotal = calculateSubtotalCentsFromCatalog(items, catalog)
    assert.equal(subtotal, 4200)
    assert.equal(
      getDeliveryFeeCents(subtotal, "delivery", {
        deliveryCity: "Lexington",
        deliveryZip: "40503",
      }),
      0
    )
  })

  it("no delivery fee for pickup", () => {
    assert.equal(
      getDeliveryFeeCents(
        2100,
        "pickup",
        { deliveryCity: "Lexington", deliveryZip: "40503" }
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
      { deliveryCity: "Lexington", deliveryZip: "40503" }
    )
    assert.equal(totals.subtotalCents, 1600)
    assert.equal(totals.deliveryFeeCents, 700)
    assert.equal(totals.totalCents, 2300)
  })
})
