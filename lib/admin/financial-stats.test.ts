import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  buildFinancialDashboard,
  buildFinancialDashboardPayload,
} from "@/lib/admin/financial-stats"
import type { AdminOrderLineRow, AdminOrderRow } from "@/lib/google-sheets/orders"

function order(partial: Partial<AdminOrderRow> & Pick<AdminOrderRow, "internalRef">): AdminOrderRow {
  return {
    sheetRow: 2,
    orderedAt: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    fulfillmentLabel: "2026-06-06",
    itemsSummary: "",
    totalQuantity: "1",
    fulfillmentMethod: "pickup",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryZip: "",
    dietary: "",
    message: "",
    paymentStatus: "Paid",
    squareOrderId: "",
    receiptUrl: "",
    amount: "25.00",
    orderStatus: "New",
    routeOrder: null,
    routeBatchId: "",
    ...partial,
  }
}

function line(
  partial: Partial<AdminOrderLineRow> & Pick<AdminOrderLineRow, "internalRef" | "slug">
): AdminOrderLineRow {
  return {
    sheetRow: 2,
    orderedAt: "",
    fulfillmentLabel: "2026-06-06",
    squareOrderId: "",
    customerName: "",
    name: partial.slug,
    category: "",
    quantity: 1,
    unitPriceCents: 2500,
    lineTotalCents: 2500,
    fulfillmentMethod: "pickup",
    orderStatus: "New",
    ...partial,
  }
}

describe("buildFinancialDashboard", () => {
  it("excludes refunded orders from revenue", () => {
    const orders = [
      order({ internalRef: "a", amount: "30.00" }),
      order({ internalRef: "b", amount: "50.00", orderStatus: "Refunded" }),
    ]
    const data = buildFinancialDashboard(
      orders,
      [line({ internalRef: "a", slug: "cookie" })],
      [],
      [],
      "2026-06-06"
    )
    assert.equal(data.summary.grossRevenueCents, 3000)
    assert.equal(data.summary.paidOrderCount, 1)
  })

  it("estimates product costs when Product Costs tab has data", () => {
    const orders = [order({ internalRef: "a", amount: "20.00" })]
    const lines = [
      line({ internalRef: "a", slug: "cookie", quantity: 2, lineTotalCents: 2000 }),
    ]
    const costs = [
      {
        sheetRow: 2,
        slug: "cookie",
        name: "Cookie",
        ingredientCostPerUnitCents: 100,
        packagingCostPerUnitCents: 50,
        laborMinutesPerUnit: 0,
        active: true,
        notes: "",
      },
    ]
    const data = buildFinancialDashboard(orders, lines, costs, [], "2026-06-06")
    assert.equal(data.summary.estimatedProductCostsCents, 300)
    assert.equal(data.productProfit[0]?.unitsSold, 2)
  })
})

describe("buildFinancialDashboardPayload", () => {
  it("includes estimate notes and week snapshots", () => {
    const orders = [
      order({ internalRef: "a", amount: "25.00", fulfillmentLabel: "2026-06-06" }),
    ]
    const payload = buildFinancialDashboardPayload(
      orders,
      [line({ internalRef: "a", slug: "cookie" })],
      [],
      [],
      "2026-06-06"
    )
    assert.ok(payload.estimateNotes.laborRateLabel.includes("/hr"))
    assert.ok(payload.weekSnapshots["2026-06-06"])
    assert.equal(payload.initialWeekKey, "2026-06-06")
  })
})
