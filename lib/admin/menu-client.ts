import { parseMenuPrice } from "@/lib/google-sheets/menu-parse"
import { resolveMenuImage } from "@/lib/content/menu-from-sheet"
import type { AdminMenuItemView } from "@/lib/admin/menu-present"
import { adminItemToPatchPayload } from "@/lib/admin/menu-present"

function formatPriceLabel(cents: number, notes: string): string {
  const dollars = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)
  return notes.trim() ? `$${dollars} / ${notes.trim()}` : `$${dollars}`
}

export interface AdminMenuFormFields {
  sheetRow: number
  slug: string
  name: string
  description: string
  price: string
  active: boolean
  featured: boolean
  category: string
  sortOrder: string
  imageSlug: string
  imageUrl: string
  allergens: string
  notes: string
}

export function adminMenuItemFromForm(
  form: AdminMenuFormFields,
  base: AdminMenuItemView
): AdminMenuItemView {
  const notes = form.notes.trim()
  const priceCents = parseMenuPrice(form.price)
  const sortOrder = Number(form.sortOrder)
  const imageSlug = form.imageSlug.trim()
  const imageUrl = form.imageUrl.trim()

  return {
    ...base,
    sheetRow: form.sheetRow,
    slug: form.slug,
    name: form.name.trim(),
    description: form.description.trim(),
    priceCents,
    priceLabel: formatPriceLabel(priceCents, notes),
    active: form.active,
    featured: form.featured,
    category: form.category.trim(),
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : base.sortOrder,
    imageSlug,
    imageUrl,
    allergens: form.allergens.trim(),
    notes,
    image: resolveMenuImage(imageUrl, imageSlug, form.slug),
  }
}

export async function patchAdminMenuItem(item: AdminMenuItemView): Promise<void> {
  const res = await fetch("/api/admin/menu", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(adminItemToPatchPayload(item)),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? "Could not save.")
  }
}

export async function uploadMenuImage(
  slug: string,
  file: File
): Promise<{ imageUrl: string; imageSlug: string }> {
  const formData = new FormData()
  formData.append("slug", slug)
  formData.append("file", file)

  const res = await fetch("/api/admin/menu/image", {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? "Could not upload image.")
  }

  return (await res.json()) as { imageUrl: string; imageSlug: string }
}

export async function createAdminMenuItem(
  payload: Omit<AdminMenuFormFields, "sheetRow">
): Promise<{ slug: string; sheetRow: number }> {
  const res = await fetch("/api/admin/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? "Could not add item.")
  }

  return (await res.json()) as { slug: string; sheetRow: number }
}

export function adminMenuItemFromCreateResult(
  form: AdminMenuFormFields,
  sheetRow: number
): AdminMenuItemView {
  const base: AdminMenuItemView = {
    sheetRow,
    slug: form.slug,
    name: form.name,
    description: form.description,
    priceCents: 0,
    priceLabel: "",
    active: form.active,
    featured: form.featured,
    category: form.category,
    sortOrder: Number(form.sortOrder) || 9999,
    imageSlug: form.imageSlug,
    imageUrl: form.imageUrl,
    allergens: form.allergens,
    notes: form.notes,
    image: "",
  }
  return adminMenuItemFromForm(form, base)
}
