import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  generateInternalRef,
  generateInternalRefSuffix,
  isInternalRef,
} from "@/lib/order/internal-ref"

describe("internal ref", () => {
  it("formats TNO-YYYY-MM-DD-SUFFIX", () => {
    const ref = generateInternalRef("2026-05-29")
    assert.match(ref, /^TNO-2026-05-29-[A-Z2-9]{5}$/)
    assert.ok(isInternalRef(ref))
  })

  it("generates 5-char suffix", () => {
    assert.equal(generateInternalRefSuffix().length, 5)
  })
})
