import { describe, it, after } from "node:test"
import assert from "node:assert/strict"
import {
  getOrderingClosedMessage,
  getOrderingPublicState,
  isEnvOrderingKillSwitchActive,
  isWeeklyOrderingAccepted,
} from "@/lib/menu/ordering-gate"
import { COMING_SOON_COPY } from "@/lib/content/coming-soon"

describe("ordering kill switch", () => {
  const env = { ...process.env }

  after(() => {
    process.env = env
  })

  it("defaults to schedule when unset", () => {
    delete process.env.WEEKLY_ORDERING_DISABLED
    delete process.env.COMING_SOON_MODE
    assert.equal(isEnvOrderingKillSwitchActive(), false)
  })

  it("disables ordering when WEEKLY_ORDERING_DISABLED is true", () => {
    process.env.WEEKLY_ORDERING_DISABLED = "true"
    assert.equal(isEnvOrderingKillSwitchActive(), true)
    assert.equal(isWeeklyOrderingAccepted(), false)
  })

  it("allows ordering when WEEKLY_ORDERING_DISABLED is false", () => {
    process.env.WEEKLY_ORDERING_DISABLED = "false"
    delete process.env.COMING_SOON_MODE
    assert.equal(isEnvOrderingKillSwitchActive(), false)
  })

  it("blocks checkout and public weekly ordering when COMING_SOON_MODE is true", () => {
    process.env.WEEKLY_ORDERING_DISABLED = "false"
    process.env.COMING_SOON_MODE = "true"

    assert.equal(isWeeklyOrderingAccepted(), false)
    assert.equal(getOrderingClosedMessage(), COMING_SOON_COPY.checkoutMessage)

    const publicState = getOrderingPublicState()
    assert.equal(publicState.isOpen, false)
    assert.equal(publicState.weeklyOrderIntentAvailable, false)
    assert.equal(publicState.comingSoon, true)
    assert.equal(publicState.closedMessage, COMING_SOON_COPY.checkoutMessage)
  })
})
