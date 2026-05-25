import { describe, it, before, after } from "node:test"
import assert from "node:assert/strict"
import {
  formatFromHeader,
  getEmailConfig,
  isEmailConfigured,
} from "@/lib/email/config"

describe("email config", () => {
  const env = { ...process.env }

  after(() => {
    process.env = env
  })

  it("builds from header from env", () => {
    process.env.EMAIL_FROM_NAME = "Test Bakery"
    process.env.EMAIL_FROM_ADDRESS = "orders@example.com"
    delete process.env.RESEND_API_KEY
    assert.equal(
      formatFromHeader(),
      "Test Bakery <orders@example.com>"
    )
  })

  it("is not configured without API key", () => {
    delete process.env.RESEND_API_KEY
    assert.equal(isEmailConfigured(), false)
  })

  it("uses OWNER_EMAIL and reply-to fallback", () => {
    process.env.OWNER_EMAIL = "owner@example.com"
    delete process.env.EMAIL_REPLY_TO
    delete process.env.EMAIL_FROM_ADDRESS
    const config = getEmailConfig()
    assert.equal(config.ownerEmail, "owner@example.com")
    assert.equal(config.replyToEmail, "owner@example.com")
    assert.equal(config.fromAddress, "owner@example.com")
  })

  before(() => {
    delete process.env.EMAIL_FROM_NAME
    delete process.env.EMAIL_FROM_ADDRESS
  })
})
