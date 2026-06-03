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
    for (const [k, bucket] of buckets) {
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

export function recordRateLimitFailure(
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

export async function delayRateLimitedResponse(ms = 400): Promise<void> {
  const jitter = Math.floor(Math.random() * 200)
  await new Promise((resolve) => setTimeout(resolve, ms + jitter))
}
