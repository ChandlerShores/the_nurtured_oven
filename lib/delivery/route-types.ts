/** Shared delivery route types (safe for client + server). */

export type DeliveryGeocodeStatus =
  | "cached"
  | "geocoded"
  | "failed"
  | "missing_address"

export interface DeliveryRouteStop {
  sheetRow: number
  internalRef: string
  squareOrderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress: string
  deliveryCity: string
  deliveryZip: string
  itemsSummary: string
  orderStatus: string
  lat: number | null
  lng: number | null
  routeOrder: number | null
  routeBatchId: string
}

export interface DeliveryRouteStopView extends DeliveryRouteStop {
  sequence: number
  geocodeStatus: DeliveryGeocodeStatus
  geocodeError?: string
}

export interface DeliveryRouteFailedStop {
  sheetRow: number
  customerName: string
  deliveryAddress: string
  deliveryCity: string
  reason: string
}

export interface DeliveryRouteSummary {
  totalDistanceMeters: number
  totalDurationSeconds: number
}

export interface DeliveryRouteDepot {
  address: string
  lat: number
  lng: number
}

export interface OptimizeDeliveryRouteResponse {
  ok: boolean
  optimized: boolean
  fulfillmentDate: string
  routeBatchId: string
  depot: DeliveryRouteDepot
  stops: DeliveryRouteStopView[]
  failedStops: DeliveryRouteFailedStop[]
  summary: DeliveryRouteSummary | null
  warnings: string[]
  error: string | null
  googleMapsUrl: string | null
}

export interface LockDeliveryRouteResponse {
  ok: boolean
  routeBatchId: string
  lockedCount: number
}
