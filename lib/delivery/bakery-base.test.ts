import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  BAKERY_BASE_ADDRESS,
  BAKERY_BASE_LAT,
  BAKERY_BASE_LNG,
  getBakeryBase,
} from "@/lib/delivery/bakery-base"

describe("bakery base", () => {
  it("uses the Lexington home kitchen address", () => {
    assert.match(BAKERY_BASE_ADDRESS, /549 Hopewell Park/)
    assert.match(BAKERY_BASE_ADDRESS, /Lexington/)
  })

  it("returns fixed coordinates by default", () => {
    const base = getBakeryBase()
    assert.equal(base.address, BAKERY_BASE_ADDRESS)
    assert.equal(base.lat, BAKERY_BASE_LAT)
    assert.equal(base.lng, BAKERY_BASE_LNG)
  })
})
