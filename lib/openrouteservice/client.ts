import "server-only"

import {
  buildStructuredGeocodeQuery,
  buildTextGeocodeQuery,
  geocodeQueryVariants,
} from "@/lib/delivery/geocode-query"
import {
  type GeocodeCandidate,
  pickBestGeocodeCandidate,
} from "@/lib/delivery/geocode-quality"
import {
  HEIGIT_API_BASE,
  HEIGIT_PELIAS_PREFIX,
  HEIGIT_VROOM_OPTIMIZATION_PATH,
  getOpenRouteServiceApiKey,
} from "@/lib/openrouteservice/config"
const REQUEST_TIMEOUT_MS = 20_000

export class OpenRouteServiceError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message)
    this.name = "OpenRouteServiceError"
  }
}

async function orsFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const apiKey = getOpenRouteServiceApiKey()
  if (!apiKey) {
    throw new OpenRouteServiceError(
      "OpenRouteService is not configured. Set OPENROUTESERVICE_API_KEY."
    )
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    return await fetch(`${HEIGIT_API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        Authorization: apiKey,
        ...(init?.headers ?? {}),
      },
    })
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new OpenRouteServiceError("OpenRouteService request timed out.")
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

export interface GeocodeResult {
  lat: number
  lng: number
}

interface OrsGeocodeFeature {
  geometry?: { coordinates?: number[] }
  properties?: {
    label?: string
    name?: string
    housenumber?: string
    street?: string
    locality?: string
    layer?: string
    confidence?: number
    match_type?: string
  }
}

function featureToCandidate(feature: OrsGeocodeFeature): GeocodeCandidate | null {
  const coords = feature.geometry?.coordinates
  if (!coords || coords.length < 2) return null

  const [lng, lat] = coords
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null

  const props = feature.properties ?? {}

  return {
    lat,
    lng,
    label: props.label,
    name: props.name,
    housenumber: props.housenumber,
    street: props.street,
    locality: props.locality,
    layer: props.layer,
    confidence: props.confidence,
    matchType: props.match_type,
  }
}

function dedupeCandidates(candidates: GeocodeCandidate[]): GeocodeCandidate[] {
  const seen = new Set<string>()
  const deduped: GeocodeCandidate[] = []

  for (const candidate of candidates) {
    const key = `${candidate.lat.toFixed(5)},${candidate.lng.toFixed(5)}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(candidate)
  }

  return deduped
}

async function fetchGeocodeCandidates(
  path: string
): Promise<GeocodeCandidate[]> {
  const res = await orsFetch(path)
  if (!res.ok) {
    throw new OpenRouteServiceError(
      `Geocoding failed (${res.status}). Check the address or try again later.`,
      res.status
    )
  }

  const data = (await res.json()) as { features?: OrsGeocodeFeature[] }
  return (data.features ?? [])
    .map(featureToCandidate)
    .filter((candidate): candidate is GeocodeCandidate => candidate != null)
}

export async function geocodeDeliveryAddress(
  address: string,
  city: string,
  zip?: string
): Promise<GeocodeResult | null> {
  const street = address.trim()
  const locality = city.trim()
  if (!street || !locality) return null

  const collected: GeocodeCandidate[] = []

  for (const variant of geocodeQueryVariants(street, locality, zip)) {
    const structuredParams = buildStructuredGeocodeQuery(
      variant.address,
      variant.city,
      variant.zip
    )
    collected.push(
      ...(await fetchGeocodeCandidates(
        `${HEIGIT_PELIAS_PREFIX}/search/structured?${structuredParams.toString()}`
      ))
    )

    const textParams = buildTextGeocodeQuery(
      variant.address,
      variant.city,
      variant.zip
    )
    collected.push(
      ...(await fetchGeocodeCandidates(
        `${HEIGIT_PELIAS_PREFIX}/search?${textParams.toString()}`
      ))
    )
  }

  const best = pickBestGeocodeCandidate(
    dedupeCandidates(collected),
    street,
    locality
  )

  if (!best) return null

  return { lat: best.lat, lng: best.lng }
}

export interface OptimizationJobInput {
  /** Unique job id (use sheet row). */
  id: number
  lat: number
  lng: number
}

export interface OptimizationResult {
  orderedJobIds: number[]
  totalDistanceMeters: number
  totalDurationSeconds: number
}

interface OrsOptimizationResponse {
  code?: number
  error?: string
  summary?: {
    distance?: number
    duration?: number
  }
  routes?: Array<{
    distance?: number
    duration?: number
    steps?: Array<{
      type?: string
      job?: number
    }>
  }>
}

export async function optimizeDeliveryStops(input: {
  depot: { lat: number; lng: number }
  jobs: OptimizationJobInput[]
}): Promise<OptimizationResult> {
  if (input.jobs.length === 0) {
    return {
      orderedJobIds: [],
      totalDistanceMeters: 0,
      totalDurationSeconds: 0,
    }
  }

  const body = {
    jobs: input.jobs.map((job) => ({
      id: job.id,
      location: [job.lng, job.lat],
      service: 300,
    })),
    vehicles: [
      {
        id: 1,
        profile: "driving-car",
        start: [input.depot.lng, input.depot.lat],
        end: [input.depot.lng, input.depot.lat],
      },
    ],
    // VROOM only includes distance when route geometry is computed.
    options: { g: true },
  }

  const res = await orsFetch(HEIGIT_VROOM_OPTIMIZATION_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const data = (await res.json()) as OrsOptimizationResponse

  if (!res.ok || data.code !== 0) {
    throw new OpenRouteServiceError(
      data.error ??
        `Route optimization failed (${res.status}). Try again or use the unoptimized list.`
    )
  }

  const route = data.routes?.[0]
  const orderedJobIds =
    route?.steps
      ?.filter((step) => step.type === "job" && typeof step.job === "number")
      .map((step) => step.job!) ?? []

  if (orderedJobIds.length === 0) {
    throw new OpenRouteServiceError(
      "Route optimization returned no delivery stops."
    )
  }

  const expectedIds = new Set(input.jobs.map((job) => job.id))
  for (const jobId of orderedJobIds) {
    if (!expectedIds.has(jobId)) {
      throw new OpenRouteServiceError(
        "Route optimization returned an unexpected stop order."
      )
    }
  }

  return {
    orderedJobIds,
    totalDistanceMeters:
      data.summary?.distance ?? route?.distance ?? 0,
    totalDurationSeconds:
      data.summary?.duration ?? route?.duration ?? 0,
  }
}
