"use client"

import Image from "next/image"
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
  return (
    <article className="rounded-softer border border-oatmeal/60 bg-warm-white shadow-gentle overflow-hidden">
      <div className="relative aspect-[4/3] bg-oatmeal/30">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover object-center"
          sizes="(max-width: 640px) 100vw, 280px"
        />
        {item.featured ? (
          <span className="absolute top-2 left-2 bg-blush/90 text-cream text-xs font-medium px-2.5 py-1 rounded-full">
            Featured
          </span>
        ) : null}
        {!item.active ? (
          <span className="absolute top-2 right-2 bg-espresso/80 text-cream text-xs font-medium px-2.5 py-1 rounded-full">
            Hidden
          </span>
        ) : null}
      </div>
      <div className="p-4 space-y-3">
        <div>
          {item.category ? (
            <p className="text-caption text-xs uppercase tracking-wide mb-1">
              {item.category}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-1.5 mt-1">
            <StatusPill status={item.active ? "Active" : "Hidden"} />
            {item.featured && item.active ? (
              <StatusPill status="Featured" />
            ) : null}
          </div>
          <h3 className="font-heading text-lg text-charcoal mt-2">{item.name}</h3>
          <p className="text-caption text-sm mt-1 line-clamp-3">{item.description}</p>
          <p className="font-medium text-charcoal mt-2">{item.priceLabel}</p>
          {item.allergens ? (
            <p className="text-caption text-xs mt-2">
              <span className="text-blush font-medium">Allergens:</span>{" "}
              {item.allergens}
            </p>
          ) : null}
          {item.notes ? (
            <p className="text-caption text-xs mt-1">
              <span className="text-olive font-medium">Notes:</span> {item.notes}
            </p>
          ) : null}
          <p className="text-caption text-[10px] mt-2 opacity-60" title="Stable ID">
            ID: {item.slug}
          </p>
        </div>

        <div className="flex flex-nowrap items-center gap-2 text-sm">
          <button
            type="button"
            disabled={busy}
            onClick={() => onToggleActive(!item.active)}
            className={`${adminBtnSecondary} shrink-0 px-2.5 py-1.5 text-xs whitespace-nowrap`}
          >
            {item.active ? "Hide" : "Show"}
          </button>
          {item.active ? (
            <button
              type="button"
              disabled={busy || item.featured}
              onClick={() => onToggleFeatured(true)}
              className="shrink-0 w-[6.75rem] rounded-full border border-blush/50 text-blush px-2 py-1.5 font-body text-xs text-center whitespace-nowrap hover:bg-blush/10 disabled:opacity-50"
            >
              {item.featured ? "Featured" : "Set featured"}
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={onEdit}
            className={`${adminBtnPrimary} shrink-0 ml-auto px-2.5 py-1.5 text-xs whitespace-nowrap`}
          >
            Edit
          </button>
        </div>
        <SaveStatusLine status={saveStatus} error={saveError} />
      </div>
    </article>
  )
}
