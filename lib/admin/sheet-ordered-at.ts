import { WEEKLY_FULFILLMENT_TIMEZONE } from "@/lib/order/weekly-fulfillment"

/** Parse order timestamps from the Orders tab (locale-formatted). */
export function parseSheetOrderedAt(value: string): Date | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const parsed = Date.parse(trimmed)
  if (Number.isFinite(parsed)) {
    return new Date(parsed)
  }

  const m = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s+(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
  )
  if (!m) return null

  const month = Number(m[1])
  const day = Number(m[2])
  let year = Number(m[3])
  if (year < 100) year += 2000
  let hour = Number(m[4])
  const minute = Number(m[5])
  const ampm = (m[6] ?? "").toUpperCase()
  if (ampm === "PM" && hour < 12) hour += 12
  if (ampm === "AM" && hour === 12) hour = 0

  const guess = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`)
  if (!Number.isFinite(guess.getTime())) return null

  const eastern = new Intl.DateTimeFormat("en-US", {
    timeZone: WEEKLY_FULFILLMENT_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(guess)

  const y = Number(eastern.find((p) => p.type === "year")?.value ?? year)
  const mo = Number(eastern.find((p) => p.type === "month")?.value ?? month)
  const d = Number(eastern.find((p) => p.type === "day")?.value ?? day)
  const h = Number(eastern.find((p) => p.type === "hour")?.value ?? hour)
  const min = Number(eastern.find((p) => p.type === "minute")?.value ?? minute)

  return new Date(Date.UTC(y, mo - 1, d, h, min))
}
