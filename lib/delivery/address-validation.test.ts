import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  normalizeDeliveryZip,
  validateDeliveryCheckoutAddress,
  validateDeliveryStreetAddress,
  validateDeliveryZip,
} from "@/lib/delivery/address-validation"

describe("address-validation", () => {
  it("normalizes 5-digit and zip+4 formats", () => {
    assert.equal(normalizeDeliveryZip("40324"), "40324")
    assert.equal(normalizeDeliveryZip("40324-1234"), "40324")
    assert.equal(normalizeDeliveryZip("abc"), null)
  })

  it("requires a street number", () => {
    assert.equal(
      validateDeliveryStreetAddress("Main St"),
      "Please include a street number (for example, 123 Main St)."
    )
    assert.equal(validateDeliveryStreetAddress("123 Main St"), null)
  })

  it("validates Georgetown zip", () => {
    assert.equal(validateDeliveryZip("Georgetown", "40324"), null)
    assert.match(
      validateDeliveryZip("Georgetown", "40503") ?? "",
      /40324/
    )
  })

  it("validates Lexington zip range", () => {
    assert.equal(validateDeliveryZip("Lexington", "40502"), null)
    assert.equal(validateDeliveryZip("Lexington", "40517"), null)
    assert.match(
      validateDeliveryZip("Lexington", "40324") ?? "",
      /40502/
    )
  })

  it("validates full checkout delivery input", () => {
    assert.equal(
      validateDeliveryCheckoutAddress({
        city: "Georgetown",
        address: "118 Marketplace circle",
        zip: "40324",
      }),
      null
    )
    assert.match(
      validateDeliveryCheckoutAddress({
        city: "Lexington",
        address: "Church St",
        zip: "40503",
      }) ?? "",
      /street number/i
    )
  })
})
