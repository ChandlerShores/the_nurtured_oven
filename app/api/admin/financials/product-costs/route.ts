import { NextResponse } from "next/server"
import {
  parseAdminProductCostsPatch,
  readAdminJsonBody,
} from "@/lib/admin/api-input"
import { requireAdminApi } from "@/lib/admin/require-admin"
import {
  fetchProductCostsFromSheet,
  resolveProductCostSheetRow,
  upsertProductCostRow,
} from "@/lib/google-sheets/product-costs"

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const costs = await fetchProductCostsFromSheet()
    return NextResponse.json({ costs })
  } catch (err) {
    console.error("[admin] product costs fetch failed", err)
    return NextResponse.json(
      { error: "Could not load product costs." },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const parsed = await readAdminJsonBody(request)
  if (!parsed.ok) return parsed.response

  const costs = parseAdminProductCostsPatch(parsed.body)
  if (!costs.ok) {
    return NextResponse.json({ error: costs.error }, { status: 400 })
  }

  try {
    const existing = await fetchProductCostsFromSheet()
    let saved = 0

    for (const row of costs.costs) {
      const sheetRow = resolveProductCostSheetRow(
        existing,
        row.slug,
        row.sheetRow
      )
      const savedRow = await upsertProductCostRow(
        {
          slug: row.slug,
          name: row.name,
          ingredientCostPerUnit: row.ingredientCostPerUnit,
          packagingCostPerUnit: row.packagingCostPerUnit,
          laborMinutesPerUnit: row.laborMinutesPerUnit,
          active: row.active,
          notes: row.notes,
        },
        sheetRow
      )
      const key = row.slug.toLowerCase()
      const idx = existing.findIndex(
        (c) => c.slug.trim().toLowerCase() === key
      )
      if (idx >= 0) {
        existing[idx] = { ...existing[idx]!, sheetRow: savedRow }
      }
      saved += 1
    }

    const updated = await fetchProductCostsFromSheet()
    return NextResponse.json({
      ok: true,
      saved,
      costs: updated,
    })
  } catch (err) {
    console.error("[admin] product costs save failed", err)
    return NextResponse.json(
      { error: "Could not save product costs." },
      { status: 500 }
    )
  }
}
