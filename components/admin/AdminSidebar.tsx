"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconDashboard,
  IconDelivery,
  IconFinancials,
  IconMenu,
  IconMessages,
  IconOrders,
  IconPickup,
  IconSettings,
} from "@/components/admin/icons"
import AdminLogoutButton from "@/components/admin/AdminLogoutButton"

type NavIcon = typeof IconDashboard

interface NavItem {
  href: string
  label: string
  icon: NavIcon
  exact?: boolean
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: IconDashboard, exact: true },
      { href: "/admin/orders", label: "Orders", icon: IconOrders },
    ],
  },
  {
    label: "Fulfillment",
    items: [
      { href: "/admin/pickup", label: "Pickup", icon: IconPickup },
      { href: "/admin/deliveries", label: "Deliveries", icon: IconDelivery },
      { href: "/admin/messages", label: "Messages", icon: IconMessages },
    ],
  },
  {
    label: "Menu & money",
    items: [
      { href: "/admin/menu", label: "Menu", icon: IconMenu },
      { href: "/admin/financials", label: "Financials", icon: IconFinancials },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/admin/settings", label: "Admin", icon: IconSettings },
    ],
  },
]

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavSectionLabel({
  label,
  showDivider,
}: {
  label: string
  showDivider: boolean
}) {
  return (
    <div
      className={`px-3 ${showDivider ? "mt-4 pt-4 border-t border-espresso/12" : "mt-1"}`}
      role="presentation"
    >
      <p className="text-[10px] uppercase tracking-widest font-semibold text-espresso/50">
        {label}
      </p>
    </div>
  )
}

interface AdminSidebarProps {
  onNavigate?: () => void
  className?: string
}

export default function AdminSidebar({
  onNavigate,
  className = "",
}: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={`flex flex-col h-full bg-warm-white border-r border-espresso/15 ${className}`}
    >
      <div className="px-5 pt-6 pb-5 border-b border-espresso/15">
        <p className="font-accent text-2xl text-blush leading-tight">
          The Nurtured Oven
        </p>
        <p className="text-caption text-xs mt-1 uppercase tracking-widest">
          Baker portal
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Portal">
        {NAV_GROUPS.map((group, groupIndex) => (
          <div key={group.label} className="space-y-1">
            <NavSectionLabel
              label={group.label}
              showDivider={groupIndex > 0}
            />
            {group.items.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(pathname, href, exact)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 rounded-soft px-3 py-3 min-h-[44px] text-sm font-body transition-colors touch-manipulation ${
                    active
                      ? "bg-espresso text-cream shadow-gentle"
                      : "text-espresso hover:bg-linen"
                  }`}
                >
                  <Icon className="shrink-0 opacity-90" />
                  {label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-espresso/15">
        <AdminLogoutButton />
      </div>
    </aside>
  )
}
