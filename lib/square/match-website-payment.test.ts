import { describe, it, beforeEach } from "node:test"
import assert from "node:assert/strict"
import type { Square } from "square"
import {
  matchWebsitePayment,
  orderHasWebsiteMetadata,
} from "@/lib/square/match-website-payment"
import { buildOrderMetadata } from "@/lib/square/order-metadata"
import type { WeeklyFulfillmentContext } from "@/lib/order/weekly-fulfillment"
import {
  registerWebsiteOrder,
  resetWebsiteOrderStoreForTests,
} from "@/lib/square/website-order-store"

const batch: WeeklyFulfillmentContext = {
  fulfillmentDate: "2026-05-29",
  cutoffAt: "2026-05-27T12:00:00-04:00",
  batchLabel: "Friday 5/29",
  orderWeek: "2026-W22",
  menuCycle: "2026-05-24",
  internalRef: "TNO-2026-05-29-A8F3K2",
  timezone: "America/New_York",
}

function websiteOrder(overrides: Partial<Square.Order> = {}): Square.Order {
  return {
    id: "order_website_1",
    referenceId: batch.internalRef,
    metadata: buildOrderMetadata(batch, "pickup"),
    ...overrides,
  }
}

describe("matchWebsitePayment", () => {
  beforeEach(() => {
    resetWebsiteOrderStoreForTests()
  })

  it("matches a registered website order by square order id", async () => {
    await registerWebsiteOrder({
      squareOrderId: "order_website_1",
      internalRef: batch.internalRef,
      referenceId: batch.internalRef,
    })

    const result = await matchWebsitePayment(
      {
        id: "pay_1",
        status: "COMPLETED",
        order_id: "order_website_1",
      },
      websiteOrder()
    )

    assert.equal(result.matched, true)
    if (result.matched) {
      assert.equal(result.internalRef, batch.internalRef)
      assert.equal(result.squareOrderId, "order_website_1")
    }
  })

  it("matches using Square order metadata when store entry is missing", async () => {
    const result = await matchWebsitePayment(
      {
        id: "pay_2",
        status: "COMPLETED",
        order_id: "order_website_1",
      },
      websiteOrder()
    )

    assert.equal(result.matched, true)
  })

  it("ignores payments without an order_id", async () => {
    const result = await matchWebsitePayment(
      { id: "pay_invoice", status: "COMPLETED" },
      null
    )

    assert.equal(result.matched, false)
    if (!result.matched) {
      assert.match(result.reason, /no Square order_id/i)
    }
  })

  it("ignores invoice-style payments without website metadata", async () => {
    const result = await matchWebsitePayment(
      {
        id: "pay_3",
        status: "COMPLETED",
        order_id: "order_invoice_1",
        source_type: "INVOICE",
      },
      {
        id: "order_invoice_1",
        referenceId: "INV-1001",
        metadata: { source: "invoice" },
      }
    )

    assert.equal(result.matched, false)
  })

  it("ignores POS orders that lack website markers", async () => {
    const result = await matchWebsitePayment(
      {
        id: "pay_4",
        status: "COMPLETED",
        order_id: "order_pos_1",
      },
      {
        id: "order_pos_1",
        referenceId: "POS-001",
        metadata: {},
      }
    )

    assert.equal(result.matched, false)
    if (!result.matched) {
      assert.match(result.reason, /not registered as a website checkout/i)
    }
  })
})

describe("orderHasWebsiteMetadata", () => {
  it("detects website checkout metadata", () => {
    assert.equal(orderHasWebsiteMetadata(websiteOrder()), true)
  })
})
