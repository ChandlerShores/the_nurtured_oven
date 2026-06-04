import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  GEORGETOWN_SURCHARGE_CENTS,
  EXTENDED_DELIVERY_FEE_CENTS,
  formatDeliveryFeeConfirmationNote,
  getDeliveryFeeCartDisplay,
  quoteDeliveryFee,
  STANDARD_DELIVERY_FEE_CENTS,
} from "@/lib/delivery/delivery-fee-policy"

describe("delivery fee policy", () => {
  it("charges $7 standard Lexington under $40", () => {
    const quote = quoteDeliveryFee({
      subtotalCents: 3200,
      fulfillment: "delivery",
      deliveryCity: "Lexington",
      deliveryZip: "40503",
    })
    assert.equal(quote.feeCents, STANDARD_DELIVERY_FEE_CENTS)
  })

  it("waives standard Lexington at $40+", () => {
    const quote = quoteDeliveryFee({
      subtotalCents: 4200,
      fulfillment: "delivery",
      deliveryCity: "Lexington",
      deliveryZip: "40503",
    })
    assert.equal(quote.feeCents, 0)
  })

  it("charges $12 for extended Lexington zips under $55", () => {
    for (const zip of ["40509", "40515", "40516"]) {
      const quote = quoteDeliveryFee({
        subtotalCents: 4200,
        fulfillment: "delivery",
        deliveryCity: "Lexington",
        deliveryZip: zip,
      })
      assert.equal(quote.feeCents, EXTENDED_DELIVERY_FEE_CENTS, zip)
    }
  })

  it("waives extended Lexington at $55+", () => {
    const quote = quoteDeliveryFee({
      subtotalCents: 5500,
      fulfillment: "delivery",
      deliveryCity: "Lexington",
      deliveryZip: "40515",
    })
    assert.equal(quote.feeCents, 0)
  })

  it("charges $10 Georgetown under $40", () => {
    const quote = quoteDeliveryFee({
      subtotalCents: 3200,
      fulfillment: "delivery",
      deliveryCity: "Georgetown",
      deliveryZip: "40324",
    })
    assert.equal(
      quote.feeCents,
      STANDARD_DELIVERY_FEE_CENTS + GEORGETOWN_SURCHARGE_CENTS
    )
  })

  it("charges $3 Georgetown surcharge between $40 and $54.99", () => {
    const quote = quoteDeliveryFee({
      subtotalCents: 4500,
      fulfillment: "delivery",
      deliveryCity: "Georgetown",
      deliveryZip: "40324",
    })
    assert.equal(quote.feeCents, GEORGETOWN_SURCHARGE_CENTS)
  })

  it("waives Georgetown at $55+", () => {
    const quote = quoteDeliveryFee({
      subtotalCents: 5500,
      fulfillment: "delivery",
      deliveryCity: "Georgetown",
      deliveryZip: "40324",
    })
    assert.equal(quote.feeCents, 0)
  })

  it("charges no delivery fee for pickup", () => {
    const quote = quoteDeliveryFee({
      subtotalCents: 1000,
      fulfillment: "pickup",
      deliveryCity: "Lexington",
      deliveryZip: "40503",
    })
    assert.equal(quote.feeCents, 0)
  })
})

describe("delivery fee cart display", () => {
  it("prompts for zip when tier is unknown", () => {
    const quote = quoteDeliveryFee({
      subtotalCents: 3200,
      fulfillment: "delivery",
      deliveryCity: "Lexington",
      deliveryZip: "",
    })
    const display = getDeliveryFeeCartDisplay(quote, 3200)
    assert.equal(display.amountLabel, "—")
    assert.match(display.detail ?? "", /zip/i)
  })

  it("shows nudge toward free delivery", () => {
    const quote = quoteDeliveryFee({
      subtotalCents: 3200,
      fulfillment: "delivery",
      deliveryCity: "Lexington",
      deliveryZip: "40503",
    })
    const display = getDeliveryFeeCartDisplay(quote, 3200)
    assert.equal(display.amountLabel, "$7")
    assert.match(display.nudge ?? "", /\$8/)
  })

  it("formats confirmation note with area label", () => {
    const note = formatDeliveryFeeConfirmationNote({
      feeCents: 1200,
      subtotalCents: 4200,
      deliveryCity: "Lexington",
      deliveryZip: "40515",
    })
    assert.match(note, /\$12/)
    assert.match(note, /Extended Lexington/)
  })
})
