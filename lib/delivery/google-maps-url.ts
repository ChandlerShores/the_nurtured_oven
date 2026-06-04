import { BAKERY_BASE_ADDRESS } from "@/lib/delivery/bakery-base"
import { formatDeliveryAddress } from "@/lib/delivery/address"
import type { DeliveryRouteStopView } from "@/lib/delivery/route-types"

function mapsQuery(address: string, city: string, zip?: string): string {
  return encodeURIComponent(formatDeliveryAddress(address, city, zip))
}

function bakeryOrigin(): string {
  return encodeURIComponent(BAKERY_BASE_ADDRESS)
}

/** Round-trip Google Maps directions: bakery → stops → bakery. */
export function buildGoogleMapsRouteUrl(
  stops: Pick<
    DeliveryRouteStopView,
    "deliveryAddress" | "deliveryCity" | "deliveryZip"
  >[]
): string | null {
  const routed = stops.filter((stop) => stop.deliveryAddress.trim())
  if (routed.length === 0) return null

  const origin = bakeryOrigin()
  const stopQueries = routed.map((stop) =>
    mapsQuery(stop.deliveryAddress, stop.deliveryCity, stop.deliveryZip)
  )

  if (stopQueries.length === 1) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${origin}&waypoints=${stopQueries[0]}`
  }

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${origin}&waypoints=${stopQueries.join("|")}`
}
