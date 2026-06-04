import { NextResponse } from "next/server"
import { revalidatePublicMenu } from "@/lib/admin/revalidate-public-menu"
import { requireAdminApi } from "@/lib/admin/require-admin"
import { isValidMenuSlug } from "@/lib/admin/menu-slug"
import {
  fetchAllMenuRowsFromSheet,
  updateMenuSoldOutInSheet,
} from "@/lib/google-sheets/menu-admin"

export async function PATCH(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let body: { sheetRow?: unknown; slug?: unknown; soldOut?: unknown }
  try {
    body = (await request.json()) as {
      sheetRow?: unknown
      slug?: unknown
      soldOut?: unknown
    }
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const sheetRow = Number(body.sheetRow)
  const slug = typeof body.slug === "string" ? body.slug.trim() : ""
  if (!Number.isFinite(sheetRow) || sheetRow < 2) {
    return NextResponse.json({ error: "Invalid sheet row." }, { status: 400 })
  }
  if (!slug || !isValidMenuSlug(slug)) {
    return NextResponse.json({ error: "Invalid menu item ID." }, { status: 400 })
  }
  if (typeof body.soldOut !== "boolean") {
    return NextResponse.json(
      { error: "soldOut must be a boolean." },
      { status: 400 }
    )
  }

  try {
    const { rows } = await fetchAllMenuRowsFromSheet()
    const existing = rows.find((r) => r.sheetRow === sheetRow)
    if (!existing || existing.slug !== slug) {
      return NextResponse.json({ error: "Menu item not found." }, { status: 404 })
    }

    await updateMenuSoldOutInSheet(sheetRow, body.soldOut)
    revalidatePublicMenu()

    return NextResponse.json({ ok: true, slug, soldOut: body.soldOut })
  } catch (err) {
    console.error("[admin] menu sold-out failed", err)
    return NextResponse.json(
      { error: "Could not update sold-out in Google Sheets." },
      { status: 500 }
    )
  }
}
