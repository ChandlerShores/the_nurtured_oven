/**
 * Seed ~1 month of synthetic paid orders into Google Sheets (Orders + Order Line Items).
 * Run: pnpm sheets:seed-month
 */
import { readFileSync } from "fs"
import { fulfillmentPolicy } from "../lib/content/fulfillment"
import { appendPaidOrdersToSheet } from "../lib/google-sheets/append-paid-order"
import { getWeeklyCatalog } from "../lib/order/catalog"
import { calculateOrderTotalCents } from "../lib/order/delivery-fee"
import type {
  PaidOrderDetails,
  PaidOrderLineItem,
} from "../lib/order/paid-order-details"
import {
  addCalendarDays,
  formatBatchLabel,
  getFulfillmentFridayYmd,
} from "../lib/order/weekly-fulfillment"

const WEEKS = 5
const ORDERS_PER_WEEK = 10

const FIRST_NAMES = [
  "Alex",
  "Jordan",
  "Sam",
  "Taylor",
  "Morgan",
  "Casey",
  "Riley",
  "Quinn",
  "Avery",
  "Jamie",
  "Dana",
  "Robin",
  "Cameron",
  "Skyler",
  "Parker",
]

const LAST_NAMES = [
  "Miller",
  "Hayes",
  "Brooks",
  "Reed",
  "Morgan",
  "Kelly",
  "Sullivan",
  "Parker",
  "Bennett",
  "Foster",
  "Griffin",
  "Hayes",
  "Coleman",
  "Bryant",
]

const STREETS = [
  "12 Oak Lane",
  "48 Main St",
  "7 Birch Ct",
  "201 Lakeview Dr",
  "3 Church St",
  "89 Elm Ave",
]

const ORDER_STATUSES = [
  "New",
  "Baking",
  "Packed",
  "Delivered / Picked Up",
  "Complete",
  "Cancelled",
] as const

const DIETARY_NOTES = ["", "", "", "Nut-free please", "No nuts", "Gluten-aware"]

const MESSAGES = [
  "",
  "",
  "Leave on porch",
  "Text when ready",
  "Gift for neighbor",
  "Please ring doorbell",
]

