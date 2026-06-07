"use client"

import Image from "next/image"
import { useState } from "react"
import StatusPill from "@/components/admin/ui/StatusPill"
import { adminBtnPrimary, adminBtnSecondary } from "@/components/admin/ui/admin-button"
import type { AdminMenuItemView } from "@/lib/admin/menu-present"

export type AdminMenuItemSaveStatus = "idle" | "saving" | "saved" | "error"

interface AdminMenuCardProps {
  item: AdminMenuItemView
  onEdit: () => void
  onToggleActive: (active: boolean) => void
  onToggleFeatured: (featured: boolean) => void
  saveStatus?: AdminMenuItemSaveStatus
  saveError?: string
}

function SaveStatusLine({
  status,
  error,
}: {
  status: AdminMenuItemSaveStatus
  error?: string
}) {
  if (status === "idle") return null
  if (status === "saving") {
    return (
      <p className="text-caption text-xs text-espresso/70" aria-live="polite">
        Saving…
      </p>
    )
  }
  if (status === "saved") {
    return (
      <p className="text-xs text-green-800" aria-live="polite">
        Saved
      </p>
    )
  }
  return (
    <p className="text-xs text-red-800" role="alert">
      {error ?? "Could not save. Try again."}
    </p>
  )
}

export default function AdminMenuCard({
  item,
  onEdit,
  onToggleActive,
  onToggleFeatured,
  saveStatus = "idle",
  saveError,
}: AdminMenuCardProps) {
  const busy = saveStatus === "saving"
  const [imageFailed, setImageFailed] = useState(false)
  return (
    <article
      className="rounded-lg border border-espresso/15 bg-warm-white shadow-gentle overflow-hidden"
      data-sop="menu-item-card"
      data-sop-item-slug={item.slug}
    >
      <div
        className="relative aspect-[4/3] bg-linen"
        data-sop="menu-item-card-image"
      >
        {imageFailed || !item.image ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-linen text-center px-4">
            <p className="font-heading text-lg text-espresso">No image</p>
            <p className="text-caption text-xs mt-1">Upload or URL</p>
          </div>
        ) : (
          <Image
            src={item.image}
            alt={item.name}
            fill
            onError={() => setImageFailed(true)}
            className="object-cover object-center"
            sizes="(max-width: 640px) 100vw, 280px"
          />
        )}
        {item.featured ? (
          <span className="absolute top-2 left-2 bg-blush text-cream text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            Featured
          </span>
        ) : null}
        {!item.active ? (
          <span className="absolute top-2 right-2 bg-espresso text-cream text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            Hidden
          </span>
        ) : null}
      </div>
      <div className="p-4 space-y-3">
        <div>
          {item.category ? (
            <p className="text-caption text-xs uppercase tracking-wide mb-1 font-semibold">
              {item.category}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-1.5 mt-1">
            <StatusPill status={item.active ? "Active" : "Hidden"} />
            {item.featured && item.active ? (
              <StatusPill status="Featured" />
            ) : null}
            {item.soldOut ? <StatusPill status="Sold out" /> : null}
          </div>
          <h3 className="font-heading text-lg text-espresso mt-2">{item.name}</h3>
          <p className="text-caption text-sm mt-1 line-clamp-3">{item.description}</p>
          <p className="font-semibold text-espresso mt-2">{item.priceLabel}</p>
          {item.allergens ? (
            <p className="text-caption text-xs mt-2">
              {item.allergens}
            </p>
          ) : null}
          {item.notes ? (
            <p className="text-caption text-xs mt-1">
              {item.notes}
            </p>
          ) : null}
          <p className="text-caption text-[10px] mt-2 opacity-60" title="Stable ID">
            ID: {item.slug}
          </p>
        </div>

        <div
          className={`grid gap-2 text-sm ${
            item.active ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          <button
            type="button"
            disabled={busy}
            onClick={() => onToggleActive(!item.active)}
            data-sop="menu-item-card-active-toggle"
            data-sop-item-slug={item.slug}
            className={`${adminBtnSecondary} w-full px-3 py-2 text-sm whitespace-nowrap`}
          >
            {item.active ? "Hide" : "Show"}
          </button>
          {item.active ? (
            <button
              type="button"
              disabled={busy || item.featured}
              onClick={() => onToggleFeatured(true)}
              data-sop="menu-item-card-featured-toggle"
              data-sop-item-slug={item.slug}
              className="rounded-md border border-blush bg-blush/10 text-espresso px-3 py-2 font-body text-sm font-semibold text-center whitespace-nowrap hover:bg-blush/20 disabled:opacity-50"
            >
              {item.featured ? "Featured" : "Feature"}
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={onEdit}
            data-sop="menu-item-edit"
            data-sop-item-slug={item.slug}
            className={`${adminBtnPrimary} w-full px-3 py-2 text-sm whitespace-nowrap ${
              item.active ? "col-span-2" : ""
            }`}
          >
            Edit
          </button>
        </div>
        <SaveStatusLine status={saveStatus} error={saveError} />
      </div>
    </article>
  )
}
