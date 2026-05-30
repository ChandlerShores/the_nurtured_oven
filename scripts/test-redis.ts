/**
 * Smoke-test Redis connectivity.
 * Run: node --env-file=.env.local node_modules/tsx/dist/cli.mjs scripts/test-redis.ts
 */
import {
  disconnectRedisForTests,
  getRedisClient,
  isRedisConfigured,
  processedPaymentRedisKey,
} from "../lib/square/redis-client"
import {
  claimSquarePaymentRedis,
  getProcessedSquarePaymentRedis,
} from "../lib/square/webhook-idempotency"

async function main() {
  if (!isRedisConfigured()) {
    console.error("REDIS_URL is not set.")
    process.exit(1)
  }

  const testPaymentId = `test_${Date.now()}`
  const key = processedPaymentRedisKey(testPaymentId)

  console.log("\nRedis connectivity test\n")
  console.log("REDIS_URL: configured")
  console.log("Test key:", key)

  const client = await getRedisClient()
  if (!client) {
    console.error("Could not connect to Redis.")
    process.exit(1)
  }

  const pong = await client.ping()
  console.log("PING:", pong)

  const claimed = await claimSquarePaymentRedis(testPaymentId, "order_test_123")
  console.log("Claim (SET NX):", claimed ? "success — key written" : "failed — key already exists")

  const record = await getProcessedSquarePaymentRedis(testPaymentId)
  console.log("Read back:", record)

  const duplicateClaim = await claimSquarePaymentRedis(testPaymentId, "order_test_123")
  console.log("Duplicate claim blocked:", duplicateClaim === false ? "yes" : "no")

  await client.del(key)
  console.log("Cleanup: test key deleted")

  await disconnectRedisForTests()
  console.log("\nRedis test passed.\n")
}

main().catch(async (err) => {
  console.error("\nRedis test failed:", err)
  await disconnectRedisForTests()
  process.exit(1)
})
