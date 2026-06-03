"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import AdminMenuCard, {
  type AdminMenuItemSaveStatus,
} from "@/components/admin/AdminMenuCard"
import { adminBtnPrimary, adminBtnSecondary } from "@/components/admin/ui/admin-button"
import AdminMenuEditDrawer from "@/components/admin/AdminMenuEditDrawer"
import AdminHomepageDropPreview from "@/components/admin/AdminHomepageDropPreview"
import AdminMenuPreview from "@/components/admin/AdminMenuPreview"
import {
  adminMenuItemFromForm,
  patchAdminMenuItem,
} from "@/lib/admin/menu-client"
import {
  applyFeaturedToItems,
  buildPreviewMenuFromAdminItems,
  type AdminMenuItemView,
} from "@/lib/admin/menu-present"

interface AdminMenuManagerProps {
  items: AdminMenuItemView[]
  loadedAt: string
  tabName: string
}

const SAVED_DISPLAY_MS = 2000

function formatLoadedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function AdminMenuManager({
  items: initialItems,
  loadedAt: initialLoadedAt,
  tabName,
}: AdminMenuManagerProps) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [lastLoadedAt, setLastLoadedAt] = useState(initialLoadedAt)
  const [editItem, setEditItem] = useState<AdminMenuItemView | null>(null)
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("edit")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [inactiveOpen, setInactiveOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [itemStatus, setItemStatus] = useState<
    Record<string, AdminMenuItemSaveStatus>
  >({})
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({})
  const savedTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    setItems(initialItems)
    setLastLoadedAt(initialLoadedAt)
    setRefreshing(false)
  }, [initialItems, initialLoadedAt])

  useEffect(() => {
    const timers = savedTimersRef.current
    return () => {
      for (const id of Object.keys(timers)) {
        clearTimeout(timers[id])
      }
    }
  }, [])

  const previewMenu = useMemo(
    () => buildPreviewMenuFromAdminItems(items),
    [items]
  )

  const featuredName = useMemo(() => {
    const featured = items.find((i) => i.featured && i.active)
    return featured?.name ?? "None set"
  }, [items])

  const { active, inactive } = useMemo(() => {
    const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder)
    return {
      active: sorted.filter((i) => i.active),
      inactive: sorted.filter((i) => !i.active),
    }
  }, [items])

  const setStatus = useCallback((slug: string, status: AdminMenuItemSaveStatus) => {
    setItemStatus((prev) => ({ ...prev, [slug]: status }))
    if (status !== "error") {
      setItemErrors((prev) => {
        const next = { ...prev }
        delete next[slug]
        return next
      })
    }
  }, [])

  const scheduleSavedClear = useCallback(
    (slug: string) => {
      const existing = savedTimersRef.current[slug]
      if (existing) clearTimeout(existing)
      savedTimersRef.current[slug] = setTimeout(() => {
        setStatus(slug, "idle")
        delete savedTimersRef.current[slug]
      }, SAVED_DISPLAY_MS)
    },
    [setStatus]
  )

  const applyOptimisticUpdate = useCallback(
    async (
      patchSlug: string,
      computeNext: (current: AdminMenuItemView[]) => AdminMenuItemView[]
    ) => {
      const previous = items
      const next = computeNext(items)
      const patchedItem = next.find((i) => i.slug === patchSlug)
      if (!patchedItem) return

      setItems(next)
      setStatus(patchSlug, "saving")

      try {
        await patchAdminMenuItem(patchedItem)
        setStatus(patchSlug, "saved")
        scheduleSavedClear(patchSlug)
      } catch (err) {
        setItems(previous)
        const message =
          err instanceof Error ? err.message : "Could not save."
        setStatus(patchSlug, "error")
        setItemErrors((prev) => ({ ...prev, [patchSlug]: message }))
      }
    },
    [items, scheduleSavedClear, setStatus]
  )

  const nextSortOrder = useMemo(() => {
    if (items.length === 0) return 1
    return Math.max(...items.map((i) => i.sortOrder)) + 1
  }, [items])

  const existingSlugs = useMemo(() => items.map((i) => i.slug), [items])

  function openCreate() {
    setEditItem(null)
    setDrawerMode("create")
    setDrawerOpen(true)
  }

  function openEdit(item: AdminMenuItemView) {
    setEditItem(item)
    setDrawerMode("edit")
    setDrawerOpen(true)
  }

  function handleRefreshFromSheet() {
    setRefreshing(true)
    router.refresh()
  }

  function handleDrawerSaved(form: Parameters<typeof adminMenuItemFromForm>[0]) {
    if (!editItem) return
    const updated = adminMenuItemFromForm(form, editItem)
    setItems((prev) => {
      let next = prev.map((i) => (i.slug === updated.slug ? updated : i))
      if (updated.featured && updated.active) {
        next = applyFeaturedToItems(next, updated.slug)
      }
      return next
    })
    setDrawerOpen(false)
    setEditItem(null)
  }

  function handleItemCreated(item: AdminMenuItemView) {
    setItems((prev) => {
      let next = [...prev, item]
      if (item.featured && item.active) {
        next = applyFeaturedToItems(next, item.slug)
      }
      return next
    })
    setDrawerOpen(false)
    setEditItem(null)
  }

  function getCardStatus(slug: string): AdminMenuItemSaveStatus {
    return itemStatus[slug] ?? "idle"
  }

  return (
    <>
      <section className="rounded-softer bg-warm-white border border-oatmeal/50 shadow-gentle px-4 py-4 sm:px-5 mb-8 text-sm font-body">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <p>
            <span className="text-caption text-xs uppercase tracking-wide block">
              Active on site
            </span>
            <span className="font-heading text-xl text-charcoal mt-1 inline-block">
              {active.length}
            </span>
          </p>
          <p>
            <span className="text-caption text-xs uppercase tracking-wide block">
              Featured item
            </span>
            <span className="font-medium text-charcoal mt-1 inline-block line-clamp-1">
              {featuredName}
            </span>
          </p>
          <p>
            <span className="text-caption text-xs uppercase tracking-wide block">
              Last refreshed
            </span>
            <span className="font-medium text-charcoal mt-1 inline-block">
              {formatLoadedAt(lastLoadedAt)}
            </span>
          </p>
          <p>
            <span className="text-caption text-xs uppercase tracking-wide block">
              Source
            </span>
            <span className="font-medium text-charcoal mt-1 inline-block">
              Google Sheet
            </span>
            <span className="text-caption block text-xs mt-0.5">{tabName} tab</span>
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-oatmeal/40 flex flex-wrap gap-2">
          <button type="button" onClick={openCreate} className={adminBtnPrimary}>
            Add menu item
          </button>
          <button
            type="button"
            onClick={handleRefreshFromSheet}
            disabled={refreshing}
            className={adminBtnSecondary}
          >
            {refreshing ? "Refreshing…" : "Refresh from sheet"}
          </button>
          <p className="text-caption text-xs mt-2">
            Use if you edited the sheet directly. Saves update the homepage
            weekly drop, menu page, and checkout without refreshing this page.
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-heading text-xl text-charcoal mb-4">
          Homepage — The weekly drop
        </h2>
        <AdminHomepageDropPreview menu={previewMenu} />
      </section>

      <section className="mb-10">
        <h2 className="font-heading text-xl text-charcoal mb-4">
          Menu page preview
        </h2>
        <AdminMenuPreview menu={previewMenu} />
      </section>

      <section className="mb-10">
        <h2 className="font-heading text-xl text-charcoal mb-4">
          On the website ({active.length})
        </h2>
        {active.length === 0 ? (
          <p className="text-caption rounded-soft bg-linen/80 border border-oatmeal/60 px-4 py-6 text-center">
            No items are visible on the site right now. Show an item from the
            hidden list below, or add a new menu item.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map((item) => (
              <li key={item.slug}>
                <AdminMenuCard
                  item={item}
                  saveStatus={getCardStatus(item.slug)}
                  saveError={itemErrors[item.slug]}
                  onEdit={() => openEdit(item)}
                  onToggleActive={(nextActive) =>
                    applyOptimisticUpdate(item.slug, (rows) =>
                      rows.map((row) =>
                        row.slug === item.slug
                          ? {
                              ...row,
                              active: nextActive,
                              featured: nextActive ? row.featured : false,
                            }
                          : row
                      )
                    )
                  }
                  onToggleFeatured={() =>
                    applyOptimisticUpdate(item.slug, (rows) =>
                      applyFeaturedToItems(rows, item.slug)
                    )
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {inactive.length > 0 ? (
        <section>
          <button
            type="button"
            onClick={() => setInactiveOpen((o) => !o)}
            className="w-full flex items-center justify-between font-heading text-xl text-espresso mb-4 text-left"
            aria-expanded={inactiveOpen}
          >
            Hidden from website ({inactive.length})
            <span className="text-caption text-sm font-body">
              {inactiveOpen ? "Collapse" : "Expand"}
            </span>
          </button>
          {inactiveOpen ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inactive.map((item) => (
                <li key={item.slug}>
                  <AdminMenuCard
                    item={item}
                    saveStatus={getCardStatus(item.slug)}
                    saveError={itemErrors[item.slug]}
                    onEdit={() => openEdit(item)}
                    onToggleActive={(nextActive) =>
                      applyOptimisticUpdate(item.slug, (rows) =>
                        rows.map((row) =>
                          row.slug === item.slug
                            ? { ...row, active: nextActive }
                            : row
                        )
                      )
                    }
                    onToggleFeatured={() => {}}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <AdminMenuEditDrawer
        mode={drawerMode}
        item={editItem}
        open={drawerOpen}
        nextSortOrder={nextSortOrder}
        existingSlugs={existingSlugs}
        onClose={() => {
          setDrawerOpen(false)
          setEditItem(null)
        }}
        onSaved={handleDrawerSaved}
        onCreated={handleItemCreated}
      />
    </>
  )
}
