"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import AdminMenuCard, {
  type AdminMenuItemSaveStatus,
} from "@/components/admin/AdminMenuCard"
import AdminMenuToolbar from "@/components/admin/AdminMenuToolbar"
import AdminPortalSection from "@/components/admin/ui/AdminPortalSection"
import AdminMenuEditDrawer from "@/components/admin/AdminMenuEditDrawer"
import AdminHomepageDropPreview from "@/components/admin/AdminHomepageDropPreview"
import AdminMenuPreview from "@/components/admin/AdminMenuPreview"
import {
  adminMenuItemFromForm,
  patchAdminMenuItem,
} from "@/lib/admin/menu-client"
import {
  menuItemMatchesSearch,
  type MenuSearchScope,
} from "@/lib/admin/menu-search"
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
  const [homepageOpen, setHomepageOpen] = useState(true)
  const [menuPreviewOpen, setMenuPreviewOpen] = useState(true)
  const [onWebsiteOpen, setOnWebsiteOpen] = useState(true)
  const [hiddenOpen, setHiddenOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchScope, setSearchScope] = useState<MenuSearchScope>("all")
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
    return featured?.name ?? "—"
  }, [items])

  const { active, inactive } = useMemo(() => {
    const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder)
    return {
      active: sorted.filter((i) => i.active),
      inactive: sorted.filter((i) => !i.active),
    }
  }, [items])

  const trimmedSearch = searchQuery.trim()

  const { filteredActive, filteredInactive, searchMatchCount } = useMemo(() => {
    const matches = (item: AdminMenuItemView) =>
      menuItemMatchesSearch(item, trimmedSearch)

    let filteredActive = active.filter(matches)
    let filteredInactive = inactive.filter(matches)

    if (searchScope === "active") filteredInactive = []
    if (searchScope === "hidden") filteredActive = []

    return {
      filteredActive,
      filteredInactive,
      searchMatchCount: filteredActive.length + filteredInactive.length,
    }
  }, [active, inactive, trimmedSearch, searchScope])

  const hasSearch = trimmedSearch.length > 0

  useEffect(() => {
    if (hasSearch && filteredInactive.length > 0) {
      setHiddenOpen(true)
    }
  }, [hasSearch, filteredInactive.length])

  const collapseAllSections = useCallback(() => {
    setHomepageOpen(false)
    setMenuPreviewOpen(false)
    setOnWebsiteOpen(false)
    setHiddenOpen(false)
  }, [])

  const expandAllSections = useCallback(() => {
    setHomepageOpen(true)
    setMenuPreviewOpen(true)
    setOnWebsiteOpen(true)
    if (inactive.length > 0) setHiddenOpen(true)
  }, [inactive.length])

  function clearSearch() {
    setSearchQuery("")
    setSearchScope("all")
  }

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

  const onWebsiteSuffix = hasSearch
    ? `(${filteredActive.length} shown)`
    : `(${active.length})`

  return (
    <div className="pb-4">
      <div className="mb-6 sm:mb-8">
        <AdminMenuToolbar
          activeCount={active.length}
          featuredName={featuredName}
          lastRefreshedLabel={formatLoadedAt(lastLoadedAt)}
          tabName={tabName}
          totalCount={items.length}
          matchCount={searchMatchCount}
          searchQuery={searchQuery}
          searchScope={searchScope}
          refreshing={refreshing}
          onAddItem={openCreate}
          onRefresh={handleRefreshFromSheet}
          onSearchChange={setSearchQuery}
          onScopeChange={setSearchScope}
          onClearSearch={clearSearch}
          onCollapseAll={collapseAllSections}
          onExpandAll={expandAllSections}
        />
      </div>

      <AdminPortalSection
        first
        title="Homepage"
        dataSop="admin-menu-homepage-preview"
        open={homepageOpen}
        onOpenChange={setHomepageOpen}
      >
        <AdminHomepageDropPreview menu={previewMenu} />
      </AdminPortalSection>

      <AdminPortalSection
        title="Menu preview"
        dataSop="admin-menu-preview"
        open={menuPreviewOpen}
        onOpenChange={setMenuPreviewOpen}
      >
        <AdminMenuPreview menu={previewMenu} />
      </AdminPortalSection>

      <AdminPortalSection
        title="Live"
        titleSuffix={onWebsiteSuffix}
        dataSop="admin-menu-live-section"
        open={onWebsiteOpen}
        onOpenChange={setOnWebsiteOpen}
      >
        {active.length === 0 ? (
          <p className="text-caption rounded-soft bg-linen/80 border border-oatmeal/60 px-4 py-6 text-center">
            Nothing live. Show a hidden item or add one.
          </p>
        ) : filteredActive.length === 0 ? (
          <p className="text-caption rounded-soft bg-linen/80 border border-oatmeal/60 px-4 py-6 text-center">
            {hasSearch ? "No matches in Live." : "Nothing to show."}
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredActive.map((item) => (
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
      </AdminPortalSection>

      {inactive.length > 0 ? (
        <AdminPortalSection
          title="Hidden"
          dataSop="admin-menu-hidden-section"
          titleSuffix={
            hasSearch
              ? `(${filteredInactive.length} shown)`
              : `(${inactive.length})`
          }
          open={hiddenOpen}
          onOpenChange={setHiddenOpen}
        >
          {filteredInactive.length === 0 && hasSearch ? (
            <p className="text-caption rounded-soft bg-linen/80 border border-oatmeal/60 px-4 py-6 text-center">
              No matches in Hidden.
            </p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInactive.map((item) => (
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
          )}
        </AdminPortalSection>
      ) : hasSearch && searchScope !== "active" && searchMatchCount === 0 ? (
        <p className="text-caption rounded-soft bg-linen/80 border border-oatmeal/60 px-4 py-6 text-center">
          No match for &ldquo;{trimmedSearch}&rdquo;.
        </p>
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
    </div>
  )
}
