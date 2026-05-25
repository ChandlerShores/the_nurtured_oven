import { describe, it, after } from "node:test"
import assert from "node:assert/strict"
import {
  isOrderingKillSwitchActive,
  isWeeklyOrderingAccepted,
} from "@/lib/menu/ordering-gate"

describe("ordering kill switch", () => {
  const env = { ...process.env }

  after(() => {
    process.env = env
  })

  it("defaults to schedule when unset", () => {
    delete process.env.WEEKLY_ORDERING_DISABLED
    assert.equal(isOrderingKillSwitchActive(), false)
  })

  it("disables ordering when WEEKLY_ORDERING_DISABLED is true", () => {
    process.env.WEEKLY_ORDERING_DISABLED = "true"
    assert.equal(isOrderingKillSwitchActive(), true)
    assert.equal(isWeeklyOrderingAccepted(), false)
  })

  it("allows ordering when WEEKLY_ORDERING_DISABLED is false", () => {
    process.env.WEEKLY_ORDERING_DISABLED = "false"
    assert.equal(isOrderingKillSwitchActive(), false)
  })
})
