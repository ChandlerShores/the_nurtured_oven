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
console.log("Google Sheets")
console.log(
  "  Spreadsheet ID:",
  mask(process.env.GOOGLE_SHEET_ID)
)
console.log(
  "  Orders range:",
  process.env.GOOGLE_SHEETS_ORDERS_RANGE ??
    process.env.GOOGLE_SHEETS_RANGE ??
    "Orders!A:R (default)"
)
console.log(
  "  Menu range:",
  process.env.GOOGLE_SHEETS_MENU_RANGE ?? "Menu!A:L (default)"
)
console.log(
  "  Line items range:",
  process.env.GOOGLE_SHEETS_LINE_ITEMS_RANGE ?? "Order Line Items!A:M (default)"
)
console.log(
  "  Service account email:",
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "(not set)"
)
console.log("  Private key:", mask(process.env.GOOGLE_PRIVATE_KEY))
console.log("")
console.log("Admin")
const adminPw = process.env.ADMIN_PASSWORD?.trim() ?? ""
console.log("  ADMIN_PASSWORD:", mask(process.env.ADMIN_PASSWORD))
if (adminPw && adminPw.length < 12) {
  console.warn(
    "  Warning: ADMIN_PASSWORD should be at least 12 characters for admin login.\n"
  )
}
console.log(
  "  ADMIN_SESSION_SECRET:",
  mask(process.env.ADMIN_SESSION_SECRET)
)
const secretLen = process.env.ADMIN_SESSION_SECRET?.trim().length ?? 0
if (tier === "production" && secretLen < 32) {
  console.error(
    "  ERROR: ADMIN_SESSION_SECRET (32+ chars) is required in production.\n"
  )
  process.exitCode = 1
} else if (
  (tier === "production" || tier === "preview") &&
  adminPw.length >= 12 &&
  secretLen < 32
) {
  console.warn(
    "  Warning: Set ADMIN_SESSION_SECRET (32+ chars) for stronger session signing.\n"
  )
}
console.log("")
console.log("Webhook idempotency")
if (tier === "production" && !isRedisConfigured()) {
  console.error(
    "  ERROR: REDIS_URL is required in production for webhook idempotency.\n"
  )
  process.exitCode = 1
} else {
  console.log("  Production Redis requirement:", tier === "production" ? "enforced" : "n/a")
}
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
