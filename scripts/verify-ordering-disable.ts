/**
 * Verify WEEKLY_ORDERING_DISABLED and kill-switch behavior.
 * Run: pnpm exec tsx scripts/verify-ordering-disable.ts
 * Loads .env.local when present.
 */
import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"
import { isWeeklyOrderingWindowOpen } from "../lib/menu/schedule"
import {
  isEnvOrderingKillSwitchActive,
  isWeeklyOrderingAccepted,
  isWeeklyOrderingAcceptedAsync,
} from "../lib/menu/ordering-gate"
import {
  getOrderingKillSwitchState,
  setAdminOrderingKillSwitch,
} from "../lib/admin/ordering-kill-switch"

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local")
  if (!existsSync(path)) return
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=]+?)\s*=\s*(.*)$/)
    if (!m) continue
    process.env[m[1].trim()] = m[2].trim()
  }
}

function label(value: boolean): string {
  return value ? "YES (ordering blocked)" : "no (not env-blocked)"
}

async function main() {
  loadEnvLocal()

  const raw = process.env.WEEKLY_ORDERING_DISABLED ?? "(unset)"
  const windowOpen = isWeeklyOrderingWindowOpen()
  const envKill = isEnvOrderingKillSwitchActive()
  const syncAccepted = isWeeklyOrderingAccepted()
  const asyncAccepted = await isWeeklyOrderingAcceptedAsync()
  const state = await getOrderingKillSwitchState()

  console.log("\n=== Ordering disable check ===\n")
  console.log("WEEKLY_ORDERING_DISABLED (raw):", raw)
  console.log("Env kill switch active:       ", label(envKill))
  console.log("Schedule window open now:     ", windowOpen)
  console.log("isWeeklyOrderingAccepted():   ", syncAccepted)
  console.log("isWeeklyOrderingAcceptedAsync:", asyncAccepted)
  console.log("\nKill switch state:")
  console.log("  active:     ", state.active)
  console.log("  source:     ", state.source)
  console.log("  envLocked:  ", state.envLocked)
  console.log("  canToggle:  ", state.canToggle)

  // Simulate env=true in-process (does not change .env.local)
  const saved = process.env.WEEKLY_ORDERING_DISABLED
  process.env.WEEKLY_ORDERING_DISABLED = "true"
  const envTrueKill = isEnvOrderingKillSwitchActive()
  const envTrueSync = isWeeklyOrderingAccepted()
  const envTrueAsync = await isWeeklyOrderingAcceptedAsync()
  const toggleWhenEnvLocked = await setAdminOrderingKillSwitch(false)
  process.env.WEEKLY_ORDERING_DISABLED = saved

  console.log("\n=== Simulated WEEKLY_ORDERING_DISABLED=true ===\n")
  console.log("Env kill switch active:       ", label(envTrueKill))
  console.log("Sync accepted:                ", envTrueSync)
  console.log("Async accepted:               ", envTrueAsync)
  console.log(
    "Admin toggle while env locked:",
    toggleWhenEnvLocked.ok ? "allowed (unexpected)" : toggleWhenEnvLocked.error
  )

  const pass =
    envTrueKill &&
    !envTrueSync &&
    !envTrueAsync &&
    !toggleWhenEnvLocked.ok &&
    (raw === "false" || raw === "(unset)"
      ? !envKill
      : envKill === isEnvOrderingKillSwitchActive())

  console.log("\nResult:", pass ? "PASS" : "FAIL")
  if (!pass) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
