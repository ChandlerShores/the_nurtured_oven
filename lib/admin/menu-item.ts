import { isValidMenuSlug, normalizeMenuSlug } from "@/lib/admin/menu-slug"
import { parseMenuPrice } from "@/lib/google-sheets/menu-parse"
import type { MenuItemSheetUpdate } from "@/lib/google-sheets/menu-admin"

export interface AdminMenuItemPayload {
  sheetRow?: number
  slug: string
  name: string
  description: string
  price: string | number
  active: boolean
  featured: boolean
  category: string
  sortOrder: string | number
  imageSlug: string
  imageUrl: string
  allergens: string
  notes: string
  soldOut?: boolean
}

export type ParsedMenuItemFields = {
  slug: string
  update: MenuItemSheetUpdate
}

export function parseMenuItemFields(
  body: Partial<AdminMenuItemPayload>
): { ok: true; fields: ParsedMenuItemFields } | { ok: false; error: string } {
  const name = body.name?.trim() ?? ""
  const description = body.description?.trim() ?? ""
  const slug = normalizeMenuSlug(body.slug ?? "", name)

  if (!name) return { ok: false, error: "Name is required." }
  if (!description) return { ok: false, error: "Description is required." }
  if (!slug) {
    return {
      ok: false,
      error: "Item ID must be lowercase letters, numbers, and hyphens (e.g. brown-butter-blondie).",
    }
  }
  if (!isValidMenuSlug(slug)) {
    return {
      ok: false,
      error: "Item ID must be lowercase letters, numbers, and hyphens (e.g. brown-butter-blondie).",
    }
  }

  const priceRaw =
    typeof body.price === "number" ? String(body.price) : (body.price ?? "")
  const priceCents = parseMenuPrice(priceRaw)
  if (priceCents <= 0) {
    return { ok: false, error: "Enter a valid price greater than zero." }
  }

  const sortOrder = Number(body.sortOrder)
  if (!Number.isFinite(sortOrder)) {
    return { ok: false, error: "Sort order must be a number." }
  }

  const allergens = (body.allergens ?? "")
    .split(/[,;]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)

  return {
    ok: true,
    fields: {
      slug,
      update: {
        name,
        description,
        priceCents,
        active: Boolean(body.active),
        featured: Boolean(body.featured),
        category: body.category?.trim() ?? "",
        sortOrder,
        imageSlug: body.imageSlug?.trim() ?? "",
        imageUrl: body.imageUrl?.trim() ?? "",
        allergens,
        notes: body.notes?.trim() ?? "",
        soldOut: Boolean(body.soldOut),
      },
    },
  }
}

export function validateMenuItemPayload(
  body: Partial<AdminMenuItemPayload>
): { ok: true; update: MenuItemSheetUpdate; sheetRow: number; slug: string } | { ok: false; error: string } {
  const sheetRow = Number(body.sheetRow)
  if (!Number.isFinite(sheetRow) || sheetRow < 2) {
    return { ok: false, error: "Invalid sheet row." }
  }

  const parsed = parseMenuItemFields(body)
  if (!parsed.ok) return parsed

  return {
    ok: true,
    sheetRow,
    slug: parsed.fields.slug,
    update: parsed.fields.update,
  }
}

export function validateCreateMenuItemPayload(
  body: Partial<AdminMenuItemPayload>
): { ok: true; update: MenuItemSheetUpdate; slug: string } | { ok: false; error: string } {
  const parsed = parseMenuItemFields(body)
  if (!parsed.ok) return parsed

  return {
    ok: true,
    slug: parsed.fields.slug,
    update: parsed.fields.update,
  }
}
