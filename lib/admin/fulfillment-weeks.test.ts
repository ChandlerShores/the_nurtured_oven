import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  fulfillmentWeekKeysMatch,
  isViewingPriorBakeWeek,
  operationalFulfillmentWeekKey,
} from "@/lib/admin/fulfillment-weeks"

describe("operationalFulfillmentWeekKey", () => {
  it("on Saturday uses the Friday that just finished, not next Friday", () => {
    const sat = new Date("2026-05-23T16:00:00.000Z")
    assert.equal(operationalFulfillmentWeekKey(sat), "2026-05-22")
  })

  it("on Sunday starts the next bake cycle", () => {
    const sun = new Date("2026-05-24T14:00:00.000Z")
    assert.equal(operationalFulfillmentWeekKey(sun), "2026-05-29")
  })

  it("on Wednesday before fulfillment uses upcoming Friday", () => {
    const wed = new Date("2026-05-27T15:00:00.000Z")
    assert.equal(operationalFulfillmentWeekKey(wed), "2026-05-29")
  })
})

describe("fulfillmentWeekKeysMatch", () => {
  it("matches ISO date and batch label forms", () => {
    assert.ok(
      fulfillmentWeekKeysMatch("2026-06-06", "Friday 6/6")
    )
  })
})

describe("isViewingPriorBakeWeek", () => {
  it("does not flag the operational week as prior", () => {
    assert.equal(
      isViewingPriorBakeWeek("Friday 6/6", "2026-06-06"),
      false
    )
  })

  it("flags an older week on Saturday wrap-up", () => {
    assert.equal(
      isViewingPriorBakeWeek("2026-05-16", "2026-05-22"),
      true
    )
  })

  it("does not flag when active matches operational on Saturday", () => {
    assert.equal(
      isViewingPriorBakeWeek("Friday 5/22", "2026-05-22"),
      false
    )
  })
})
