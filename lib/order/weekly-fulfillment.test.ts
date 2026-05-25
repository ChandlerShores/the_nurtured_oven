import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  addCalendarDays,
  easternNoonToIso,
  formatBatchLabel,
  getCutoffWednesdayYmd,
  getEasternYmdHm,
  getFulfillmentFridayYmd,
  getIsoWeekString,
  getWeeklyFulfillmentContext,
} from "@/lib/order/weekly-fulfillment"
import { isInternalRef } from "@/lib/order/internal-ref"

describe("weekly fulfillment", () => {
  it("maps Wednesday before noon to fulfillment two days later (Friday)", () => {
    const wed = new Date("2026-05-27T15:00:00.000Z")
    const friday = getFulfillmentFridayYmd(wed)
    assert.equal(formatBatchLabel(friday.year, friday.month, friday.day), "Friday 5/29")
  })

  it("maps Saturday to the next Friday", () => {
    const sat = new Date("2026-05-23T16:00:00.000Z")
    const friday = getFulfillmentFridayYmd(sat)
    assert.equal(friday.day, 29)
    assert.equal(friday.month, 5)
  })

  it("cutoff is the Wednesday before fulfillment Friday at noon Eastern", () => {
    const friday = { year: 2026, month: 5, day: 29 }
    const wed = getCutoffWednesdayYmd(friday)
    assert.equal(wed.day, 27)
    assert.match(easternNoonToIso(wed.year, wed.month, wed.day), /T12:00:00/)
  })

  it("produces ISO week string", () => {
    assert.equal(getIsoWeekString(2026, 5, 29), "2026-W22")
  })

  it("weekly context includes internal ref", () => {
    const ctx = getWeeklyFulfillmentContext(new Date("2026-05-26T14:00:00.000Z"))
    assert.match(ctx.internalRef, /^TNO-2026-05-29-/)
    assert.ok(isInternalRef(ctx.internalRef))
    assert.equal(ctx.timezone, "America/New_York")
  })

  it("addCalendarDays handles month boundaries", () => {
    const result = addCalendarDays(2026, 5, 1, -2)
    assert.equal(result.month, 4)
    assert.equal(result.day, 29)
  })

  it("getEasternYmdHm returns weekday in ET", () => {
    const parts = getEasternYmdHm(new Date("2026-05-27T15:00:00.000Z"))
    assert.equal(parts.weekday, 3)
  })
})
