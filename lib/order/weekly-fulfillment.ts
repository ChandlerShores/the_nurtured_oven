import { currentMenu } from "@/lib/content/currentMenu"
import { generateInternalRef } from "@/lib/order/internal-ref"

export const WEEKLY_FULFILLMENT_TIMEZONE = "America/New_York"

export interface WeeklyFulfillmentContext {
  /** Friday fulfillment date (YYYY-MM-DD, America/New_York calendar). */
  fulfillmentDate: string
  /** Wednesday noon Eastern cutoff for this batch (ISO-8601 with offset). */
  cutoffAt: string
  /** Short label for emails and Square notes, e.g. "Friday 5/30". */
  batchLabel: string
  /** ISO week of the fulfillment Friday, e.g. "2026-W22". */
  orderWeek: string
  /** Baker-defined menu batch id from currentMenu.menuCycleId, when set. */
  menuCycle?: string
  /** Human-readable order reference, e.g. TNO-2026-05-30-A8F3K2. */
  internalRef: string
  timezone: typeof WEEKLY_FULFILLMENT_TIMEZONE
}

interface EasternYmdHm {
  year: number
  month: number
  day: number
  weekday: number
  hour: number
  minute: number
}

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

export function formatYmd(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`
}

/** Calendar parts in America/New_York (same weekday mapping as schedule.ts). */
export function getEasternYmdHm(date: Date = new Date()): EasternYmdHm {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: WEEKLY_FULFILLMENT_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date)

  const weekdayStr = parts.find((p) => p.type === "weekday")?.value ?? "Sun"
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }

  return {
    year: Number(parts.find((p) => p.type === "year")?.value ?? 0),
    month: Number(parts.find((p) => p.type === "month")?.value ?? 0),
    day: Number(parts.find((p) => p.type === "day")?.value ?? 0),
    weekday: weekdayMap[weekdayStr] ?? 0,
    hour: Number(parts.find((p) => p.type === "hour")?.value ?? 0),
    minute: Number(parts.find((p) => p.type === "minute")?.value ?? 0),
  }
}

/** Add calendar days in local YMD space (no timezone library). */
export function addCalendarDays(
  year: number,
  month: number,
  day: number,
  days: number
): { year: number; month: number; day: number } {
  const utc = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0))
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  }
}

/**
 * Friday fulfillment date for the active weekly batch (America/New_York).
 * During the open window, this is the upcoming Friday for that cycle
 * (same-day Friday when ordering on Friday after 9 AM).
 */
export function getFulfillmentFridayYmd(now: Date = new Date()): {
  year: number
  month: number
  day: number
} {
  const eastern = getEasternYmdHm(now)
  let daysUntilFriday = (5 - eastern.weekday + 7) % 7

  if (eastern.weekday === 5 && eastern.hour < 9) {
    daysUntilFriday = 0
  }

  return addCalendarDays(eastern.year, eastern.month, eastern.day, daysUntilFriday)
}

/** Wednesday noon Eastern immediately before the fulfillment Friday. */
export function getCutoffWednesdayYmd(fulfillment: {
  year: number
  month: number
  day: number
}): { year: number; month: number; day: number } {
  return addCalendarDays(fulfillment.year, fulfillment.month, fulfillment.day, -2)
}

/** ISO-8601 local noon Eastern for a calendar date (handles DST). */
export function easternNoonToIso(
  year: number,
  month: number,
  day: number
): string {
  for (const offsetHours of [-5, -4]) {
    const utcMs = Date.UTC(year, month - 1, day, 12, 0, 0) - offsetHours * 3_600_000
    const check = getEasternYmdHm(new Date(utcMs))
    if (
      check.year === year &&
      check.month === month &&
      check.day === day &&
      check.hour === 12 &&
      check.minute === 0
    ) {
      const sign = offsetHours <= 0 ? "-" : "+"
      const abs = String(Math.abs(offsetHours)).padStart(2, "0")
      return `${formatYmd(year, month, day)}T12:00:00${sign}${abs}:00`
    }
  }
  return `${formatYmd(year, month, day)}T12:00:00-04:00`
}

/** ISO week (YYYY-Www) for a calendar date. */
export function getIsoWeekString(
  year: number,
  month: number,
  day: number
): string {
  const d = new Date(Date.UTC(year, month - 1, day))
  const dayNr = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - dayNr + 3)
  const isoYear = d.getUTCFullYear()
  const jan4 = new Date(Date.UTC(isoYear, 0, 4))
  const week =
    1 +
    Math.round(
      ((d.getTime() - jan4.getTime()) / 86_400_000 - 3 + ((jan4.getUTCDay() + 6) % 7)) /
        7
    )
  return `${isoYear}-W${String(week).padStart(2, "0")}`
}

export function formatBatchLabel(
  year: number,
  month: number,
  day: number
): string {
  return `Friday ${month}/${day}`
}

export function formatBatchLabelShort(
  year: number,
  month: number,
  day: number
): string {
  return `Fri ${month}/${day}`
}

export function getWeeklyFulfillmentContext(
  now: Date = new Date()
): WeeklyFulfillmentContext {
  const friday = getFulfillmentFridayYmd(now)
  const fulfillmentDate = formatYmd(friday.year, friday.month, friday.day)
  const wednesday = getCutoffWednesdayYmd(friday)
  return {
    fulfillmentDate,
    cutoffAt: easternNoonToIso(
      wednesday.year,
      wednesday.month,
      wednesday.day
    ),
    batchLabel: formatBatchLabel(friday.year, friday.month, friday.day),
    orderWeek: getIsoWeekString(friday.year, friday.month, friday.day),
    menuCycle: currentMenu.menuCycleId?.trim() || undefined,
    internalRef: generateInternalRef(fulfillmentDate),
    timezone: WEEKLY_FULFILLMENT_TIMEZONE,
  }
}
