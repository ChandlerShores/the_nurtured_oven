import { extractHouseNumber } from "@/lib/delivery/address"

export interface GeocodeCandidate {
  lat: number
  lng: number
  label?: string
  name?: string
  housenumber?: string
  street?: string
  locality?: string
  layer?: string
  confidence?: number
  matchType?: string
}

const MIN_SCORE_WITH_HOUSENUMBER = 70
const MIN_SCORE_WITHOUT_HOUSENUMBER = 40

function normalizeToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ")
}

function localityMatches(city: string, locality?: string): boolean {
  if (!locality?.trim()) return false
  return normalizeToken(locality) === normalizeToken(city)
}

function housenumberMatches(expected: string, actual?: string): boolean {
  if (!actual?.trim()) return false
  return normalizeToken(actual) === normalizeToken(expected)
}

export function scoreGeocodeCandidate(
  candidate: GeocodeCandidate,
  inputAddress: string,
  inputCity: string
): number {
  const expectedHouseNumber = extractHouseNumber(inputAddress)
  let score = 0

  if (candidate.layer === "address") score += 100
  else if (candidate.layer === "street") score += 20
  else if (candidate.layer === "venue") score += 60
  else score -= 20

  if (expectedHouseNumber) {
    if (housenumberMatches(expectedHouseNumber, candidate.housenumber)) {
      score += 80
    } else if (candidate.layer === "street") {
      score -= 100
    } else if (!candidate.housenumber) {
      score -= 60
    }
  }

  if (localityMatches(inputCity, candidate.locality)) score += 25

  if (candidate.matchType === "exact") score += 20
  else if (candidate.matchType === "interpolated") score += 10
  else if (candidate.matchType === "fallback") score -= 15

  if (typeof candidate.confidence === "number") {
    score += candidate.confidence * 15
  }

  const streetHint = streetHintFromAddress(inputAddress)
  if (streetHint && candidate.street) {
    const candidateStreet = normalizeToken(candidate.street)
    const hint = normalizeToken(streetHint)
    if (candidateStreet.includes(hint) || hint.includes(candidateStreet)) {
      score += 15
    }
  }

  return score
}

function streetHintFromAddress(address: string): string | null {
  const withoutNumber = address.trim().replace(/^\d+[A-Za-z]?(-\d+)?\s*/, "")
  return withoutNumber.trim() || null
}

export function pickBestGeocodeCandidate(
  candidates: GeocodeCandidate[],
  inputAddress: string,
  inputCity: string
): GeocodeCandidate | null {
  if (candidates.length === 0) return null

  const expectedHouseNumber = extractHouseNumber(inputAddress)
  const minScore = expectedHouseNumber
    ? MIN_SCORE_WITH_HOUSENUMBER
    : MIN_SCORE_WITHOUT_HOUSENUMBER

  let best: { candidate: GeocodeCandidate; score: number } | null = null

  for (const candidate of candidates) {
    const score = scoreGeocodeCandidate(candidate, inputAddress, inputCity)
    if (score < minScore) continue
    if (!best || score > best.score) {
      best = { candidate, score }
    }
  }

  return best?.candidate ?? null
}

export function coordinatesNear(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
  maxMeters = 25
): boolean {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const earthRadiusM = 6_371_000
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h =
    sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng

  return 2 * earthRadiusM * Math.asin(Math.min(1, Math.sqrt(h))) <= maxMeters
}
