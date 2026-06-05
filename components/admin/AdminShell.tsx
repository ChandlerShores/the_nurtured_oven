"use client"

import { useState } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import { IconClose, IconMenuHamburger } from "@/components/admin/icons"
import "./admin-portal.css"

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="admin-portal-root min-h-[100dvh] bg-admin-bg text-espresso font-body flex">
      <div className="hidden lg:flex lg:w-64 lg:shrink-0 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30">
        <AdminSidebar className="w-64" />
      </div>

      {mobileOpen ? (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/55"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-[min(18rem,85vw)] h-full shadow-warm pt-[env(safe-area-inset-top)]">
            <AdminSidebar
              className="w-full h-full"
              onNavigate={() => setMobileOpen(false)}
            />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-[max(1rem,env(safe-area-inset-top))] right-3 p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md bg-warm-white text-espresso border border-espresso/20 touch-manipulation"
              aria-label="Close navigation"
            >
              <IconClose />
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 border-b border-espresso/15 bg-warm-white/95 backdrop-blur-sm px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md border border-espresso/25 text-espresso touch-manipulation"
            aria-label="Open menu"
          >
            <IconMenuHamburger />
          </button>
          <div className="min-w-0">
            <p className="font-accent text-lg text-blush leading-none truncate">
              The Nurtured Oven
            </p>
            <p className="text-caption text-xs mt-0.5">Baker portal</p>
          </div>
        </header>

        <main className="w-full min-w-0 px-4 py-5 sm:px-6 sm:py-8 lg:px-8 max-w-7xl mx-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {children}
        </main>
      </div>
    </div>
  )
}
