import { WEEKLY_FULFILLMENT_TIMEZONE } from "@/lib/order/weekly-fulfillment"

export interface PrepDeadlineDisplay {
  headline: string
  context: string
  relativeLine: string | null
}

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
  prepDay: number
): string | null {
  const today = easternYmd(new Date())
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
  fulfillmentDate: string
): PrepDeadlineDisplay {
  const parts = fulfillmentDate.split("-").map(Number)
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
    return {
      headline: "Prep deadline this week",
      context: "Confirm fulfillment date in orders",
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
    headline: `Prep due ${prepLabel}, at noon`,
    context: `For ${fulfillmentLabel} fulfillment`,
    relativeLine: relativePrepLine(
      prepParts.year,
      prepParts.month,
      prepParts.day
    ),
  }
}

/** Short label for production card subtitles. */
export function formatPrepDayLabel(fulfillmentDate: string): string {
  const display = formatPrepDeadlineDisplay(fulfillmentDate)
  if (display.relativeLine) {
    return `${display.relativeLine} · ${display.headline}`
  }
  return display.headline
}
