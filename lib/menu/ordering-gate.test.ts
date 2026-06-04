import { describe, it, after } from "node:test"
import assert from "node:assert/strict"
import {
  isEnvOrderingKillSwitchActive,
  isWeeklyOrderingAccepted,
} from "@/lib/menu/ordering-gate"

describe("ordering kill switch", () => {
  const env = { ...process.env }

  after(() => {
    process.env = env
  })

  it("defaults to schedule when unset", () => {
    delete process.env.WEEKLY_ORDERING_DISABLED
    assert.equal(isEnvOrderingKillSwitchActive(), false)
  })

  it("disables ordering when WEEKLY_ORDERING_DISABLED is true", () => {
    process.env.WEEKLY_ORDERING_DISABLED = "true"
    assert.equal(isEnvOrderingKillSwitchActive(), true)
    assert.equal(isWeeklyOrderingAccepted(), false)
  })

  it("allows ordering when WEEKLY_ORDERING_DISABLED is false", () => {
    process.env.WEEKLY_ORDERING_DISABLED = "false"
    assert.equal(isEnvOrderingKillSwitchActive(), false)
  })
})
