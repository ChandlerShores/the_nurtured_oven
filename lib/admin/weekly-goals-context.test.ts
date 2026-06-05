import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { resolveWeeklyGoalsContext } from "@/lib/admin/weekly-goals-context"
import { parseWeeklyGoalDataRows } from "@/lib/google-sheets/weekly-goals-data"

describe("resolveWeeklyGoalsContext", () => {
  it("uses week row when present", () => {
    const rows = parseWeeklyGoalDataRows([
      ["fulfillment_date", "revenue_goal", "order_goal", "notes"],
      ["default", "300", "10", ""],
      ["2026-06-06", "450", "20", "Big week"],
    ])
    const ctx = resolveWeeklyGoalsContext(rows, "2026-06-06", "Friday 6/6")
    assert.equal(ctx.effective.revenueGoalCents, 45_000)
    assert.equal(ctx.effective.orderGoalCount, 20)
    assert.equal(ctx.hasWeekSpecificRow, true)
    assert.equal(ctx.usingDefaultBackup, false)
    assert.equal(ctx.weekTargets.revenueGoalCents, 45_000)
    assert.equal(ctx.defaultBackup.revenueGoalCents, 30_000)
  })

  it("falls back to default backup when week row missing", () => {
    const rows = parseWeeklyGoalDataRows([
      ["fulfillment_date", "revenue_goal", "order_goal", "notes"],
      ["default", "400", "15", ""],
    ])
    const ctx = resolveWeeklyGoalsContext(rows, "2026-06-06", "Friday 6/6")
    assert.equal(ctx.effective.revenueGoalCents, 40_000)
    assert.equal(ctx.hasWeekSpecificRow, false)
    assert.equal(ctx.usingDefaultBackup, true)
  })

  it("merges partial week row with default for missing fields", () => {
    const rows = parseWeeklyGoalDataRows([
      ["fulfillment_date", "revenue_goal", "order_goal", "notes"],
      ["default", "400", "15", ""],
      ["2026-06-06", "480", "", ""],
    ])
    const ctx = resolveWeeklyGoalsContext(rows, "2026-06-06", "Friday 6/6")
    assert.equal(ctx.effective.revenueGoalCents, 48_000)
    assert.equal(ctx.effective.orderGoalCount, 15)
    assert.equal(ctx.hasWeekSpecificRow, true)
  })
})
