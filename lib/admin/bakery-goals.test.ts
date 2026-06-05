import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  buildWeekGoalProgress,
  mergeBakeryWeekGoals,
  goalsFromWeeklyGoalRow,
} from "@/lib/admin/bakery-goals"

describe("mergeBakeryWeekGoals", () => {
  it("uses sheet values before env", () => {
    const merged = mergeBakeryWeekGoals(
      goalsFromWeeklyGoalRow({
        sheetRow: 2,
        fulfillmentDate: "2026-06-06",
        revenueGoalCents: 50_000,
        orderGoalCount: null,
        notes: "",
        updatedAt: "",
      }),
      {
        revenueGoalCents: 40_000,
        orderGoalCount: 15,
        source: "env",
        notes: null,
      }
    )
    assert.equal(merged.revenueGoalCents, 50_000)
    assert.equal(merged.orderGoalCount, 15)
    assert.equal(merged.source, "sheet")
  })
})

describe("buildWeekGoalProgress", () => {
  it("returns null when no goals configured", () => {
    assert.equal(
      buildWeekGoalProgress(5000, 3, {
        revenueGoalCents: null,
        orderGoalCount: null,
        source: "none",
        notes: null,
      }),
      null
    )
  })

  it("computes revenue and order percentages", () => {
    const progress = buildWeekGoalProgress(7500, 8, {
      revenueGoalCents: 10_000,
      orderGoalCount: 10,
      source: "sheet",
      notes: null,
    })
    assert.equal(progress?.revenuePercent, 75)
    assert.equal(progress?.orderPercent, 80)
  })
})
