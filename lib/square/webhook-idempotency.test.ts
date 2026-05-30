import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  processedPaymentRedisKey,
  PROCESSED_PAYMENT_TTL_SECONDS,
} from "@/lib/square/redis-client"
import { isRedisConfigured } from "@/lib/square/webhook-idempotency"

describe("webhook idempotency redis helpers", () => {
  it("builds a stable processed payment key", () => {
    assert.equal(
      processedPaymentRedisKey("pay_abc123"),
      "square:webhook:payment:pay_abc123"
    )
  })

  it("uses a 90-day ttl constant", () => {
    assert.equal(PROCESSED_PAYMENT_TTL_SECONDS, 90 * 24 * 60 * 60)
  })

  it("detects when REDIS_URL is unset", () => {
    const previous = process.env.REDIS_URL
    delete process.env.REDIS_URL
    assert.equal(isRedisConfigured(), false)
    process.env.REDIS_URL = previous
  })

  it("detects when REDIS_URL is set", () => {
    const previous = process.env.REDIS_URL
    process.env.REDIS_URL = "rediss://default:example@example.com:6379"
    assert.equal(isRedisConfigured(), true)
    process.env.REDIS_URL = previous
  })
})
