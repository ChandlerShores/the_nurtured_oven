import "server-only"

import { randomBytes } from "crypto"
import {
  isActiveDeliveryStop,
  isPaidDeliveryOrder,
} from "@/lib/delivery/delivery-orders"
import { buildGoogleMapsRouteUrl } from "@/lib/delivery/google-maps-url"
import type {
  DeliveryRouteDepot,
  DeliveryRouteFailedStop,
  DeliveryRouteStopView,
  OptimizeDeliveryRouteResponse,
} from "@/lib/delivery/route-types"
import {
  adminOrderToRouteStop,
  fetchPaidDeliveryOrdersForDate,
} from "@/lib/google-sheets/delivery-route"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"
import {
  geocodeDeliveryAddress,
  optimizeDeliveryStops,
  OpenRouteServiceError,
} from "@/lib/openrouteservice/client"
import {
  getBakeryBaseLocation,
  getOpenRouteServiceApiKey,
} from "@/lib/openrouteservice/config"

export function createRouteBatchId(fulfillmentDate: string): string {
  const suffix = randomBytes(3).toString("hex").toUpperCase()
  return `TNO-ROUTE-${fulfillmentDate}-${suffix}`
}

function depotPayload(): DeliveryRouteDepot {
  const depot = getBakeryBaseLocation()
  return {
    address: depot.address,
    lat: depot.lat,
    lng: depot.lng,
  }
}

function sortByRouteOrder(
  a: DeliveryRouteStopView,
  b: DeliveryRouteStopView
): number {
  if (a.routeOrder != null && b.routeOrder != null) {
    return a.routeOrder - b.routeOrder
  }
  if (a.routeOrder != null) return -1
  if (b.routeOrder != null) return 1
  return a.sheetRow - b.sheetRow
}

function toViewStop(
  stop: ReturnType<typeof adminOrderToRouteStop>,
  sequence: number,
  geocodeStatus: DeliveryRouteStopView["geocodeStatus"],
  geocodeError?: string
): DeliveryRouteStopView {
  return {
    ...stop,
    sequence,
    geocodeStatus,
    geocodeError,
  }
}

function buildFallbackStops(orders: AdminOrderRow[]): DeliveryRouteStopView[] {
  const activePaid = orders.filter(
    (order) => isPaidDeliveryOrder(order) && isActiveDeliveryStop(order.orderStatus)
  )

  const sorted = activePaid
    .map((order) => {
      const stop = adminOrderToRouteStop(order)
      return toViewStop(stop, 0, "missing_address")
    })
    .sort(sortByRouteOrder)

  return sorted.map((stop, index) => ({ ...stop, sequence: index + 1 }))
}

function collectMissingAddressFailures(
  orders: AdminOrderRow[]
): DeliveryRouteFailedStop[] {
  return orders
    .filter(
      (order) =>
        isPaidDeliveryOrder(order) &&
        isActiveDeliveryStop(order.orderStatus) &&
        !order.deliveryAddress.trim()
    )
    .map((order) => ({
      sheetRow: order.sheetRow,
      customerName: order.customerName,
      deliveryAddress: order.deliveryAddress,
      deliveryCity: order.deliveryCity,
      reason: "Delivery street address is missing.",
    }))
}

