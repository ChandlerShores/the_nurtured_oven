"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import {
  adminBtnPrimary,
  adminBtnSecondary,
} from "@/components/admin/ui/admin-button"
import type { BulkEmailPreview } from "@/lib/admin/bulk-customer-email"
import type { CustomerEmailType } from "@/lib/admin/customer-email-types"

interface AdminBulkCustomerEmailProps {
  title?: string
  emailType: CustomerEmailType
  weekKey: string
  emptyHint: string
}

export default function AdminBulkCustomerEmail({
  title,
  emailType,
  weekKey,
  emptyHint,
}: AdminBulkCustomerEmailProps) {
  const router = useRouter()
  const [preview, setPreview] = useState<BulkEmailPreview | null>(null)
  const [phase, setPhase] = useState<"idle" | "previewing" | "sending" | "done">(
    "idle"
  )
  const [error, setError] = useState<string | null>(null)
  const [sendSummary, setSendSummary] = useState<string | null>(null)

  const loadPreview = useCallback(async () => {
    setPhase("previewing")
    setError(null)
    setSendSummary(null)
    try {
      const res = await fetch("/api/admin/orders/customer-email/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: emailType,
          weekKey,
          dryRun: true,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        preview?: BulkEmailPreview
      }
      if (!res.ok) {
        throw new Error(data.error ?? "Could not load preview.")
      }
      setPreview(data.preview ?? null)
      setPhase("idle")
    } catch (err) {
      setPhase("idle")
      setError(err instanceof Error ? err.message : "Could not load preview.")
    }
  }, [emailType, weekKey])

  async function confirmSend() {
    if (!preview || preview.sendCount === 0) return
    setPhase("sending")
    setError(null)
    try {
      const res = await fetch("/api/admin/orders/customer-email/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: emailType,
          weekKey,
          dryRun: false,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        preview?: BulkEmailPreview
        result?: { sent: number; skipped: number; failed: { internalRef: string; error: string }[] }
      }
      if (!res.ok) {
        throw new Error(data.error ?? "Bulk send failed.")
      }
      setPreview(data.preview ?? preview)
      const r = data.result
      if (r) {
        const failedNote =
          r.failed.length > 0
            ? ` · ${r.failed.length} failed`
            : ""
        setSendSummary(
          `Sent ${r.sent}${r.skipped > 0 ? ` · ${r.skipped} logged only` : ""}${failedNote}`
        )
      }
      setPhase("done")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk send failed.")
    } finally {
      setPhase("idle")
    }
  }

  return (
    <DashboardCard title={title}>
      <div data-sop="bulk-customer-email">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          className={adminBtnSecondary}
          onClick={() => void loadPreview()}
          disabled={phase === "previewing" || phase === "sending"}
          data-sop="bulk-email-preview"
        >
          {phase === "previewing" ? "Loading…" : "Preview"}
        </button>
        {preview && preview.sendCount > 0 ? (
          <button
            type="button"
          className={adminBtnPrimary}
          onClick={() => void confirmSend()}
          disabled={phase === "sending"}
          data-sop="bulk-email-send"
        >
            {phase === "sending"
              ? "Sending…"
              : `Send (${preview.sendCount})`}
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-3 py-2 mt-3">
          {error}
        </p>
      ) : null}

      {sendSummary ? (
        <p className="text-sm text-sage-deep bg-sage/15 border border-sage/40 rounded-soft px-3 py-2 mt-3">
          {sendSummary}
        </p>
      ) : null}

      {preview ? (
        <div className="mt-4 space-y-3 text-sm">
          <p className="text-espresso">
            <span className="font-semibold">{preview.sendCount}</span> to send ·{" "}
            <span className="font-semibold">{preview.alreadySent.length}</span>{" "}
            sent ·{" "}
            <span className="font-semibold">{preview.skipped.length}</span>{" "}
            skipped
          </p>
          {preview.sendCount === 0 ? (
            <p className="text-caption">{emptyHint}</p>
          ) : (
            <ul className="max-h-40 overflow-y-auto rounded-md border border-espresso/15 divide-y divide-espresso/10 bg-warm-white">
              {preview.eligible.map((c) => (
                <li key={c.internalRef} className="px-3 py-2">
                  <span className="font-semibold">{c.customerName}</span>
                  <span className="text-caption ml-2">{c.orderStatus}</span>
                </li>
              ))}
            </ul>
          )}
          {preview.alreadySent.length > 0 ? (
            <details className="text-caption">
              <summary className="cursor-pointer font-semibold text-espresso/80">
                Sent ({preview.alreadySent.length})
              </summary>
              <ul className="mt-2 space-y-1">
                {preview.alreadySent.map((c) => (
                  <li key={c.internalRef}>
                    {c.customerName} — {c.skipDetail}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      ) : (
        <p className="text-caption text-sm mt-3">{emptyHint}</p>
      )}
      </div>
    </DashboardCard>
  )
}
