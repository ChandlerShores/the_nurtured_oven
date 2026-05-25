import { SquareClient, SquareEnvironment } from "square"
import {
  getPublicAppUrl,
  validateSquareLocationId,
} from "@/lib/env/deployment"

export function isSquareConfigured(): boolean {
  return Boolean(
    process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID
  )
}

export function getSquareClient(): SquareClient {
  const token = process.env.SQUARE_ACCESS_TOKEN
  if (!token) {
    throw new Error("SQUARE_ACCESS_TOKEN is not configured")
  }

  const environment =
    process.env.SQUARE_ENVIRONMENT === "production"
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox

  return new SquareClient({ token, environment })
}

export function getSquareLocationId(): string {
  const locationId = process.env.SQUARE_LOCATION_ID
  if (!locationId) {
    throw new Error("SQUARE_LOCATION_ID is not configured")
  }
  validateSquareLocationId(locationId)
  return locationId
}

export function getAppUrl(): string {
  return getPublicAppUrl()
}
