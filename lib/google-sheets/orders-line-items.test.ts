import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { orderLineItemDedupeKey } from "@/lib/google-sheets/orders"

describe("orderLineItemDedupeKey", () => {
  it("prefers normalized slug over display name", () => {
    assert.equal(
      orderLineItemDedupeKey({ slug: " Brownie-Box ", name: "Brownies" }),
      "slug:brownie-box"
    )
  })

  it("falls back to normalized name when slug is absent", () => {
    assert.equal(
      orderLineItemDedupeKey({ name: " Lemon Bars " }),
      "name:lemon bars"
    )
  })
})
