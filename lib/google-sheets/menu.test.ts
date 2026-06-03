import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { buildCurrentMenuFromSheetRows } from "@/lib/content/menu-from-sheet"
import {
  activeMenuRows,
  parseMenuPrice,
  parseMenuSheetRows,
} from "@/lib/google-sheets/menu-parse"

describe("parseMenuSheetRows", () => {
  it("parses rows and filters inactive via activeMenuRows", () => {
    const rows = parseMenuSheetRows([
      [
        "slug",
        "name",
        "description",
        "price",
        "active",
        "featured",
        "category",
        "sort_order",
        "image_slug",
        "image_url",
        "allergens",
        "notes",
      ],
      [
        "b",
        "Beta",
        "Desc",
        "18",
        "TRUE",
        "FALSE",
        "Staple",
        "2",
        "beta",
        "",
        "wheat",
        "6-pack",
      ],
      [
        "a",
        "Alpha",
        "Desc",
        "21",
        "TRUE",
        "TRUE",
        "Feature",
        "1",
        "alpha",
        "",
        "dairy",
        "4-pack",
      ],
      [
        "z",
        "Hidden",
        "Desc",
        "10",
        "FALSE",
        "FALSE",
        "",
        "0",
        "",
        "",
        "",
        "",
      ],
    ])

    assert.equal(rows.length, 3)
    const active = activeMenuRows(rows)
    assert.equal(active.length, 2)
    assert.equal(active[0]?.slug, "a")
    assert.equal(active[1]?.slug, "b")
    assert.equal(active[0]?.priceCents, 2100)
    assert.equal(active[0]?.allergens.join(","), "dairy")
  })

  it("builds featured and supporting items from sheet rows", () => {
    const rows = activeMenuRows(
      parseMenuSheetRows([
        [
          "slug",
          "name",
          "description",
          "price",
          "active",
          "featured",
          "category",
          "sort_order",
          "image_slug",
          "image_url",
          "allergens",
          "notes",
        ],
        [
          "rolls",
          "Cinnamon Rolls",
          "Soft rolls",
          "21",
          "TRUE",
          "TRUE",
          "Feature",
          "1",
          "cinnamon-rolls",
          "",
          "wheat, eggs",
          "4-pack",
        ],
        [
          "cookie",
          "Oatmeal Cookie",
          "Cozy cookie",
          "18",
          "TRUE",
          "FALSE",
          "Staple",
          "2",
          "oatmeal-cookie",
          "",
          "",
          "6-pack",
        ],
      ])
    )

    const menu = buildCurrentMenuFromSheetRows(rows)
    assert.ok(menu)
    assert.equal(menu.featured.slug, "rolls")
    assert.equal(menu.featured.image, "/images/menu/cinnamon-rolls.jpg")
    assert.equal(menu.items.length, 1)
    assert.equal(menu.items[0]?.priceCents, 1800)
  })
})

describe("parseMenuPrice", () => {
  it("parses dollar amounts to cents", () => {
    assert.equal(parseMenuPrice("21"), 2100)
    assert.equal(parseMenuPrice("$18.50"), 1850)
  })
})
