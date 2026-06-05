import {
  matchesFulfillmentWeek,
  previousFulfillmentDate,
} from "@/lib/admin/fulfillment-label-match"
import { parseSheetOrderedAt } from "@/lib/admin/sheet-ordered-at"
import { isWeeklyOrderingWindowOpen } from "@/lib/menu/schedule"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"
import {
  addCalendarDays,
  easternNoonToIso,
  formatBatchLabel,
  getCutoffWednesdayYmd,
  getEasternYmdHm,
  getFulfillmentFridayYmd,
  getWeeklyFulfillmentContext,
} from "@/lib/order/weekly-fulfillment"
import { parseMoneyToCents } from "@/lib/admin/money"
import type { BakeryWeekGoals } from "@/lib/admin/bakery-goals"

function isPaidOrder(order: AdminOrderRow): boolean {
  const status = order.paymentStatus.trim().toLowerCase()
  return status === "paid" || status === "completed"
}

function easternDateTimeMs(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): number {
  const iso =
    hour === 12 && minute === 0
      ? easternNoonToIso(year, month, day)
      : `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`
  const parsed = Date.parse(iso)
  return Number.isFinite(parsed) ? parsed : NaN
}

export function getOrderingWindowBounds(now: Date = new Date()): {
  fulfillmentDate: string
  batchLabel: string
  windowStartMs: number
  windowEndMs: number
} {
  const friday = getFulfillmentFridayYmd(now)
  const fulfillmentDate = `${friday.year}-${String(friday.month).padStart(2, "0")}-${String(friday.day).padStart(2, "0")}`
  const batchLabel = formatBatchLabel(friday.year, friday.month, friday.day)
  const openFriday = addCalendarDays(friday.year, friday.month, friday.day, -7)
  const windowStartMs = easternDateTimeMs(
    openFriday.year,
    openFriday.month,
    openFriday.day,
    9,
    0
  )
  const wednesday = getCutoffWednesdayYmd(friday)
  const windowEndMs = easternDateTimeMs(
    wednesday.year,
    wednesday.month,
    wednesday.day,
    12,
    0
  )

  return { fulfillmentDate, batchLabel, windowStartMs, windowEndMs }
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "closed"
  const totalMin = Math.ceil(ms / 60_000)
  if (totalMin < 60) return `${totalMin}m`
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60
  if (hours < 48) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  const days = Math.floor(hours / 24)
  const remHours = hours % 24
  return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`
}

export interface OrderingPulseStats {
  isOpen: boolean
  batchLabel: string
  closesInLabel: string
  ordersThisWindow: number
  revenueCentsThisWindow: number
  itemsThisWindow: number
  ordersPriorWindowSameElapsed: number | null
  orderGoalCount: number | null
  onTrackLabel: string | null
}

/** Countdown until Wednesday noon cutoff; null when the window is closed. */
export function getOrderingWindowClosesInLabel(now: Date = new Date()): string | null {
  if (!isWeeklyOrderingWindowOpen(now)) return null
  const bounds = getOrderingWindowBounds(now)
  return formatCountdown(bounds.windowEndMs - now.getTime())
}

export function buildOrderingPulseStats(
  allOrders: AdminOrderRow[],
  goals: BakeryWeekGoals,
  now: Date = new Date()
): OrderingPulseStats | null {
  if (!isWeeklyOrderingWindowOpen(now)) return null

  const ctx = getWeeklyFulfillmentContext(now)
  const bounds = getOrderingWindowBounds(now)
  const elapsed = now.getTime() - bounds.windowStartMs

  let ordersThisWindow = 0
  let revenueCentsThisWindow = 0
  let itemsThisWindow = 0

  for (const order of allOrders) {
    if (!isPaidOrder(order)) continue
    if (
      !matchesFulfillmentWeek(
        order.fulfillmentLabel,
        ctx.fulfillmentDate,
        ctx.batchLabel
      )
    ) {
      continue
    }
    const at = parseSheetOrderedAt(order.orderedAt)
    if (!at || at.getTime() < bounds.windowStartMs) continue
    ordersThisWindow += 1
    revenueCentsThisWindow += parseMoneyToCents(order.amount)
    const qty = Number.parseInt(order.totalQuantity, 10)
    if (Number.isFinite(qty) && qty > 0) itemsThisWindow += qty
  }

  const prevDate = previousFulfillmentDate(ctx.fulfillmentDate)
  const prevParts = prevDate.split("-").map(Number)
  const prevBatch =
    prevParts.length === 3
      ? formatBatchLabel(prevParts[0], prevParts[1], prevParts[2])
      : prevDate
  const prevOpen = addCalendarDays(
    prevParts[0] ?? 0,
    prevParts[1] ?? 0,
    prevParts[2] ?? 0,
    -7
  )
  const prevStartMs = easternDateTimeMs(
    prevOpen.year,
    prevOpen.month,
    prevOpen.day,
    9,
    0
  )
  const compareEndMs = prevStartMs + elapsed

  let ordersPriorWindowSameElapsed = 0
  let hasPrior = false
  for (const order of allOrders) {
    if (!isPaidOrder(order)) continue
    if (!matchesFulfillmentWeek(order.fulfillmentLabel, prevDate, prevBatch)) {
      continue
    }
    const at = parseSheetOrderedAt(order.orderedAt)
    if (!at) continue
    hasPrior = true
    const t = at.getTime()
    if (t >= prevStartMs && t <= compareEndMs) {
      ordersPriorWindowSameElapsed += 1
    }
  }

  let onTrackLabel: string | null = null
  if (goals.orderGoalCount) {
    const pct = Math.round((ordersThisWindow / goals.orderGoalCount) * 100)
    onTrackLabel = `~${ordersThisWindow} of ${goals.orderGoalCount} orders (${pct}% of goal)`
  } else if (itemsThisWindow > 0) {
    onTrackLabel = `${itemsThisWindow} items ordered so far`
  }

  const closesInMs = bounds.windowEndMs - now.getTime()

  return {
    isOpen: true,
    batchLabel: ctx.batchLabel,
    closesInLabel: formatCountdown(closesInMs),
    ordersThisWindow,
    revenueCentsThisWindow,
    itemsThisWindow,
    ordersPriorWindowSameElapsed: hasPrior ? ordersPriorWindowSameElapsed : null,
    orderGoalCount: goals.orderGoalCount,
    onTrackLabel,
  }
}

export function orderingPulseHeadline(pulse: OrderingPulseStats): string {
  const eastern = getEasternYmdHm()
  const compare =
    pulse.ordersPriorWindowSameElapsed != null
      ? ` · ${pulse.ordersThisWindow} now vs ${pulse.ordersPriorWindowSameElapsed} last week`
      : ""
  return `Ordering closes in ${pulse.closesInLabel}${compare}`
}
