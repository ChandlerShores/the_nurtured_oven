import { WEEKLY_FULFILLMENT_TIMEZONE } from "@/lib/order/weekly-fulfillment"

export interface PrepDeadlineDisplay {
  headline: string
  context: string
  relativeLine: string | null
}

export type PrepUrgency = "passed" | "today" | "soon" | "later"
export type FulfillmentDayPhase = "before" | "today" | "after"

function easternYmd(date: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: WEEKLY_FULFILLMENT_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0)

  return { year: get("year"), month: get("month"), day: get("day") }
}

function calendarDayIndex(year: number, month: number, day: number): number {
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000)
}

function relativePrepLine(
  prepYear: number,
  prepMonth: number,
  prepDay: number,
  now: Date = new Date()
): string | null {
  const today = easternYmd(now)
  const diff =
    calendarDayIndex(prepYear, prepMonth, prepDay) -
    calendarDayIndex(today.year, today.month, today.day)

  if (diff < 0) return "Prep deadline passed"
  if (diff === 0) return "Prep due today"
  if (diff === 1) return "Prep due in 1 day"
  if (diff <= 7) return `Prep due in ${diff} days`
  return null
}

/** Prep is the Wednesday before fulfillment Friday (fulfillmentDate = Friday YYYY-MM-DD). */
export function formatPrepDeadlineDisplay(
  fulfillmentDate: string,
  now: Date = new Date()
): PrepDeadlineDisplay {
  const parts = fulfillmentDate.split("-").map(Number)
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
    return {
      headline: "Prep this week",
      context: "Check orders for bake date",
      relativeLine: null,
    }
  }

  const [year, month, day] = parts
  const prep = new Date(Date.UTC(year, month - 1, day - 2, 12, 0, 0))
  const fulfillment = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))

  const prepParts = {
    year: prep.getUTCFullYear(),
    month: prep.getUTCMonth() + 1,
    day: prep.getUTCDate(),
  }

  const prepLabel = prep.toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  })

  const fulfillmentLabel = fulfillment.toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "short",
    day: "numeric",
  })

  return {
    headline: `Prep ${prepLabel}, noon`,
    context: fulfillmentLabel,
    relativeLine: relativePrepLine(
      prepParts.year,
      prepParts.month,
      prepParts.day,
      now
    ),
  }
}

/** How close we are to Wednesday noon prep for this bake week. */
export function getPrepUrgency(
  fulfillmentDate: string,
  now: Date = new Date()
): PrepUrgency {
  const rel = formatPrepDeadlineDisplay(fulfillmentDate, now).relativeLine
  if (rel === "Prep deadline passed") return "passed"
  if (rel === "Prep due today") return "today"
  if (rel === "Prep due in 1 day") return "soon"
  return "later"
}

/** Bake Friday relative to today (Eastern). */
export function getFulfillmentDayPhase(
  fulfillmentDate: string,
  now: Date = new Date()
): FulfillmentDayPhase {
  const parts = fulfillmentDate.split("-").map(Number)
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
    return "before"
  }
  const [year, month, day] = parts
  const today = easternYmd(now)
  const diff =
    calendarDayIndex(year!, month!, day!) -
    calendarDayIndex(today.year, today.month, today.day)
  if (diff < 0) return "after"
  if (diff === 0) return "today"
  return "before"
}

/** Short label for prep deadline display. */
export function formatPrepDayLabel(fulfillmentDate: string): string {
  const display = formatPrepDeadlineDisplay(fulfillmentDate)
  if (display.relativeLine) {
    return `${display.relativeLine} · ${display.headline}`
  }
  return display.headline
}
