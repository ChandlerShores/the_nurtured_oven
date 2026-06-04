import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  expandDeliveryAddressAbbreviations,
  formatGeocodeSearchText,
  geocodeQueryVariants,
} from "@/lib/delivery/geocode-query"
import { extractHouseNumber } from "@/lib/delivery/address"
import {
  pickBestGeocodeCandidate,
  scoreGeocodeCandidate,
} from "@/lib/delivery/geocode-quality"

describe("geocode-query", () => {
  it("extracts leading house numbers", () => {
    assert.equal(extractHouseNumber("3092 Leestown Rd"), "3092")
    assert.equal(extractHouseNumber("118 Marketplace circle"), "118")
    assert.equal(extractHouseNumber("137 W Showalter"), "137")
    assert.equal(extractHouseNumber("Church St"), null)
  })

  it("formats search text with Kentucky context", () => {
    assert.equal(
      formatGeocodeSearchText("3 Church St", "Georgetown"),
      "3 Church St, Georgetown, KY, USA"
    )
  })

  it("expands common street abbreviations", () => {
    assert.equal(
      expandDeliveryAddressAbbreviations("2 E Main St"),
      "2 East Main Street"
    )
    assert.equal(
      expandDeliveryAddressAbbreviations("48 W Main St"),
      "48 West Main Street"
    )
  })

  it("adds an expanded query variant when abbreviations change", () => {
    const variants = geocodeQueryVariants("2 E Main St", "Lexington")
    assert.equal(variants.length, 2)
    assert.equal(variants[1]?.address, "2 East Main Street")
  })
})

describe("geocode-quality", () => {
  it("prefers address-layer matches with the same house number", () => {
    const streetCentroid = {
      lat: 38.212,
      lng: -84.561,
      layer: "street",
      street: "Church Street",
      locality: "Georgetown",
      confidence: 0.8,
      matchType: "fallback",
    }
    const precise = {
      lat: 38.212165,
      lng: -84.56078,
      layer: "address",
      housenumber: "3",
      street: "Church Street",
      locality: "Georgetown",
      confidence: 0.9,
      matchType: "exact",
    }

    assert.ok(
      scoreGeocodeCandidate(precise, "3 Church St", "Georgetown") >
        scoreGeocodeCandidate(streetCentroid, "3 Church St", "Georgetown")
    )

    const best = pickBestGeocodeCandidate(
      [streetCentroid, precise],
      "3 Church St",
      "Georgetown"
    )
    assert.equal(best?.housenumber, "3")
    assert.equal(best?.layer, "address")
  })

  it("rejects street centroids when a house number is required", () => {
    const streetOnly = {
      lat: 38.0439,
      lng: -84.4942,
      layer: "street",
      street: "East Main Street",
      locality: "Lexington",
      confidence: 0.7,
      matchType: "fallback",
    }

    const best = pickBestGeocodeCandidate(
      [streetOnly],
      "2 E Main St",
      "Lexington"
    )
    assert.equal(best, null)
  })
})
