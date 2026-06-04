import type { DeliveryCity } from "@/lib/content/fulfillment"
import { isDeliveryCity } from "@/lib/content/fulfillment"
import { normalizeDeliveryZip } from "@/lib/delivery/address-validation"

const KENTUCKY = "Kentucky"
const COUNTRY = "USA"

/** Bias geocode results toward the customer's selected delivery city. */
const CITY_FOCUS: Record<DeliveryCity, { lat: number; lng: number }> = {
  Georgetown: { lat: 38.2097, lng: -84.5588 },
  Lexington: { lat: 38.0407, lng: -84.5037 },
}

const STREET_ABBREVIATIONS: Record<string, string> = {
  st: "Street",
  rd: "Road",
  ave: "Avenue",
  dr: "Drive",
  ln: "Lane",
  cir: "Circle",
  ct: "Court",
  blvd: "Boulevard",
  pkwy: "Parkway",
  hwy: "Highway",
  pl: "Place",
  trl: "Trail",
}

const DIRECTION_ABBREVIATIONS: Record<string, string> = {
  n: "North",
  s: "South",
  e: "East",
  w: "West",
  ne: "Northeast",
  nw: "Northwest",
  se: "Southeast",
  sw: "Southwest",
}

export function formatGeocodeSearchText(
  address: string,
  city: string,
  zip?: string
): string {
  const street = address.trim()
  const locality = city.trim()
  const postal = normalizeDeliveryZip(zip ?? "") ?? zip?.trim()
  const parts = [street, locality, postal ? `KY ${postal}` : "KY", COUNTRY].filter(
    Boolean
  )
  return parts.join(", ")
}

export function getCityGeocodeFocus(
  city: string
): { lat: number; lng: number } | null {
  const trimmed = city.trim()
  if (!isDeliveryCity(trimmed)) return null
  return CITY_FOCUS[trimmed]
}

export function buildStructuredGeocodeQuery(
  address: string,
  city: string,
  zip?: string
): URLSearchParams {
  const params = new URLSearchParams({
    address: address.trim(),
    locality: city.trim(),
    region: KENTUCKY,
    country: COUNTRY,
    size: "5",
    layers: "address",
    "boundary.country": "US",
    "boundary.rect.min_lon": "-84.75",
    "boundary.rect.max_lon": "-84.35",
    "boundary.rect.min_lat": "37.95",
    "boundary.rect.max_lat": "38.25",
  })

  const postal = normalizeDeliveryZip(zip ?? "")
  if (postal) {
    params.set("postalcode", postal)
  }

  const focus = getCityGeocodeFocus(city)
  if (focus) {
    params.set("focus.point.lat", String(focus.lat))
    params.set("focus.point.lon", String(focus.lng))
  }

  return params
}

export function buildTextGeocodeQuery(
  address: string,
  city: string,
  zip?: string
): URLSearchParams {
  const params = new URLSearchParams({
    text: formatGeocodeSearchText(address, city, zip),
    size: "5",
    layers: "address",
    "boundary.country": "US",
    "boundary.rect.min_lon": "-84.75",
    "boundary.rect.max_lon": "-84.35",
    "boundary.rect.min_lat": "37.95",
    "boundary.rect.max_lat": "38.25",
  })

  const focus = getCityGeocodeFocus(city)
  if (focus) {
    params.set("focus.point.lat", String(focus.lat))
    params.set("focus.point.lon", String(focus.lng))
  }

  return params
}

/** Expand common street/direction abbreviations for a second geocode attempt. */
export function expandDeliveryAddressAbbreviations(address: string): string {
  let expanded = address.trim().replace(/\s+/g, " ")

  expanded = expanded.replace(
    /\b([NSEW]{1,2})\b(?=\s+\S)/gi,
    (match) => DIRECTION_ABBREVIATIONS[match.toLowerCase()] ?? match
  )

  expanded = expanded.replace(/\b([A-Za-z]{2,5})\.?$/i, (match, token: string) => {
    const normalized = token.toLowerCase()
    return STREET_ABBREVIATIONS[normalized] ?? match
  })

  return expanded
}

export function geocodeQueryVariants(
  address: string,
  city: string,
  zip?: string
): Array<{ label: string; address: string; city: string; zip?: string }> {
  const trimmedAddress = address.trim()
  const trimmedCity = city.trim()
  const trimmedZip = zip?.trim() || undefined
  const expanded = expandDeliveryAddressAbbreviations(trimmedAddress)

  const variants: Array<{
    label: string
    address: string
    city: string
    zip?: string
  }> = [{ label: "original", address: trimmedAddress, city: trimmedCity, zip: trimmedZip }]

  if (expanded !== trimmedAddress) {
    variants.push({
      label: "expanded",
      address: expanded,
      city: trimmedCity,
      zip: trimmedZip,
    })
  }

  return variants
}
