import { after, describe, it } from "node:test"
import assert from "node:assert/strict"
import { COMING_SOON_COPY } from "@/lib/content/coming-soon"
import { getCheckoutBlockedMessage } from "@/lib/order/checkout-availability"

describe("checkout availability", () => {
  const env = { ...process.env }

  after(() => {
    process.env = env
  })

  it("blocks checkout when COMING_SOON_MODE is true", () => {
    process.env.COMING_SOON_MODE = "true"

    assert.equal(getCheckoutBlockedMessage(), COMING_SOON_COPY.checkoutMessage)
  })

  it("allows checkout availability checks when COMING_SOON_MODE is unset", () => {
    delete process.env.COMING_SOON_MODE

    assert.equal(getCheckoutBlockedMessage(), null)
  })
})
