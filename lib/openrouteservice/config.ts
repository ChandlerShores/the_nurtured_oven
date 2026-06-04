import "server-only"

import { getBakeryBase, type BakeryBaseLocation } from "@/lib/delivery/bakery-base"

export type { BakeryBaseLocation }

export function getOpenRouteServiceApiKey(): string | null {
  const key = process.env.OPENROUTESERVICE_API_KEY?.trim()
  return key || null
}

export function getBakeryBaseLocation(): BakeryBaseLocation {
  return getBakeryBase()
}

/** ORS expects [longitude, latitude]. */
export function toOrsCoordinate(location: {
  lat: number
  lng: number
}): [number, number] {
  return [location.lng, location.lat]
}
