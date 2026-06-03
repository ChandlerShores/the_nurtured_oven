"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconDashboard,
  IconDelivery,
  IconMenu,
  IconOrders,
  IconProduction,
  IconSettings,
} from "@/components/admin/icons"
import AdminLogoutButton from "@/components/admin/AdminLogoutButton"

const NAV: {
  href: string
  label: string
  icon: typeof IconDashboard
  exact?: boolean
}[] = [
  { href: "/admin", label: "Dashboard", icon: IconDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: IconOrders },
  { href: "/admin/production", label: "Production", icon: IconProduction },
  { href: "/admin/deliveries", label: "Deliveries", icon: IconDelivery },
  { href: "/admin/menu", label: "Menu", icon: IconMenu },
  { href: "/admin/settings", label: "Settings", icon: IconSettings },
]

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
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
      className={`flex flex-col h-full bg-warm-white border-r border-oatmeal/50 ${className}`}
    >
      <div className="px-5 pt-6 pb-5 border-b border-oatmeal/40">
        <p className="font-accent text-2xl text-blush leading-tight">
          The Nurtured Oven
        </p>
        <p className="text-caption text-xs mt-1 uppercase tracking-widest text-olive/80">
          Baker portal
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-soft px-3 py-2.5 text-sm font-body transition-colors ${
                active
                  ? "bg-sage-deep text-cream shadow-gentle"
                  : "text-charcoal hover:bg-linen/80"
              }`}
            >
              <Icon className="shrink-0 opacity-90" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-oatmeal/40">
        <AdminLogoutButton />
      </div>
    </aside>
  )
}
