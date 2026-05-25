import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { buildOrderMetadata } from "@/lib/square/order-metadata"
import type { WeeklyFulfillmentContext } from "@/lib/order/weekly-fulfillment"

const batch: WeeklyFulfillmentContext = {
  fulfillmentDate: "2026-05-29",
  cutoffAt: "2026-05-27T12:00:00-04:00",
  batchLabel: "Friday 5/29",
  orderWeek: "2026-W22",
  menuCycle: "2026-05-24",
  internalRef: "TNO-2026-05-29-A8F3K2",
  timezone: "America/New_York",
}

describe("order metadata", () => {
  it("excludes PII and includes fulfillment context", () => {
    const meta = buildOrderMetadata(batch, "delivery", "Georgetown")
    assert.equal(meta.source, "website")
    assert.equal(meta.fulfillment_method, "delivery")
    assert.equal(meta.delivery_city, "Georgetown")
    assert.equal(meta.internal_ref, batch.internalRef)
    assert.ok(Object.keys(meta).length <= 10)
    assert.ok(!JSON.stringify(meta).includes("123 Main"))
  })
})
