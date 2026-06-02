import { readFileSync } from "fs"
import { appendPaidOrderToSheet } from "../lib/google-sheets/append-paid-order"
import type { PaidOrderDetails } from "../lib/order/paid-order-details"

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

const base: PaidOrderDetails = {
  fulfillmentMethod: "pickup",
  fulfillmentDate: "2099-12-31",
  batchLabel: "Friday 12/31",
  lineItems: [],
}

async function main() {
  loadEnvLocal()

  await appendPaidOrderToSheet({
    ...base,
    customerName: "TEST Customer A",
    customerEmail: "test+a@example.com",
    customerPhone: "555-000-0001",
    lineItems: [
      {
        name: "Oatmeal Cookie (6-pack)",
        quantity: 1,
        slug: "oatmeal-cookie",
        type: "menu_item",
        unitPriceCents: 1800,
        lineTotalCents: 1800,
      },
      {
        name: "Marshmallow Cloud Bar (4-pack)",
        quantity: 2,
        slug: "marshmallow-cloud-bar",
        type: "menu_item",
        unitPriceCents: 1600,
        lineTotalCents: 3200,
      },
    ],
    dietary: "none",
    message: "integration check A",
    internalRef: "TEST-INT-001",
    squareOrderId: "TEST-SQ-001",
    receiptUrl: "https://example.com/receipt/1",
    amountCents: 1234,
  })

  await appendPaidOrderToSheet({
    ...base,
    fulfillmentMethod: "delivery",
    customerName: "TEST Customer B",
    customerEmail: "test+b@example.com",
    customerPhone: "555-000-0002",
    lineItems: [
      {
        name: "Cinnamon Rolls (4-pack)",
        quantity: 1,
        slug: "cinnamon-rolls",
        type: "menu_item",
        unitPriceCents: 2100,
        lineTotalCents: 2100,
      },
    ],
    deliveryCity: "Georgetown",
    deliveryAddress: "123 Test St",
    dietary: "gluten",
    message: "integration check B",
    internalRef: "TEST-INT-002",
    squareOrderId: "TEST-SQ-002",
    receiptUrl: "https://example.com/receipt/2",
    amountCents: 4567,
  })

  console.log(
    "Appended 2 order rows to Orders and 3 line-item rows to Order Line Items."
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
