import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  normalizeOrderStatus,
  isTerminalOrderStatus,
  isValidOrderStatus,
  ORDER_STATUS_OPTIONS,
} from "@/lib/admin/order-status"

describe("order status", () => {
  it("exposes canonical options without Complete, Baking, or Packed", () => {
    assert.deepEqual([...ORDER_STATUS_OPTIONS], [
      "New",
      "In progress",
      "Ready",
      "Delivered / Picked Up",
      "Cancelled",
      "Issue",
      "Refunded",
    ])
  })

  it("maps legacy values to canonical statuses", () => {
    assert.equal(normalizeOrderStatus("Baking"), "In progress")
    assert.equal(normalizeOrderStatus("Packed"), "In progress")
    assert.equal(normalizeOrderStatus("Complete"), "Delivered / Picked Up")
    assert.equal(normalizeOrderStatus("Delivered"), "Delivered / Picked Up")
  })

  it("treats legacy Complete and Issue as terminal", () => {
    assert.equal(isTerminalOrderStatus("Complete"), true)
    assert.equal(isTerminalOrderStatus("Issue"), true)
    assert.equal(isTerminalOrderStatus("In progress"), false)
  })

  it("validates only canonical statuses for API writes", () => {
    assert.equal(isValidOrderStatus("In progress"), true)
    assert.equal(isValidOrderStatus("Baking"), false)
    assert.equal(isValidOrderStatus("Complete"), false)
  })
})
