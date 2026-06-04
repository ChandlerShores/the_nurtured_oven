import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  processedPaymentRedisKey,
  PROCESSED_PAYMENT_TTL_SECONDS,
} from "@/lib/square/redis-client"
import { isRedisConfigured } from "@/lib/square/webhook-idempotency"
import {
  acquirePaymentFulfillment,
  advancePaymentFulfillment,
  resetWebsiteOrderStoreForTests,
} from "@/lib/square/website-order-store"

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name]
  } else {
    process.env[name] = value
  }
}

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
    restoreEnv("REDIS_URL", previous)
  })

  it("detects when REDIS_URL is set", () => {
    const previous = process.env.REDIS_URL
    process.env.REDIS_URL = "rediss://default:example@example.com:6379"
    assert.equal(isRedisConfigured(), true)
    restoreEnv("REDIS_URL", previous)
  })
})

describe("local payment fulfillment lock", () => {
  it("does not resume a payment while the original handler is still processing", async () => {
    const previousRedisUrl = process.env.REDIS_URL
    delete process.env.REDIS_URL
    try {
      resetWebsiteOrderStoreForTests()

      const first = await acquirePaymentFulfillment("pay_lock", "order_1")
      const second = await acquirePaymentFulfillment("pay_lock", "order_1")

      assert.equal(first.outcome, "claimed")
      assert.equal(second.outcome, "in_progress")
    } finally {
      restoreEnv("REDIS_URL", previousRedisUrl)
    }
  })

  it("keeps side-effect phases locked while the lease is active", async () => {
    const previousRedisUrl = process.env.REDIS_URL
    delete process.env.REDIS_URL
    try {
      resetWebsiteOrderStoreForTests()

      const claimed = await acquirePaymentFulfillment("pay_resume", "order_1")
      await advancePaymentFulfillment(
        "pay_resume",
        "emails_sent",
        "order_1",
        claimed.leaseToken
      )

      const resumed = await acquirePaymentFulfillment("pay_resume", "order_1")

      assert.equal(resumed.outcome, "in_progress")
      assert.equal(resumed.phase, "emails_sent")
    } finally {
      restoreEnv("REDIS_URL", previousRedisUrl)
    }
  })

  it("allows a stale processing lease to be claimed again", async () => {
    const previousRedisUrl = process.env.REDIS_URL
    delete process.env.REDIS_URL
    try {
      resetWebsiteOrderStoreForTests()

      await acquirePaymentFulfillment("pay_stale", "order_1")
      const realNow = Date.now
      Date.now = () => realNow() + 40 * 60 * 1000
      try {
        const stale = await acquirePaymentFulfillment("pay_stale", "order_1")
        assert.equal(stale.outcome, "claimed")
        assert.equal(stale.phase, "processing")
      } finally {
        Date.now = realNow
      }
    } finally {
      restoreEnv("REDIS_URL", previousRedisUrl)
    }
  })

  it("allows a stale side-effect phase to resume", async () => {
    const previousRedisUrl = process.env.REDIS_URL
    delete process.env.REDIS_URL
    try {
      resetWebsiteOrderStoreForTests()

      const claimed = await acquirePaymentFulfillment("pay_stale_resume", "order_1")
      await advancePaymentFulfillment(
        "pay_stale_resume",
        "emails_sent",
        "order_1",
        claimed.leaseToken
      )

      const realNow = Date.now
      Date.now = () => realNow() + 40 * 60 * 1000
      try {
        const stale = await acquirePaymentFulfillment(
          "pay_stale_resume",
          "order_1"
        )
        assert.equal(stale.outcome, "resume")
        assert.equal(stale.phase, "emails_sent")
        assert.ok(stale.leaseToken)
      } finally {
        Date.now = realNow
      }
    } finally {
      restoreEnv("REDIS_URL", previousRedisUrl)
    }
  })
})
