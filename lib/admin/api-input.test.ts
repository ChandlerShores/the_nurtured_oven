import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  parseAdminExpenseBody,
  parseAdminInternalRef,
  parseAdminMoneyAmount,
  parseAdminProductCostRow,
} from "@/lib/admin/api-input"

describe("parseAdminInternalRef", () => {
  it("accepts TNO refs", () => {
    assert.equal(
      parseAdminInternalRef("TNO-2026-06-06-ABC23"),
      "TNO-2026-06-06-ABC23"
    )
  })

  it("rejects invalid refs", () => {
    assert.equal(parseAdminInternalRef("not-a-ref"), null)
    assert.equal(parseAdminInternalRef(""), null)
  })
})

describe("parseAdminMoneyAmount", () => {
  it("parses dollar strings", () => {
    const r = parseAdminMoneyAmount("12.50")
    assert.equal(r.ok, true)
    assert.equal(r.cents, 1250)
  })

  it("rejects zero", () => {
    assert.equal(parseAdminMoneyAmount("0").ok, false)
  })
})

describe("parseAdminExpenseBody", () => {
  it("requires category and dates", () => {
    const bad = parseAdminExpenseBody({ amount: "5" })
    assert.equal(bad.ok, false)

    const ok = parseAdminExpenseBody({
      expenseDate: "2026-06-01",
      fulfillmentDate: "2026-06-06",
      category: "Ingredients",
      amount: "24.00",
    })
    assert.equal(ok.ok, true)
    if (ok.ok) {
      assert.equal(ok.expense.category, "Ingredients")
    }
  })
})

describe("parseAdminProductCostRow", () => {
  it("validates slug format", () => {
    const bad = parseAdminProductCostRow({ slug: "Bad Slug!" }, 0)
    assert.equal(bad.ok, false)

    const ok = parseAdminProductCostRow(
      { slug: "sourdough-loaf", name: "Loaf" },
      0
    )
    assert.equal(ok.ok, true)
    if (ok.ok) assert.equal(ok.row.slug, "sourdough-loaf")
  })
})
