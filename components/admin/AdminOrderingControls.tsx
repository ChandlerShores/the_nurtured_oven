"use client"

import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import StatusPill from "@/components/admin/ui/StatusPill"
import { adminBtnPrimary, adminBtnSecondary } from "@/components/admin/ui/admin-button"
import type { OrderingKillSwitchState } from "@/lib/admin/ordering-kill-switch"
import type { AdminMenuItemView } from "@/lib/admin/menu-present"

interface AdminOrderingControlsProps {
  killSwitch: OrderingKillSwitchState
  menuItems: AdminMenuItemView[]
}

type SavePhase = "idle" | "saving" | "error"

export default function AdminOrderingControls({
  killSwitch: initialKillSwitch,
  menuItems,
}: AdminOrderingControlsProps) {
  const router = useRouter()
  const [killSwitch, setKillSwitch] = useState(initialKillSwitch)
  const [globalPhase, setGlobalPhase] = useState<SavePhase>("idle")
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [soldOutBySlug, setSoldOutBySlug] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(menuItems.map((item) => [item.slug, item.soldOut]))
  )
  const [itemPhase, setItemPhase] = useState<Record<string, SavePhase>>({})

  const activeMenuItems = menuItems.filter((item) => item.active)

  const setGlobalKillSwitch = useCallback(
    async (enabled: boolean) => {
      setGlobalPhase("saving")
      setGlobalError(null)
      try {
        const res = await fetch("/api/admin/ordering/kill-switch", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled }),
        })
        const data = (await res.json().catch(() => ({}))) as {
          error?: string
          state?: OrderingKillSwitchState
        }
        if (!res.ok) {
          throw new Error(data.error ?? "Could not update ordering kill switch.")
        }
        if (data.state) setKillSwitch(data.state)
        router.refresh()
      } catch (err) {
        setGlobalError(
          err instanceof Error ? err.message : "Could not update kill switch."
        )
        setGlobalPhase("error")
        return
      }
      setGlobalPhase("idle")
    },
    [router]
  )

  const toggleSoldOut = useCallback(
    async (item: AdminMenuItemView, soldOut: boolean) => {
      setSoldOutBySlug((prev) => ({ ...prev, [item.slug]: soldOut }))
      setItemPhase((prev) => ({ ...prev, [item.slug]: "saving" }))
      try {
        const res = await fetch("/api/admin/menu/sold-out", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sheetRow: item.sheetRow,
            slug: item.slug,
            soldOut,
          }),
        })
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        if (!res.ok) {
          throw new Error(data.error ?? "Could not update sold-out status.")
        }
        router.refresh()
        setItemPhase((prev) => ({ ...prev, [item.slug]: "idle" }))
      } catch {
        setSoldOutBySlug((prev) => ({
          ...prev,
          [item.slug]: item.soldOut,
        }))
        setItemPhase((prev) => ({ ...prev, [item.slug]: "error" }))
      }
    },
    [router]
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <DashboardCard
        title="Stop all ordering"
        subtitle="Emergency close for the public menu and checkout"
      >
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-espresso">Weekly ordering</p>
              <p className="text-caption mt-1">
                {killSwitch.active
                  ? "Customers cannot place new orders right now."
                  : "Normal schedule applies (Fri 9 AM – Wed noon ET) unless the window is closed."}
              </p>
            </div>
            <StatusPill
              status={killSwitch.active ? "Issue" : "Active"}
            />
          </div>
          {killSwitch.envLocked ? (
            <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-soft px-3 py-2">
              {killSwitch.storageHint}
            </p>
          ) : (
            <p className="text-caption text-xs">{killSwitch.storageHint}</p>
          )}
          {globalError ? (
            <p className="text-sm text-red-800" role="alert">
              {globalError}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {killSwitch.canToggle ? (
              killSwitch.adminToggle ? (
                <button
                  type="button"
                  disabled={globalPhase === "saving"}
                  onClick={() => void setGlobalKillSwitch(false)}
                  className={adminBtnPrimary}
                >
                  {globalPhase === "saving"
                    ? "Saving…"
                    : "Re-open ordering"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={globalPhase === "saving"}
                  onClick={() => void setGlobalKillSwitch(true)}
                  className="rounded-md border border-terracotta bg-terracotta text-cream px-4 py-2 font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {globalPhase === "saving"
                    ? "Saving…"
                    : "Close ordering now"}
                </button>
              )
            ) : null}
            <a href="/menu" className={adminBtnSecondary} target="_blank" rel="noreferrer">
              View public menu
            </a>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard
        title="Item sold-out"
        subtitle="Hide checkout for one menu item without closing the whole week"
      >
        {activeMenuItems.length === 0 ? (
          <p className="text-sm text-caption">
            No active menu items. Add or show items on the Menu page first.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {activeMenuItems.map((item) => {
              const soldOut = soldOutBySlug[item.slug] ?? item.soldOut
              const phase = itemPhase[item.slug] ?? "idle"
              return (
                <li
                  key={item.slug}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-espresso/10 bg-linen/30 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-espresso">{item.name}</p>
                    <p className="text-caption text-xs">{item.slug}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {soldOut ? (
                      <StatusPill status="Issue" />
                    ) : (
                      <StatusPill status="Active" />
                    )}
                    <button
                      type="button"
                      disabled={phase === "saving"}
                      onClick={() => void toggleSoldOut(item, !soldOut)}
                      className={adminBtnSecondary}
                    >
                      {phase === "saving"
                        ? "Saving…"
                        : soldOut
                          ? "Back in stock"
                          : "Mark sold out"}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </DashboardCard>
    </div>
  )
}
