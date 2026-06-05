import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { buildDashboardAttention } from "@/lib/admin/dashboard-attention"
import { buildDashboardWeekContext } from "@/lib/admin/dashboard-week-context"
import type { DashboardStats } from "@/lib/admin/dashboard-stats"
import {
  formatPrepDeadlineDisplay,
  getFulfillmentDayPhase,
} from "@/lib/admin/prep-deadline"

function baseStats(overrides: Partial<DashboardStats> = {}): DashboardStats {
  return {
    batchLabel: "Friday, Jun 5",
    fulfillmentDate: "2026-06-05",
    prepDayLabel: "",
    totalOrders: 10,
    revenueDisplay: "$100",
    itemsToBake: 20,
    pickupCount: 4,
    deliveryCount: 6,
    openCount: 8,
    statusCounts: {},
    recentOrders: [],
    newOrders: 0,
    deliveriesNotDelivered: 0,
    readyPickupCount: 0,
    readyDeliveryCount: 0,
    missingAddressCount: 0,
    unpaidCount: 0,
    issueCount: 0,
    revenueCents: 10_000,
    paidOrderCount: 10,
    ...overrides,
  }
}

describe("formatPrepDeadlineDisplay", () => {
  it("separates prep due from fulfillment date clearly", () => {
    const display = formatPrepDeadlineDisplay("2026-06-05")
    assert.match(display.headline, /Prep.*Wed/i)
    assert.match(display.headline, /noon/)
    assert.match(display.context, /Friday/i)
    assert.doesNotMatch(display.headline, /Friday/i)
  })
})

describe("buildDashboardWeekContext", () => {
  const thursday = new Date("2026-06-04T12:00:00-04:00")

  it("describes an open ordering window in the header", () => {
    const ctx = buildDashboardWeekContext(baseStats(), {
      orderingClosesIn: "4h 10m",
      now: thursday,
    })
    assert.equal(ctx.phase, "ordering_open")
    assert.match(ctx.phaseDescription, /Wednesday at noon/)
    assert.match(ctx.phaseDescription, /4h 10m/)
  })
})

describe("buildDashboardAttention", () => {
  const thursday = new Date("2026-06-04T12:00:00-04:00")
  const friday = new Date("2026-06-05T12:00:00-04:00")

  it("shows new orders mid-week but not Friday delivery cards", () => {
    const week = buildDashboardWeekContext(
      baseStats({
        fulfillmentDate: "2026-06-19",
        newOrders: 10,
        deliveriesNotDelivered: 6,
      }),
      { now: thursday }
    )
    const section = buildDashboardAttention(
      baseStats({
        fulfillmentDate: "2026-06-19",
        newOrders: 10,
        deliveriesNotDelivered: 6,
      }),
      { now: thursday, weekPhase: week.phase }
    )
    assert.ok(section.items.some((i) => i.id === "new-orders"))
    assert.ok(!section.items.some((i) => i.id === "deliveries-open"))
  })

  it("does not duplicate the ordering countdown in action rows", () => {
    const week = buildDashboardWeekContext(baseStats(), {
      orderingClosesIn: "2h",
      now: thursday,
    })
    const section = buildDashboardAttention(baseStats(), {
      orderingClosesIn: "2h",
      now: thursday,
      weekPhase: week.phase,
    })
    assert.ok(!section.items.some((i) => i.id === "ordering-open"))
  })

  it("shows new orders while the ordering window is open", () => {
    const week = buildDashboardWeekContext(baseStats({ newOrders: 2 }), {
      orderingClosesIn: "2h",
      now: thursday,
    })
    const section = buildDashboardAttention(baseStats({ newOrders: 2 }), {
      orderingClosesIn: "2h",
      now: thursday,
      weekPhase: week.phase,
    })
    const card = section.items.find((i) => i.id === "new-orders")
    assert.ok(card)
    assert.match(card?.context ?? "", /Review each order/i)
    assert.equal(section.items[0]?.id, "new-orders")
  })

  it("prioritizes blockers", () => {
    const week = buildDashboardWeekContext(
      baseStats({ fulfillmentDate: "2026-06-19" }),
      { now: thursday }
    )
    const section = buildDashboardAttention(
      baseStats({
        fulfillmentDate: "2026-06-19",
        issueCount: 2,
        unpaidCount: 1,
        missingAddressCount: 3,
      }),
      { now: thursday, weekPhase: week.phase }
    )
    assert.equal(section.items[0]?.id, "missing-addresses")
    assert.match(section.items[0]?.headline ?? "", /are missing an address/)
  })

  it("uses grammatical headlines for new orders when prep has passed", () => {
    const week = buildDashboardWeekContext(baseStats(), { now: thursday })
    const section = buildDashboardAttention(
      baseStats({ newOrders: 3 }),
      { now: thursday, weekPhase: week.phase }
    )
    const card = section.items.find((i) => i.id === "new-orders")
    assert.ok(card)
    assert.match(card?.headline ?? "", /3 orders are still New/)
    assert.match(card?.context ?? "", /prep cutoff has passed/i)
    assert.equal(card?.href, "/admin/orders?status=New")
  })

  it("shows new orders when prep is still far out but ordering is closed", () => {
    const week = buildDashboardWeekContext(
      baseStats({ fulfillmentDate: "2026-06-19", newOrders: 4 }),
      { now: thursday }
    )
    assert.equal(week.phase, "after_prep")
    const section = buildDashboardAttention(
      baseStats({ fulfillmentDate: "2026-06-19", newOrders: 4 }),
      { now: thursday, weekPhase: week.phase }
    )
    assert.ok(section.items.some((i) => i.id === "new-orders"))
  })

  it("shows Friday fulfillment actions on bake day", () => {
    if (getFulfillmentDayPhase("2026-06-05", friday) !== "today") return

    const week = buildDashboardWeekContext(baseStats(), { now: friday })
    const section = buildDashboardAttention(
      baseStats({
        readyPickupCount: 2,
        readyDeliveryCount: 1,
        deliveriesNotDelivered: 3,
      }),
      { now: friday, weekPhase: week.phase }
    )
    assert.ok(section.items.some((i) => i.id === "pickup-ready"))
    assert.match(
      section.items.find((i) => i.id === "pickup-ready")?.headline ?? "",
      /pickups are Ready/
    )
  })
})
