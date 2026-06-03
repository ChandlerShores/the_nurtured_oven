import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  isValidMenuSlug,
  normalizeMenuSlug,
  slugifyMenuName,
} from "@/lib/admin/menu-slug"

describe("menu slug", () => {
  it("slugifies display names", () => {
    assert.equal(slugifyMenuName("Brown Butter Blondie"), "brown-butter-blondie")
  })

  it("validates slug format", () => {
    assert.equal(isValidMenuSlug("oatmeal-cookie"), true)
    assert.equal(isValidMenuSlug("Oatmeal"), false)
    assert.equal(isValidMenuSlug("a"), false)
  })

  it("normalizes from name when slug empty", () => {
    assert.equal(normalizeMenuSlug("", "Cinnamon Rolls"), "cinnamon-rolls")
  })
})