function loadEnvLocal(): void {
  try {
    const raw = readFileSync(".env.local", "utf8")
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const i = trimmed.indexOf("=")
      if (i < 0) continue
      const key = trimmed.slice(0, i).trim()
      let value = trimmed.slice(i + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    console.warn("No .env.local found; using existing process.env")
  }
}

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

function formatYmd(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`
}

/** Deterministic pseudo-random in [0, 1). */
function createRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0
    return state / 0x1_0000_0000
  }
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!
}

function pickN<T>(rng: () => number, items: T[], n: number): T[] {
  const copy = [...items]
  const chosen: T[] = []
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(rng() * copy.length)
    chosen.push(copy.splice(idx, 1)[0]!)
  }
  return chosen
}

function fridaysGoingBack(weeks: number): { ymd: string; label: string }[] {
  let { year, month, day } = getFulfillmentFridayYmd(new Date())
  const fridays: { ymd: string; label: string }[] = []

  for (let i = 0; i < weeks; i++) {
    fridays.push({
      ymd: formatYmd(year, month, day),
      label: formatBatchLabel(year, month, day),
    })
    const prev = addCalendarDays(year, month, day, -7)
    year = prev.year
    month = prev.month
    day = prev.day
  }

  return fridays.reverse()
}

function orderStatusForWeek(weekIndex: number, weekCount: number, rng: () => number): string {
  const weeksAgo = weekCount - 1 - weekIndex
  if (weeksAgo >= 4) return pick(rng, ["Complete", "Delivered / Picked Up"])
  if (weeksAgo === 3) return pick(rng, ["Delivered / Picked Up", "Packed", "Complete"])
  if (weeksAgo === 2) return pick(rng, ["Packed", "Baking", "Delivered / Picked Up"])
  if (weeksAgo === 1) return pick(rng, ["Baking", "Packed", "New"])
  return pick(rng, ["New", "New", "Baking", "Cancelled"])
}

function randomOrderedAt(fulfillmentYmd: string, rng: () => number): Date {
  const [y, m, d] = fulfillmentYmd.split("-").map(Number)
  const windowStart = addCalendarDays(y, m, d, -7)
  const dayOffset = Math.floor(rng() * 6)
  const orderDay = addCalendarDays(
    windowStart.year,
    windowStart.month,
    windowStart.day,
    dayOffset
  )
  const hour = 9 + Math.floor(rng() * 12)
  const minute = Math.floor(rng() * 60)
  return new Date(orderDay.year, orderDay.month - 1, orderDay.day, hour, minute)
}

function buildSyntheticOrder(
  weekIndex: number,
  orderInWeek: number,
  batch: { ymd: string; label: string },
  weekCount: number,
  rng: () => number
): { details: PaidOrderDetails; orderedAt: Date } {
  const catalog = getWeeklyCatalog()
  const first = pick(rng, FIRST_NAMES)
  const last = pick(rng, LAST_NAMES)
  const name = `${first} ${last}`
  const slug = `${first.toLowerCase()}.${last.toLowerCase()}`
  const fulfillmentMethod = rng() < 0.38 ? "delivery" : "pickup"
  const itemCount = 1 + Math.floor(rng() * 3)
  const picked = pickN(rng, catalog, itemCount)

  const lineItems: PaidOrderLineItem[] = picked.map((item) => {
    const quantity = 1 + Math.floor(rng() * 2)
    const unitPriceCents = item.priceCents
    return {
      name: item.unitLabel ? `${item.name} (${item.unitLabel})` : item.name,
      quantity,
      slug: item.slug,
      type: "menu_item",
      unitPriceCents,
      lineTotalCents: unitPriceCents * quantity,
    }
  })

  const cartLines = lineItems.map((i) => ({
    slug: i.slug!,
    quantity: i.quantity,
  }))
  const { subtotalCents, deliveryFeeCents, totalCents } = calculateOrderTotalCents(
    cartLines,
    fulfillmentMethod
  )

  if (deliveryFeeCents > 0) {
    lineItems.push({
      name: fulfillmentPolicy.deliveryLineItemName,
      quantity: 1,
      type: "delivery_fee",
      unitPriceCents: deliveryFeeCents,
      lineTotalCents: deliveryFeeCents,
    })
  }

  const deliveryCity =
    fulfillmentMethod === "delivery"
      ? pick(rng, ["Georgetown", "Lexington"])
      : undefined
  const deliveryAddress =
    fulfillmentMethod === "delivery" ? pick(rng, STREETS) : undefined

  const seq = String(weekIndex * 100 + orderInWeek).padStart(3, "0")
  const internalRef = `TNO-${batch.ymd}-SEED${seq}`
  const squareOrderId = `SYN-${batch.ymd.replace(/-/g, "")}-${seq}`

  return {
    orderedAt: randomOrderedAt(batch.ymd, rng),
    details: {
      internalRef,
      fulfillmentMethod,
      fulfillmentDate: batch.ymd,
      batchLabel: batch.label,
      customerName: name,
      customerEmail: `${slug}${seq}@example.com`,
      customerPhone: `859-555-${String(1000 + weekIndex * 100 + orderInWeek).slice(-4)}`,
      lineItems,
      deliveryCity,
      deliveryAddress,
      dietary: pick(rng, DIETARY_NOTES) || undefined,
      message: pick(rng, MESSAGES) || undefined,
      subtotalCents,
      deliveryFeeCents: deliveryFeeCents > 0 ? deliveryFeeCents : undefined,
      amountCents: totalCents,
      squareOrderId,
      receiptUrl: `https://squareup.com/receipt/preview/${squareOrderId}`,
      orderStatus: orderStatusForWeek(weekIndex, weekCount, rng),
    },
  }
}

async function main() {
  loadEnvLocal()

  const fridays = fridaysGoingBack(WEEKS)
  const rng = createRng(42_026_0601)
  const entries: { details: PaidOrderDetails; orderedAt: Date }[] = []

  for (let w = 0; w < fridays.length; w++) {
    for (let o = 0; o < ORDERS_PER_WEEK; o++) {
      entries.push(buildSyntheticOrder(w, o + 1, fridays[w]!, fridays.length, rng))
    }
  }

  console.log(
    `Seeding ${entries.length} orders (${fridays.length} weeks × ${ORDERS_PER_WEEK}/week)…`
  )
  console.log(
    `Fulfillment Fridays: ${fridays.map((f) => f.ymd).join(", ")}`
  )

  await appendPaidOrdersToSheet(entries)

  const lineItemCount = entries.reduce(
    (sum, e) =>
      sum + e.details.lineItems.filter((i) => i.type !== "delivery_fee").length,
    0
  )

  console.log(
    `Done. Appended ${entries.length} rows to Orders and ${lineItemCount} rows to Order Line Items.`
  )
  console.log("Filter internal ref containing SEED to remove synthetic rows later.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
