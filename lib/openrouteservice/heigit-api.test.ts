import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  HEIGIT_API_BASE,
  HEIGIT_PELIAS_PREFIX,
  HEIGIT_VROOM_OPTIMIZATION_PATH,
} from "@/lib/openrouteservice/heigit-api"

describe("HeiGIT API paths", () => {
  it("uses api.heigit.org instead of deprecated openrouteservice host", () => {
    assert.equal(HEIGIT_API_BASE, "https://api.heigit.org")
    assert.equal(HEIGIT_PELIAS_PREFIX, "/pelias/v1")
    assert.equal(HEIGIT_VROOM_OPTIMIZATION_PATH, "/vroom/v0")
  })
})
