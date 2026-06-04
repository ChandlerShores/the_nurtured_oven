import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  clearRateLimit,
  consumeRateLimitAsync,
} from "@/lib/security/rate-limit"

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name]
  } else {
    process.env[name] = value
  }
}

describe("consumeRateLimitAsync", () => {
  it("allows maxAttempts local attempts and rejects the next one", async () => {
    const previousRedisUrl = process.env.REDIS_URL
    delete process.env.REDIS_URL
    const key = "test-consume-limit"

    try {
      clearRateLimit(key)

      assert.equal(
        (await consumeRateLimitAsync(key, { windowMs: 60_000, maxAttempts: 2 }))
          .allowed,
        true
      )
      assert.equal(
        (await consumeRateLimitAsync(key, { windowMs: 60_000, maxAttempts: 2 }))
          .allowed,
        true
      )
      assert.equal(
        (await consumeRateLimitAsync(key, { windowMs: 60_000, maxAttempts: 2 }))
          .allowed,
        false
      )
    } finally {
      clearRateLimit(key)
      restoreEnv("REDIS_URL", previousRedisUrl)
    }
  })
})
