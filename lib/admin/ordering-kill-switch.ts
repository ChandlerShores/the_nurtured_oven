import { isRedisConfigured, getRedisClient } from "@/lib/square/redis-client"

const REDIS_KEY = "tno:admin:ordering-disabled"

const DEV_FLAG_KEY = "__tnoAdminOrderingKillSwitch__"

function isEnvOrderingKillSwitchActive(): boolean {
  const value = process.env.WEEKLY_ORDERING_DISABLED?.trim().toLowerCase()
  return value === "1" || value === "true" || value === "yes"
}

function devKillSwitchStore(): { enabled: boolean } {
  const globalStore = globalThis as typeof globalThis & {
    [DEV_FLAG_KEY]?: { enabled: boolean }
  }
  if (!globalStore[DEV_FLAG_KEY]) {
    globalStore[DEV_FLAG_KEY] = { enabled: false }
  }
  return globalStore[DEV_FLAG_KEY]!
}

async function readRedisKillSwitch(): Promise<boolean | null> {
  if (!isRedisConfigured()) return null
  const client = await getRedisClient()
  if (!client) return null
  const value = await client.get(REDIS_KEY)
  return value === "1"
}

export type OrderingKillSwitchSource = "env" | "redis" | "memory" | "none"

export interface OrderingKillSwitchState {
  active: boolean
  envLocked: boolean
  adminToggle: boolean
  source: OrderingKillSwitchSource
  canToggle: boolean
  storageHint: string
}

export async function resolveOrderingKillSwitchActive(): Promise<boolean> {
  if (isEnvOrderingKillSwitchActive()) return true

  const redisValue = await readRedisKillSwitch()
  if (redisValue === true) return true

  if (!isRedisConfigured()) {
    return devKillSwitchStore().enabled
  }

  return false
}

export async function getOrderingKillSwitchState(): Promise<OrderingKillSwitchState> {
  const envLocked = isEnvOrderingKillSwitchActive()
  const redisValue = await readRedisKillSwitch()
  const memoryEnabled = devKillSwitchStore().enabled
  const adminToggle =
    redisValue === true || (!isRedisConfigured() && memoryEnabled)

  let source: OrderingKillSwitchSource = "none"
  if (envLocked) source = "env"
  else if (redisValue === true) source = "redis"
  else if (adminToggle) source = "memory"

  const active = envLocked || adminToggle
  const canToggle = !envLocked

  const storageHint = envLocked
    ? "WEEKLY_ORDERING_DISABLED is set in the deployment environment. Remove it in Vercel to re-enable schedule-based control."
    : isRedisConfigured()
      ? "Toggle is stored in Redis and applies immediately on production."
      : "REDIS_URL is not set. Toggle uses this server instance only (fine for local dev)."

  return {
    active,
    envLocked,
    adminToggle,
    source,
    canToggle,
    storageHint,
  }
}

export async function setAdminOrderingKillSwitch(
  enabled: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (isEnvOrderingKillSwitchActive()) {
    return {
      ok: false,
      error:
        "Ordering is locked by WEEKLY_ORDERING_DISABLED in the environment. Turn that off in Vercel first.",
    }
  }

  if (isRedisConfigured()) {
    const client = await getRedisClient()
    if (!client) {
      return { ok: false, error: "Could not connect to Redis." }
    }
    if (enabled) {
      await client.set(REDIS_KEY, "1")
    } else {
      await client.del(REDIS_KEY)
    }
    devKillSwitchStore().enabled = false
    return { ok: true }
  }

  devKillSwitchStore().enabled = enabled
  return { ok: true }
}
