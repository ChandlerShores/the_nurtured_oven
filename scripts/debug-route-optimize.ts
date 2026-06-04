/**
 * Debug delivery route optimization against live Google Sheets data.
 * Run: pnpm exec tsx scripts/debug-route-optimize.ts
 */
import { readFileSync } from "fs"
import { resolve } from "path"

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local")
  try {
    const raw = readFileSync(path, "utf8")
    for (const line of raw.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eq = trimmed.indexOf("=")
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      process.env[key] = value
    }
  } catch {
    console.warn("No .env.local found")
  }
}

async function main() {
  loadEnvLocal()

  const key = process.env.OPENROUTESERVICE_API_KEY?.trim()
  console.log("OPENROUTESERVICE_API_KEY set:", Boolean(key))

  const { getWeeklyFulfillmentContext } = await import(
    "../lib/order/weekly-fulfillment"
  )
  const { fetchAllOrdersFromSheet, matchesFulfillmentWeek } = await import(
    "../lib/google-sheets/orders"
  )
  const { formatBatchLabel } = await import("../lib/order/weekly-fulfillment")
  const {
    isActiveDeliveryStop,
    isPaidDeliveryOrder,
  } = await import("../lib/delivery/delivery-orders")
  const { formatDeliveryAddress } = await import("../lib/delivery/address")
  const { geocodeDeliveryAddress } = await import(
    "../lib/openrouteservice/client"
  )
  const { getBakeryBase } = await import("../lib/delivery/bakery-base")

  const ctx = getWeeklyFulfillmentContext()
  console.log("\nfulfillmentDate:", ctx.fulfillmentDate, "batch:", ctx.batchLabel)

  const parts = ctx.fulfillmentDate.split("-").map(Number)
  const batchLabel =
    parts.length === 3
      ? formatBatchLabel(parts[0]!, parts[1]!, parts[2]!)
      : ctx.fulfillmentDate
  const all = await fetchAllOrdersFromSheet()
  const orders = all.filter((order) =>
    matchesFulfillmentWeek(order.fulfillmentLabel, ctx.fulfillmentDate, batchLabel)
  )
  const deliveries = orders.filter(
    (o) =>
      isPaidDeliveryOrder(o) &&
      isActiveDeliveryStop(o.orderStatus) &&
      o.deliveryAddress.trim()
  )

  console.log("\nPaid active deliveries with address:", deliveries.length)
  for (const o of deliveries) {
    console.log({
      row: o.sheetRow,
      name: o.customerName,
      address: formatDeliveryAddress(
        o.deliveryAddress,
        o.deliveryCity,
        o.deliveryZip
      ),
      payment: o.paymentStatus,
      status: o.orderStatus,
      routeOrder: o.routeOrder,
    })
  }

  if (deliveries.length === 0) {
    console.log("\nNo routable deliveries for this week.")
    return
  }

  const geocoded: Array<{ id: number; lat: number; lng: number; label: string }> =
    []

  for (const order of deliveries) {
    const label = `${order.customerName} (${order.sheetRow})`
    const query = formatDeliveryAddress(
      order.deliveryAddress,
      order.deliveryCity,
      order.deliveryZip
    )
    try {
      const coords = await geocodeDeliveryAddress(
        order.deliveryAddress,
        order.deliveryCity,
        order.deliveryZip || undefined
      )
      if (!coords) {
        console.log("\nGEOCODE MISS:", query)
        continue
      }
      console.log("\nGEOCODED:", query, "→", coords)
      geocoded.push({ id: order.sheetRow, lat: coords.lat, lng: coords.lng, label })
    } catch (err) {
      console.log("\nGEOCODE ERROR:", query, err)
    }
  }

  console.log("\nRoutable geocoded stops:", geocoded.length)
  if (geocoded.length < 2) {
    console.log("(Need 2+ geocoded stops to see reordering)")
  }

  if (!key || geocoded.length === 0) return

  const depot = getBakeryBase()
  const body = {
    jobs: geocoded.map((j) => ({
      id: j.id,
      location: [j.lng, j.lat],
      service: 300,
    })),
    vehicles: [
      {
        id: 1,
        profile: "driving-car",
        start: [depot.lng, depot.lat],
        end: [depot.lng, depot.lat],
      },
    ],
  }

  const res = await fetch("https://api.openrouteservice.org/optimization", {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  const data = (await res.json()) as {
    code?: number
    error?: string
    summary?: { distance?: number; duration?: number }
    routes?: Array<{
      distance?: number
      duration?: number
      steps?: Array<{ type?: string; job?: number; id?: number }>
    }>
  }

  console.log("\n--- ORS result ---")
  console.log("HTTP:", res.status, "code:", data.code, "error:", data.error)
  console.log("summary:", data.summary)

  const steps = data.routes?.[0]?.steps ?? []
  const jobSteps = steps.filter((s) => s.type === "job")
  console.log("\nOptimized order (sheet rows):")
  for (const step of jobSteps) {
    const id = step.job ?? step.id
    const match = geocoded.find((g) => g.id === id)
    console.log(" ", id, match?.label ?? "?")
  }

  console.log("\nSheet row order before optimize:", geocoded.map((g) => g.id))
  console.log(
    "Sheet row order after optimize:",
    jobSteps.map((s) => s.job ?? s.id)
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