export async function optimizeDeliveryRoute(
  fulfillmentDate: string
): Promise<OptimizeDeliveryRouteResponse> {
  const routeBatchId = createRouteBatchId(fulfillmentDate)
  const depot = depotPayload()
  const warnings: string[] = []

  let orders: AdminOrderRow[] = []
  try {
    const data = await fetchPaidDeliveryOrdersForDate(fulfillmentDate)
    orders = data.orders
  } catch (err) {
    return {
      ok: false,
      optimized: false,
      fulfillmentDate,
      routeBatchId,
      depot,
      stops: [],
      failedStops: [],
      summary: null,
      warnings,
      error:
        err instanceof Error
          ? err.message
          : "Could not load delivery orders from Google Sheets.",
      googleMapsUrl: null,
    }
  }

  const failedStops = collectMissingAddressFailures(orders)
  const fallbackStops = buildFallbackStops(orders)
  const googleMapsUrl = buildGoogleMapsRouteUrl(
    fallbackStops.filter((stop) => stop.deliveryAddress.trim())
  )

  if (!getOpenRouteServiceApiKey()) {
    return {
      ok: true,
      optimized: false,
      fulfillmentDate,
      routeBatchId,
      depot,
      stops: fallbackStops,
      failedStops,
      summary: null,
      warnings,
      error:
        "Route optimization is unavailable. Set OPENROUTESERVICE_API_KEY on the server.",
      googleMapsUrl,
    }
  }

  const candidates = orders.filter(
    (order) =>
      isPaidDeliveryOrder(order) &&
      isActiveDeliveryStop(order.orderStatus) &&
      order.deliveryAddress.trim()
  )

  if (candidates.length === 0) {
    return {
      ok: true,
      optimized: false,
      fulfillmentDate,
      routeBatchId,
      depot,
      stops: [],
      failedStops,
      summary: null,
      warnings,
      error: "No paid delivery stops with addresses for this date.",
      googleMapsUrl: null,
    }
  }

  const geocodedStops: Array<{
    stop: ReturnType<typeof adminOrderToRouteStop>
    geocodeStatus: DeliveryRouteStopView["geocodeStatus"]
    geocodeError?: string
  }> = []

  for (const order of candidates) {
    const stop = adminOrderToRouteStop(order)

    try {
      const coords = await geocodeDeliveryAddress(
        stop.deliveryAddress,
        stop.deliveryCity,
        stop.deliveryZip || undefined
      )
      if (!coords) {
        failedStops.push({
          sheetRow: stop.sheetRow,
          customerName: stop.customerName,
          deliveryAddress: stop.deliveryAddress,
          deliveryCity: stop.deliveryCity,
          reason: stop.deliveryZip.trim()
            ? "Address could not be matched. Check spelling, city, and zip."
            : "Address could not be matched. Add a zip code in the Orders sheet.",
        })
        geocodedStops.push({
          stop,
          geocodeStatus: "failed",
          geocodeError: "Address could not be matched.",
        })
        continue
      }

      stop.lat = coords.lat
      stop.lng = coords.lng
      geocodedStops.push({ stop, geocodeStatus: "geocoded" })
    } catch (err) {
      const message =
        err instanceof OpenRouteServiceError
          ? err.message
          : "Geocoding failed for this address."

      failedStops.push({
        sheetRow: stop.sheetRow,
        customerName: stop.customerName,
        deliveryAddress: stop.deliveryAddress,
        deliveryCity: stop.deliveryCity,
        reason: message,
      })
      geocodedStops.push({
        stop,
        geocodeStatus: "failed",
        geocodeError: message,
      })
    }
  }

  const routable = geocodedStops.filter(
    (entry) => entry.stop.lat != null && entry.stop.lng != null
  )

  const routableViews = routable.map((entry, index) =>
    toViewStop(
      entry.stop,
      index + 1,
      entry.geocodeStatus,
      entry.geocodeError
    )
  )

  if (routable.length === 0) {
    return {
      ok: true,
      optimized: false,
      fulfillmentDate,
      routeBatchId,
      depot,
      stops: fallbackStops,
      failedStops,
      summary: null,
      warnings,
      error:
        "No geocoded delivery stops available. Fix addresses or try again later.",
      googleMapsUrl,
    }
  }

  const bakeryBase = getBakeryBaseLocation()
  const entryBySheetRow = new Map(
    routable.map((entry) => [entry.stop.sheetRow, entry])
  )

  try {
    const optimization = await optimizeDeliveryStops({
      depot: bakeryBase,
      jobs: routable.map((entry) => ({
        id: entry.stop.sheetRow,
        lat: entry.stop.lat!,
        lng: entry.stop.lng!,
      })),
    })

    const orderedStops = optimization.orderedJobIds.map((sheetRow, index) => {
      const entry = entryBySheetRow.get(sheetRow)
      if (!entry) {
        throw new OpenRouteServiceError(
          "Route optimization returned an unexpected stop order."
        )
      }
      return toViewStop(
        entry.stop,
        index + 1,
        entry.geocodeStatus,
        entry.geocodeError
      )
    })

    const unmatched = geocodedStops
      .filter((entry) => entry.stop.lat == null || entry.stop.lng == null)
      .map((entry, offset) =>
        toViewStop(
          entry.stop,
          orderedStops.length + offset + 1,
          entry.geocodeStatus,
          entry.geocodeError
        )
      )

    return {
      ok: true,
      optimized: true,
      fulfillmentDate,
      routeBatchId,
      depot,
      stops: [...orderedStops, ...unmatched],
      failedStops,
      summary: {
        totalDistanceMeters: optimization.totalDistanceMeters,
        totalDurationSeconds: optimization.totalDurationSeconds,
      },
      warnings,
      error: null,
      googleMapsUrl: buildGoogleMapsRouteUrl(orderedStops),
    }
  } catch (err) {
    const message =
      err instanceof OpenRouteServiceError
        ? err.message
        : "Route optimization failed. Using the unoptimized delivery list."

    return {
      ok: true,
      optimized: false,
      fulfillmentDate,
      routeBatchId,
      depot,
      stops: routableViews,
      failedStops,
      summary: null,
      warnings,
      error: message,
      googleMapsUrl: buildGoogleMapsRouteUrl(routableViews),
    }
  }
}
