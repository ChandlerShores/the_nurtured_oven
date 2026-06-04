import { describe, it } from "node:test"
import assert from "node:assert/strict"
import type { AdminMenuItemView } from "@/lib/admin/menu-present"
import {
  filterMenuItemsBySearch,
  menuItemMatchesSearch,
} from "@/lib/admin/menu-search"

function sampleItem(
  overrides: Partial<AdminMenuItemView> = {}
): AdminMenuItemView {
  return {
    sheetRow: 2,
    slug: "brown-butter-blondie",
    name: "Brown Butter Blondie",
    description: "Chewy blondie with brown butter",
    priceCents: 2200,
    priceLabel: "$22",
    active: true,
    featured: false,
    category: "Bars",
    sortOrder: 1,
    imageSlug: "",
    imageUrl: "",
    allergens: "wheat, dairy, egg",
    notes: "6-pack",
    soldOut: false,
    image: "",
    ...overrides,
  }
}

describe("menuItemMatchesSearch", () => {
  it("matches name, slug, category, and allergens", () => {
    const item = sampleItem()
    assert.equal(menuItemMatchesSearch(item, "blondie"), true)
    assert.equal(menuItemMatchesSearch(item, "brown-butter"), true)
    assert.equal(menuItemMatchesSearch(item, "bars"), true)
    assert.equal(menuItemMatchesSearch(item, "dairy"), true)
  })

  it("requires every search token to match", () => {
    const item = sampleItem()
    assert.equal(menuItemMatchesSearch(item, "brown blondie"), true)
    assert.equal(menuItemMatchesSearch(item, "brown cookie"), false)
  })

  it("matches sold-out and hidden keywords", () => {
    assert.equal(
      menuItemMatchesSearch(sampleItem({ soldOut: true }), "sold"),
      true
    )
    assert.equal(
      menuItemMatchesSearch(sampleItem({ active: false }), "hidden"),
      true
    )
  })
})

describe("filterMenuItemsBySearch", () => {
  const items = [
    sampleItem(),
    sampleItem({
      slug: "chocolate-chip",
      name: "Chocolate Chip Cookie",
      category: "Cookies",
      active: false,
    }),
  ]

  it("filters by scope", () => {
    assert.equal(
      filterMenuItemsBySearch(items, "chocolate", "hidden").length,
      1
    )
    assert.equal(filterMenuItemsBySearch(items, "chocolate", "active").length, 0)
  })
})
