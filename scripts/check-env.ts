/**
 * Print which deployment tier and key env vars are set (no secret values).
 * Run: pnpm env:check
 */
import { getEmailConfig, isEmailConfigured } from "../lib/email/config"
import {
  getDeploymentLabel,
  getDeploymentTier,
  getPublicAppUrl,
  isSquareProductionMode,
} from "../lib/env/deployment"
import { isSquareConfigured } from "../lib/square/client"
import { isRedisConfigured } from "../lib/square/redis-client"
import {
  isOrderingKillSwitchActive,
  isWeeklyOrderingAccepted,
} from "../lib/menu/ordering-gate"

function mask(value: string | undefined): string {
  if (!value) return "(not set)"
  if (value.length <= 8) return "***"
  return `${value.slice(0, 4)}…${value.slice(-4)}`
}

const tier = getDeploymentTier()
const email = getEmailConfig()

console.log("\nThe Nurtured Oven — environment check\n")
console.log("Deployment:", getDeploymentLabel())
console.log("VERCEL_ENV:", process.env.VERCEL_ENV ?? "(not on Vercel)")
console.log("App URL:", getPublicAppUrl())
console.log("")
console.log("Email")
console.log("  Resend configured:", isEmailConfigured())
console.log("  Owner:", email.ownerEmail)
console.log("  From:", email.fromAddress)
console.log("  Reply-to:", email.replyToEmail)
console.log("")
console.log("Square")
console.log("  Configured:", isSquareConfigured())
console.log("  Environment:", isSquareProductionMode() ? "production" : "sandbox")
console.log("  Location ID:", mask(process.env.SQUARE_LOCATION_ID))
console.log("  Access token:", mask(process.env.SQUARE_ACCESS_TOKEN))
console.log("  Webhook URL:", process.env.SQUARE_WEBHOOK_NOTIFICATION_URL ?? "(not set)")
console.log("  Webhook key:", mask(process.env.SQUARE_WEBHOOK_SIGNATURE_KEY))
console.log("")
console.log("Redis")
console.log("  Configured:", isRedisConfigured())
console.log("  URL:", mask(process.env.REDIS_URL))
console.log("")
console.log("Ordering")
console.log("  Kill switch (WEEKLY_ORDERING_DISABLED):", isOrderingKillSwitchActive())
console.log("  Weekly ordering accepted now:", isWeeklyOrderingAccepted())
console.log("")

if (tier === "preview" && isSquareProductionMode()) {
  console.warn(
    "Warning: Preview deploy with SQUARE_ENVIRONMENT=production — use sandbox on Preview unless intentional.\n"
  )
}

if (tier === "production" && !isSquareProductionMode()) {
  console.warn(
    "Warning: Production deploy with SQUARE_ENVIRONMENT=sandbox — live site will use test Square.\n"
  )
}
