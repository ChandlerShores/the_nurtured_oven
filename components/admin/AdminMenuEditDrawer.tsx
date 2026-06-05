"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { slugifyMenuName } from "@/lib/admin/menu-slug"
import {
  adminMenuItemFromCreateResult,
  adminMenuItemFromForm,
  createAdminMenuItem,
  patchAdminMenuItem,
  uploadMenuImage,
  type AdminMenuFormFields,
} from "@/lib/admin/menu-client"
import type { AdminMenuItemView } from "@/lib/admin/menu-present"

export type MenuItemFormState = AdminMenuFormFields

function itemToForm(item: AdminMenuItemView): AdminMenuFormFields {
  return {
    sheetRow: item.sheetRow,
    slug: item.slug,
    name: item.name,
    description: item.description,
    price: (item.priceCents / 100).toFixed(item.priceCents % 100 === 0 ? 0 : 2),
    active: item.active,
    featured: item.featured,
    category: item.category,
    sortOrder: String(item.sortOrder),
    imageSlug: item.imageSlug,
    imageUrl: item.imageUrl,
    allergens: item.allergens,
    notes: item.notes,
  }
}

function emptyCreateForm(nextSortOrder: number): AdminMenuFormFields {
  return {
    sheetRow: 0,
    slug: "",
    name: "",
    description: "",
    price: "",
    active: true,
    featured: false,
    category: "",
    sortOrder: String(nextSortOrder),
    imageSlug: "",
    imageUrl: "",
    allergens: "",
    notes: "",
  }
}

interface AdminMenuEditDrawerProps {
  mode: "create" | "edit"
  item: AdminMenuItemView | null
  open: boolean
  nextSortOrder: number
  existingSlugs: string[]
  onClose: () => void
  onSaved: (form: AdminMenuFormFields) => void
  onCreated: (item: AdminMenuItemView) => void
}

const inputClass =
  "w-full rounded-soft border border-oatmeal/80 bg-warm-white px-3 py-2.5 text-espresso font-body text-base"

