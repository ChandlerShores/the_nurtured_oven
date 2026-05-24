const TIMEZONE = "America/New_York"

/** Shown on product cards and the closed-ordering CTA when outside the weekly window. */
export const WEEKLY_ORDERING_CLOSED_MESSAGE =
  "This week\u2019s orders are closed so we can prep and bake everything fresh. The next menu opens Friday at 9 AM."

interface EasternDateTime {
  /** 0 = Sunday … 6 = Saturday */
  weekday: number
  hour: number
  minute: number
}

function getEasternDateTime(date: Date): EasternDateTime {
  const testWeekday = process.env.ORDERING_TEST_WEEKDAY
  if (
    process.env.NODE_ENV === "development" &&
    testWeekday !== undefined &&
    testWeekday !== ""
  ) {
    const weekday = Number.parseInt(testWeekday, 10)
    if (!Number.isNaN(weekday) && weekday >= 0 && weekday <= 6) {
      return {
        weekday,
        hour: Number.parseInt(process.env.ORDERING_TEST_HOUR ?? "12", 10),
        minute: Number.parseInt(process.env.ORDERING_TEST_MINUTE ?? "0", 10),
      }
    }
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date)

  const weekdayStr = parts.find((p) => p.type === "weekday")?.value ?? "Sun"
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0)
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0)

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
    weekday: weekdayMap[weekdayStr] ?? 0,
    hour,
    minute,
  }
}

/**
 * Weekly ordering window (America/New_York):
 * - Open: Friday 9:00 AM through Wednesday 12:00 PM (noon).
 * - Closed: Wednesday 12:01 PM through the following Friday 8:59 AM.
 */
export function isWeeklyOrderingWindowOpen(now: Date = new Date()): boolean {
  const { weekday, hour, minute } = getEasternDateTime(now)

  if (weekday === 5) {
    return hour > 9 || (hour === 9 && minute >= 0)
  }

  if (weekday === 6 || weekday === 0 || weekday === 1 || weekday === 2) {
    return true
  }

  if (weekday === 3) {
    if (hour < 12) return true
    if (hour === 12 && minute === 0) return true
    return false
  }

  return false
}

export function getWeeklyOrderingState(now: Date = new Date()) {
  const isOpen = isWeeklyOrderingWindowOpen(now)
  return {
    isOpen,
    closedMessage: WEEKLY_ORDERING_CLOSED_MESSAGE,
    timezone: TIMEZONE,
  }
}
