import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { BAKERY_BASE_ADDRESS } from "@/lib/delivery/bakery-base"
import { buildGoogleMapsRouteUrl } from "@/lib/delivery/google-maps-url"

describe("buildGoogleMapsRouteUrl", () => {
  it("returns null for empty stops", () => {
    assert.equal(buildGoogleMapsRouteUrl([]), null)
  })

  it("builds a round-trip route from the bakery", () => {
    const url = buildGoogleMapsRouteUrl([
      {
        deliveryAddress: "123 Main St",
        deliveryCity: "Georgetown",
        deliveryZip: "40324",
      },
    ])
    assert.match(url!, /google\.com\/maps\/dir/)
    assert.match(url!, /origin=/)
    assert.match(url!, /destination=/)
    assert.ok(url!.includes(encodeURIComponent(BAKERY_BASE_ADDRESS)))
    assert.match(url!, /waypoints=/)
  })

  it("orders multiple stops between bakery origin and destination", () => {
    const url = buildGoogleMapsRouteUrl([
      { deliveryAddress: "1 A St", deliveryCity: "Georgetown", deliveryZip: "40324" },
      { deliveryAddress: "2 B St", deliveryCity: "Lexington", deliveryZip: "40503" },
    ])
    assert.match(url!, /waypoints=/)
    assert.match(url!, /1%20A%20St/)
    assert.match(url!, /2%20B%20St/)
  })
})
