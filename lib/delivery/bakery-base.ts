/** Fixed home base for delivery route optimization (start and end). */
export const BAKERY_BASE_ADDRESS =
  "549 Hopewell Park, Lexington, KY 40511"

/** Geocoded from OpenStreetMap (building at 549 Hopewell Park). */
export const BAKERY_BASE_LAT = 38.095671
export const BAKERY_BASE_LNG = -84.538669

export interface BakeryBaseLocation {
  address: string
  lat: number
  lng: number
}

export function getBakeryBase(): BakeryBaseLocation {
  return {
    address: BAKERY_BASE_ADDRESS,
    lat: BAKERY_BASE_LAT,
    lng: BAKERY_BASE_LNG,
  }
}
