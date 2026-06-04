import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { buildDashboardAttention } from "@/lib/admin/dashboard-attention"
import {
  buildCustomerDietaryNotes,
  type DashboardStats,
} from "@/lib/admin/dashboard-stats"
import { formatPrepDeadlineDisplay } from "@/lib/admin/prep-deadline"

function baseStats(overrides: Partial<DashboardStats> = {}): DashboardStats {
  return {
    batchLabel: "Friday 6/5",
    fulfillmentDate: "2026-06-05",
    prepDayLabel: "",
    totalOrders: 10,
    revenueDisplay: "$100",
    itemsToBake: 20,
    pickupCount: 4,
    deliveryCount: 6,
    openCount: 8,
    statusCounts: {},
    topItems: [],
    productionList: [],
    recentOrders: [],
    newOrders: 10,
    deliveriesStillOut: 6,
    missingAddressCount: 0,
    unpaidCount: 0,
    customerDietaryNotes: [],
    ...overrides,
  }
}

describe("buildCustomerDietaryNotes", () => {
  it("pairs each note with the customer and fulfillment method", () => {
    const notes = buildCustomerDietaryNotes([
      {
        sheetRow: 2,
        orderedAt: "",
        customerName: "Jane Doe",
        customerEmail: "",
        customerPhone: "",
        fulfillmentLabel: "Friday",
        itemsSummary: "",
        totalQuantity: "1",
        fulfillmentMethod: "delivery",
        deliveryAddress: "1 Main",
        deliveryCity: "Lexington",
        deliveryZip: "40503",
        dietary: "No nuts",
        message: "",
        paymentStatus: "Paid",
        internalRef: "a",
        squareOrderId: "",
        receiptUrl: "",
        amount: "20",
        orderStatus: "New",
        routeOrder: null,
        routeBatchId: "",
      },
      {
        sheetRow: 3,
        orderedAt: "",
        customerName: "Sam Lee",
        customerEmail: "",
        customerPhone: "",
        fulfillmentLabel: "Friday",
        itemsSummary: "",
        totalQuantity: "1",
        fulfillmentMethod: "pickup",
        deliveryAddress: "",
        deliveryCity: "",
        deliveryZip: "",
        dietary: "Dairy-free frosting if possible",
        message: "",
        paymentStatus: "Paid",
        internalRef: "b",
        squareOrderId: "",
        receiptUrl: "",
        amount: "20",
        orderStatus: "New",
        routeOrder: null,
        routeBatchId: "",
      },
    ])

    assert.equal(notes.length, 2)
    assert.deepEqual(notes[0], {
      customerName: "Jane Doe",
      note: "No nuts",
      fulfillmentMethod: "delivery",
    })
    assert.deepEqual(notes[1], {
      customerName: "Sam Lee",
      note: "Dairy-free frosting if possible",
      fulfillmentMethod: "pickup",
    })
  })
})

describe("formatPrepDeadlineDisplay", () => {
  it("separates prep due from fulfillment date clearly", () => {
    const display = formatPrepDeadlineDisplay("2026-06-05")
    assert.match(display.headline, /Prep due Wed/i)
    assert.match(display.headline, /at noon/)
    assert.match(display.context, /Friday/i)
    assert.match(display.context, /fulfillment/)
    assert.doesNotMatch(display.headline, /Friday/i)
  })
})

describe("buildDashboardAttention", () => {
  it("hides zero-state issues from active row", () => {
    const section = buildDashboardAttention(
      baseStats({ missingAddressCount: 0, unpaidCount: 0 })
    )
    assert.equal(section.active.some((i) => i.id === "missing-addresses"), false)
    assert.equal(section.active.some((i) => i.id === "unpaid-orders"), false)
    assert.ok(section.allClear.includes("No missing addresses"))
    assert.ok(section.allClear.includes("No unpaid orders"))
  })

  it("caps active issues at three by priority", () => {
    const section = buildDashboardAttention(
      baseStats({
        newOrders: 5,
        deliveriesStillOut: 3,
        missingAddressCount: 2,
        unpaidCount: 1,
      })
    )
    assert.equal(section.active.length, 3)
    assert.equal(section.active[0]?.id, "missing-addresses")
    assert.equal(section.active[1]?.id, "unpaid-orders")
  })

  it("uses action-first headlines", () => {
    const section = buildDashboardAttention(baseStats())
    const newOrders = section.active.find((i) => i.id === "new-orders")
    assert.match(newOrders?.headline ?? "", /^10 new orders/)
    assert.equal(newOrders?.actionLabel, "Review orders")
  })
})
