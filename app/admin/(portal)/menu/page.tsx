import AdminMenuManager from "@/components/admin/AdminMenuManager"
import SectionHeader from "@/components/admin/ui/SectionHeader"
import { toAdminMenuItemView } from "@/lib/admin/menu-present"
import { fetchAllMenuRowsFromSheet } from "@/lib/google-sheets/menu-admin"

export const dynamic = "force-dynamic"

export default async function AdminMenuPage() {
  let loadError: string | null = null
  let items: ReturnType<typeof toAdminMenuItemView>[] = []
  let loadedAt = new Date().toISOString()
  let tabName = "Menu"

  try {
    const data = await fetchAllMenuRowsFromSheet()
    loadedAt = data.loadedAt
    tabName = data.tabName
    items = data.rows.map(toAdminMenuItemView)
  } catch (err) {
    loadError =
      err instanceof Error
        ? err.message
        : "Could not load menu from Google Sheets."
  }

  return (
    <>
      <SectionHeader title="Menu" />

      {loadError ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-4 py-3">
          {loadError}
        </p>
      ) : (
        <AdminMenuManager
          items={items}
          loadedAt={loadedAt}
          tabName={tabName}
        />
      )}
    </>
  )
}
