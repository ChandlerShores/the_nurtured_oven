/**
 * Deployment tier helpers for Vercel (Production / Preview) and local dev.
 * Set variables per tier in Vercel → Settings → Environment Variables.
 */

export type DeploymentTier = "development" | "preview" | "production"

export function getDeploymentTier(): DeploymentTier {
  const vercelEnv = process.env.VERCEL_ENV
  if (vercelEnv === "production") return "production"
  if (vercelEnv === "preview") return "preview"
  return "development"
}

/**
 * Canonical site URL for server-side redirects, Square checkout return URL, and webhook verification.
 * Priority: NEXT_PUBLIC_APP_URL → https://VERCEL_URL (preview/prod deploys) → localhost.
 */
export function getPublicAppUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "")
  if (explicit) return explicit

  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl) return `https://${vercelUrl}`

  return "http://localhost:3000"
}

export function isSquareProductionMode(): boolean {
  return process.env.SQUARE_ENVIRONMENT === "production"
}

/** Warn when location id looks like an application id (common misconfiguration). */
export function validateSquareLocationId(locationId: string): void {
  if (locationId.startsWith("sq0idp-") || locationId.startsWith("sq0csp-")) {
    throw new Error(
      "SQUARE_LOCATION_ID looks like an Application ID. Use the Location ID from Square Dashboard → Locations (e.g. LX5V0NV78YEX5)."
    )
  }
}

export function getDeploymentLabel(): string {
  const tier = getDeploymentTier()
  const square = isSquareProductionMode() ? "Square production" : "Square sandbox"
  return `${tier} · ${square}`
}
