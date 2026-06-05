import "server-only"

import { getBakeryBase, type BakeryBaseLocation } from "@/lib/delivery/bakery-base"

export {
  HEIGIT_API_BASE,
  HEIGIT_PELIAS_PREFIX,
  HEIGIT_VROOM_OPTIMIZATION_PATH,
} from "@/lib/openrouteservice/heigit-api"

export type { BakeryBaseLocation }

export function getOpenRouteServiceApiKey(): string | null {
  const key = process.env.OPENROUTESERVICE_API_KEY?.trim()
  return key || null
}

export function getBakeryBaseLocation(): BakeryBaseLocation {
  return getBakeryBase()
}

/** ORS / VROOM expect [longitude, latitude]. */
export function toOrsCoordinate(location: {
  lat: number
  lng: number
}): [number, number] {
  return [location.lng, location.lat]
}