export default function AdminMenuEditDrawer({
  mode,
  item,
  open,
  nextSortOrder,
  existingSlugs,
  onClose,
  onSaved,
  onCreated,
}: AdminMenuEditDrawerProps) {
  const [form, setForm] = useState<AdminMenuFormFields | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const slugTouchedRef = useRef(false)

  const isCreate = mode === "create"

  useEffect(() => {
    if (!open) return
    slugTouchedRef.current = false
    setImageFile(null)
    setImagePreview(null)
    setError(null)

    if (isCreate) {
      setForm(emptyCreateForm(nextSortOrder))
    } else if (item) {
      setForm(itemToForm(item))
      if (item.image) setImagePreview(item.image)
    }
  }, [open, isCreate, item, nextSortOrder])

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  if (!open || !form) return null
  if (!isCreate && !item) return null

  function update<K extends keyof AdminMenuFormFields>(
    key: K,
    value: AdminMenuFormFields[K]
  ) {
    setForm((prev) => {
      if (!prev) return prev
      const next = { ...prev, [key]: value }
      if (isCreate && key === "name" && !slugTouchedRef.current) {
        next.slug = slugifyMenuName(String(value))
      }
      if (isCreate && key === "slug") {
        slugTouchedRef.current = true
      }
      return next
    })
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    setError(null)

    try {
      const slug = form.slug.trim() || slugifyMenuName(form.name)
      if (!slug) {
        throw new Error("Enter a name or item ID.")
      }
      if (existingSlugs.includes(slug) && (isCreate || item?.slug !== slug)) {
        throw new Error(`An item with ID "${slug}" already exists.`)
      }

      let imageUrl = form.imageUrl.trim()
      let imageSlug = form.imageSlug.trim()

      if (imageFile) {
        const uploaded = await uploadMenuImage(slug, imageFile)
        imageUrl = uploaded.imageUrl
        imageSlug = uploaded.imageSlug
      }

      const payload = {
        ...form,
        slug,
        imageUrl,
        imageSlug: imageSlug || slug,
      }

      if (isCreate) {
        const { sheetRow } = await createAdminMenuItem({
          slug: payload.slug,
          name: payload.name,
          description: payload.description,
          price: payload.price,
          active: payload.active,
          featured: payload.featured,
          category: payload.category,
          sortOrder: payload.sortOrder,
          imageSlug: payload.imageSlug,
          imageUrl: payload.imageUrl,
          allergens: payload.allergens,
          notes: payload.notes,
        })
        const created = adminMenuItemFromCreateResult(payload, sheetRow)
        onCreated(created)
        onClose()
        return
      }

      if (!item) return
      const updated = adminMenuItemFromForm(payload, item)
      await patchAdminMenuItem(updated)
      onSaved(payload)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.")
    } finally {
      setSaving(false)
    }
  }

  const previewSrc =
    imagePreview ||
    (form.imageUrl.trim() || null) ||
    (form.imageSlug && form.slug
      ? `/images/menu/${form.imageSlug || form.slug}.jpg`
      : null)

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="menu-edit-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-espresso/40"
        aria-label="Close editor"
        onClick={onClose}
      />
      <div className="relative w-full max-w-none sm:max-w-md bg-cream shadow-warm h-full overflow-y-auto pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id="menu-edit-title"
                className="font-heading text-xl text-espresso"
              >
                {isCreate ? "Add item" : "Edit"}
              </h2>
              {!isCreate && item ? (
                <p className="text-caption text-sm mt-1">{item.name}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-caption text-sm underline-offset-2 hover:underline shrink-0"
            >
              Close
            </button>
          </div>

          {error ? (
            <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-3 py-2">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm font-body cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => update("active", e.target.checked)}
                className="rounded border-oatmeal/80"
              />
              Live
            </label>
            <label className="flex items-center gap-2 text-sm font-body cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                disabled={!form.active}
                onChange={(e) => update("featured", e.target.checked)}
                className="rounded border-oatmeal/80 disabled:opacity-50"
              />
              Featured
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="menu-name">
              Name <span className="text-blush">*</span>
            </label>
            <input
              id="menu-name"
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              htmlFor="menu-description"
            >
              Description <span className="text-blush">*</span>
            </label>
            <textarea
              id="menu-description"
              required
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="menu-price">
                Price ($) <span className="text-blush">*</span>
              </label>
              <input
                id="menu-price"
                required
                inputMode="decimal"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="menu-sort">
                Sort order
              </label>
              <input
                id="menu-sort"
                required
                inputMode="numeric"
                value={form.sortOrder}
                onChange={(e) => update("sortOrder", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="menu-category">
              Category
            </label>
            <input
              id="menu-category"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              placeholder="e.g. Signature Staple"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="menu-notes">
              Notes
            </label>
            <input
              id="menu-notes"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="e.g. 4-pack"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="menu-allergens">
              Allergens
            </label>
            <input
              id="menu-allergens"
              value={form.allergens}
              onChange={(e) => update("allergens", e.target.value)}
              placeholder="wheat, eggs, dairy"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="menu-photo">
              Photo
            </label>
            <input
              id="menu-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="w-full text-sm font-body file:mr-3 file:rounded-full file:border-0 file:bg-linen file:px-3 file:py-1.5 file:text-espresso"
            />
            <p className="text-caption text-xs mt-1">JPEG, PNG, or WebP · 5 MB max</p>
            {previewSrc ? (
              <div className="relative mt-3 aspect-[4/3] w-full max-w-xs rounded-soft overflow-hidden bg-oatmeal/30">
                <Image
                  src={previewSrc}
                  alt="Preview"
                  fill
                  unoptimized={previewSrc.startsWith("blob:")}
                  className="object-cover"
                  sizes="280px"
                />
              </div>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="menu-image-url">
              Image URL
            </label>
            <input
              id="menu-image-url"
              value={form.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="/images/… or https://…"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="menu-slug">
              ID <span className="text-blush">*</span>
            </label>
            <input
              id="menu-slug"
              required
              readOnly={!isCreate}
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder="brown-butter-blondie"
              className={
                isCreate
                  ? inputClass
                  : `${inputClass} bg-linen/60 text-caption cursor-not-allowed`
              }
            />
            {!isCreate ? (
              <p className="text-caption text-xs mt-1">Cannot change after create.</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-soft bg-espresso text-cream py-3 font-medium disabled:opacity-60"
          >
            {saving ? "Saving…" : isCreate ? "Add" : "Save"}
          </button>
        </form>
      </div>
    </div>
  )
}
