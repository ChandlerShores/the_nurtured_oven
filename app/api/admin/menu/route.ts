import { NextResponse } from "next/server"
import { revalidatePublicMenu } from "@/lib/admin/revalidate-public-menu"
import {
  validateCreateMenuItemPayload,
  validateMenuItemPayload,
} from "@/lib/admin/menu-item"
import { requireAdminApi } from "@/lib/admin/require-admin"
import {
  appendMenuRowInSheet,
  clearFeaturedExcept,
  fetchAllMenuRowsFromSheet,
  updateMenuRowInSheet,
} from "@/lib/google-sheets/menu-admin"

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const validated = validateCreateMenuItemPayload(
    body as Parameters<typeof validateCreateMenuItemPayload>[0]
  )
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }

  const { slug, update } = validated

  try {
    const { rows } = await fetchAllMenuRowsFromSheet()
    if (rows.some((r) => r.slug === slug)) {
      return NextResponse.json(
        { error: `An item with ID "${slug}" already exists.` },
        { status: 409 }
      )
    }

    if (update.featured && update.active) {
      await clearFeaturedExcept(slug, rows)
    }

    const added = await appendMenuRowInSheet({ slug, ...update })
    revalidatePublicMenu()

    return NextResponse.json({
      ok: true,
      slug,
      sheetRow: added.sheetRow,
    })
  } catch (err) {
    console.error("[admin] menu create failed", err)
    return NextResponse.json(
      { error: "Could not add item to Google Sheets." },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const validated = validateMenuItemPayload(body as Parameters<typeof validateMenuItemPayload>[0])
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }

  const { sheetRow, slug, update } = validated

  try {
    const { rows } = await fetchAllMenuRowsFromSheet()
    const existing = rows.find((r) => r.sheetRow === sheetRow)
    if (!existing || existing.slug !== slug) {
      return NextResponse.json({ error: "Menu item not found." }, { status: 404 })
    }

    if (update.featured && update.active) {
      await clearFeaturedExcept(slug, rows)
    }

    await updateMenuRowInSheet(sheetRow, slug, update)
    revalidatePublicMenu()

    return NextResponse.json({ ok: true, slug })
  } catch (err) {
    console.error("[admin] menu update failed", err)
    return NextResponse.json(
      { error: "Could not save to Google Sheets." },
      { status: 500 }
    )
  }
}
