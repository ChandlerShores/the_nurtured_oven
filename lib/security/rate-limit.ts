import { getDeploymentTier } from "@/lib/env/deployment"
import { getRedisClient, isRedisConfigured } from "@/lib/square/redis-client"

interface Bucket {
  count: number
  windowStart: number
}

const buckets = new Map<string, Bucket>()

export function getClientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  const realIp = request.headers.get("x-real-ip")?.trim()
  if (realIp) return realIp
  return "unknown"
}

export function checkRateLimit(
  key: string,
  options: { windowMs: number; maxAttempts: number }
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  if (buckets.size > 500) {
    for (const [k, bucket] of Array.from(buckets.entries())) {
      if (now - bucket.windowStart > options.windowMs) buckets.delete(k)
    }
  }

  const bucket = buckets.get(key)
  if (!bucket || now - bucket.windowStart > options.windowMs) {
    buckets.set(key, { count: 0, windowStart: now })
    return { allowed: true, retryAfterSec: 0 }
  }

  if (bucket.count >= options.maxAttempts) {
    const retryAfterMs = options.windowMs - (now - bucket.windowStart)
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    }
  }

  return { allowed: true, retryAfterSec: 0 }
}

function rateLimitRedisKey(key: string): string {
  return `rate-limit:${key}`
}

function requireSharedRateLimitInProduction(): void {
  if (getDeploymentTier() === "production" && !isRedisConfigured()) {
    throw new Error("REDIS_URL is required in production for shared rate limits.")
  }
}

export async function consumeRateLimitAsync(
  key: string,
  options: { windowMs: number; maxAttempts: number }
): Promise<{ allowed: boolean; retryAfterSec: number }> {
  requireSharedRateLimitInProduction()

  if (!isRedisConfigured()) {
    const limit = checkRateLimit(key, options)
    if (limit.allowed) recordRateLimitHit(key, { windowMs: options.windowMs })
    return limit
  }

  const client = await getRedisClient()
  if (!client) {
    const limit = checkRateLimit(key, options)
    if (limit.allowed) recordRateLimitHit(key, { windowMs: options.windowMs })
    return limit
  }

  const redisKey = rateLimitRedisKey(key)
  const script = `
    local count = redis.call('INCR', KEYS[1])
    if count == 1 then
      redis.call('PEXPIRE', KEYS[1], ARGV[1])
    end
    local ttl = redis.call('PTTL', KEYS[1])
    return {count, ttl}
  `
  const result = (await client.eval(script, {
    keys: [redisKey],
    arguments: [String(options.windowMs)],
  })) as [number, number]
  const [count, ttlMs] = result

  if (count > options.maxAttempts) {
    return {
      allowed: false,
      retryAfterSec:
        ttlMs > 0
          ? Math.max(1, Math.ceil(ttlMs / 1000))
          : Math.ceil(options.windowMs / 1000),
    }
  }

  return { allowed: true, retryAfterSec: 0 }
}

/** Increment attempt counter after checkRateLimit allows the request. */
export function recordRateLimitHit(
  key: string,
  options: { windowMs: number }
): void {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || now - bucket.windowStart > options.windowMs) {
    buckets.set(key, { count: 1, windowStart: now })
    return
  }
  bucket.count += 1
}

export function clearRateLimit(key: string): void {
  buckets.delete(key)
}

export async function clearRateLimitAsync(key: string): Promise<void> {
  if (isRedisConfigured()) {
    const client = await getRedisClient()
    await client?.del(rateLimitRedisKey(key))
  }
  clearRateLimit(key)
}

export async function delayRateLimitedResponse(ms = 400): Promise<void> {
  const jitter = Math.floor(Math.random() * 200)
  await new Promise((resolve) => setTimeout(resolve, ms + jitter))
}
