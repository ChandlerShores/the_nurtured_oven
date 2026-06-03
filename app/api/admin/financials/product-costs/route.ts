import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin/require-admin"
import {
  fetchProductCostsFromSheet,
  upsertProductCostRow,
  type ProductCostUpdate,
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

  let body: {
    costs?: (ProductCostUpdate & { sheetRow?: number })[]
  }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const costs = body.costs
  if (!Array.isArray(costs) || costs.length === 0) {
    return NextResponse.json({ error: "No costs to save." }, { status: 400 })
  }

  try {
    for (const row of costs) {
      if (!row.slug?.trim()) continue
      await upsertProductCostRow(
        {
          slug: row.slug,
          name: row.name ?? row.slug,
          ingredientCostPerUnit: row.ingredientCostPerUnit ?? "",
          packagingCostPerUnit: row.packagingCostPerUnit ?? "",
          laborMinutesPerUnit: Number(row.laborMinutesPerUnit) || 0,
          active: row.active !== false,
          notes: row.notes ?? "",
        },
        row.sheetRow
      )
    }
    const updated = await fetchProductCostsFromSheet()
    return NextResponse.json({ ok: true, costs: updated })
  } catch (err) {
    console.error("[admin] product costs save failed", err)
    return NextResponse.json(
      { error: "Could not save product costs." },
      { status: 500 }
    )
  }
}
