import { createClient, type RedisClientType } from "redis"

const CLIENT_KEY = "__tnoRedisClient__"
const CONNECT_PROMISE_KEY = "__tnoRedisConnectPromise__"

/** Keep processed payment keys for 90 days. */
export const PROCESSED_PAYMENT_TTL_SECONDS = 90 * 24 * 60 * 60

export function isRedisConfigured(): boolean {
  return Boolean(process.env.REDIS_URL?.trim())
}

export function processedPaymentRedisKey(paymentId: string): string {
  return `square:webhook:payment:${paymentId}`
}

export async function getRedisClient(): Promise<RedisClientType | null> {
  const url = process.env.REDIS_URL?.trim()
  if (!url) return null

  const globalStore = globalThis as typeof globalThis & {
    [CLIENT_KEY]?: RedisClientType
    [CONNECT_PROMISE_KEY]?: Promise<RedisClientType>
  }

  const existing = globalStore[CLIENT_KEY]
  if (existing?.isOpen) return existing

  if (!globalStore[CONNECT_PROMISE_KEY]) {
    globalStore[CONNECT_PROMISE_KEY] = (async () => {
      const client = createClient({ url })
      client.on("error", (err) => {
        console.error("[Redis] Client error:", err)
      })
      await client.connect()
      globalStore[CLIENT_KEY] = client
      return client
    })()
  }

  try {
    return await globalStore[CONNECT_PROMISE_KEY]!
  } catch (err) {
    globalStore[CONNECT_PROMISE_KEY] = undefined
    throw err
  }
}

/** Test helper — disconnect cached client. */
export async function disconnectRedisForTests(): Promise<void> {
  const globalStore = globalThis as typeof globalThis & {
    [CLIENT_KEY]?: RedisClientType
    [CONNECT_PROMISE_KEY]?: Promise<RedisClientType>
  }

  const client = globalStore[CLIENT_KEY]
  globalStore[CLIENT_KEY] = undefined
  globalStore[CONNECT_PROMISE_KEY] = undefined

  if (client?.isOpen) {
    await client.quit()
  }
}
