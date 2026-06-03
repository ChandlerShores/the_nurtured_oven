import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { isAllowedCheckoutUrl } from "@/lib/security/safe-external-url"

describe("isAllowedCheckoutUrl", () => {
  it("allows Square HTTPS hosts", () => {
    assert.equal(isAllowedCheckoutUrl("https://square.link/u/abc"), true)
    assert.equal(
      isAllowedCheckoutUrl("https://checkout.square.site/merchant/xyz"),
      true
    )
  })

  it("blocks non-Square and non-HTTPS URLs", () => {
    assert.equal(isAllowedCheckoutUrl("https://evil.com/pay"), false)
    assert.equal(isAllowedCheckoutUrl("javascript:alert(1)"), false)
    assert.equal(isAllowedCheckoutUrl("http://square.link/u/abc"), false)
  })
})
