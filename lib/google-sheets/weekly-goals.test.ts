import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  findWeekSpecificGoalRow,
  findWeeklyGoalForWeek,
  parseWeeklyGoalDataRows,
} from "@/lib/google-sheets/weekly-goals-data"

describe("parseWeeklyGoalDataRows", () => {
  it("parses header row and goal values", () => {
    const rows = parseWeeklyGoalDataRows([
      [
        "fulfillment_date",
        "revenue_goal",
        "order_goal",
        "notes",
        "updated_at",
      ],
      ["2026-06-06", "400", "15", "Launch week", "6/1/2026, 9:00 AM"],
    ])
    assert.equal(rows.length, 1)
    assert.equal(rows[0]?.revenueGoalCents, 40_000)
    assert.equal(rows[0]?.orderGoalCount, 15)
  })
})

describe("findWeekSpecificGoalRow", () => {
  it("does not return the default row", () => {
    const rows = parseWeeklyGoalDataRows([
      ["fulfillment_date", "revenue_goal", "order_goal", "notes"],
      ["default", "300", "10", ""],
    ])
    assert.equal(
      findWeekSpecificGoalRow(rows, "2026-06-06", "Friday 6/6"),
      null
    )
  })
})

describe("findWeeklyGoalForWeek", () => {
  it("prefers a matching week over default", () => {
    const rows = parseWeeklyGoalDataRows([
      ["fulfillment_date", "revenue_goal", "order_goal", "notes"],
      ["default", "300", "10", ""],
      ["2026-06-06", "450", "12", ""],
    ])
    const match = findWeeklyGoalForWeek(rows, "2026-06-06", "Friday 6/6")
    assert.equal(match?.revenueGoalCents, 45_000)
    assert.equal(match?.orderGoalCount, 12)
  })
})

