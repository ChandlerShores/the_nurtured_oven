"use client"

import { useState } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import { IconClose, IconMenuHamburger } from "@/components/admin/icons"

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-[100dvh] bg-admin-bg text-charcoal font-body flex">
      <div className="hidden lg:flex lg:w-64 lg:shrink-0 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30">
        <AdminSidebar className="w-64" />
      </div>

      {mobileOpen ? (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/40"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-[min(18rem,85vw)] h-full shadow-warm">
            <AdminSidebar
              className="w-full"
              onNavigate={() => setMobileOpen(false)}
            />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-3 p-2 rounded-full bg-linen/90 text-charcoal"
              aria-label="Close navigation"
            >
              <IconClose />
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 border-b border-oatmeal/50 bg-warm-white/95 backdrop-blur-sm px-4 py-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-soft border border-oatmeal/60 text-charcoal"
            aria-label="Open menu"
          >
            <IconMenuHamburger />
          </button>
          <div>
            <p className="font-accent text-lg text-blush leading-none">
              The Nurtured Oven
            </p>
            <p className="text-caption text-xs mt-0.5">Baker portal</p>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
