"use client"

import { useCallback, useMemo, useState } from "react"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import EmptyState from "@/components/admin/ui/EmptyState"
import {
  adminBtnPrimary,
  adminBtnSecondary,
} from "@/components/admin/ui/admin-button"
import type { CustomerEmailType } from "@/lib/admin/customer-email-types"
import { customerEmailTypeLabel } from "@/lib/admin/customer-email-types"
import {
  defaultCustomEmailMessage,
  defaultCustomEmailSubject,
} from "@/lib/email/customer-order-update"
import { previewCustomerOrderEmail } from "@/lib/admin/customer-order-email-preview"
import type { CustomerEmailLogRow } from "@/lib/google-sheets/customer-emails"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"

interface AdminOrderCustomerEmailProps {
  order: AdminOrderRow
  initialHistory: CustomerEmailLogRow[]
}

type SendPhase = "idle" | "sending" | "sent" | "error"

interface PreviewState {
  type: CustomerEmailType
  subject: string
  text: string
  customSubject?: string
  customMessage?: string
}

export default function AdminOrderCustomerEmail({
  order,
  initialHistory,
}: AdminOrderCustomerEmailProps) {
  const [history, setHistory] = useState(initialHistory)
  const [preview, setPreview] = useState<PreviewState | null>(null)
  const [phase, setPhase] = useState<SendPhase>("idle")
  const [error, setError] = useState<string | null>(null)
  const [customSubject, setCustomSubject] = useState(defaultCustomEmailSubject)
  const [customMessage, setCustomMessage] = useState(() =>
    defaultCustomEmailMessage({
      customerName: order.customerName,
      internalRef: order.internalRef,
    })
  )
  const [customOpen, setCustomOpen] = useState(false)

  const isPickup = order.fulfillmentMethod === "pickup"
  const isDelivery = order.fulfillmentMethod === "delivery"
  const hasEmail = Boolean(order.customerEmail?.trim())

  const validationHint = useMemo(() => {
    if (!hasEmail) return "Add a customer email on this order before sending."
    const previewResult = previewCustomerOrderEmail(order, "ready_pickup")
    if ("error" in previewResult) return previewResult.error
    return null
  }, [order, hasEmail])

  const openPreview = useCallback(
    (type: CustomerEmailType) => {
      setError(null)
      const custom =
        type === "custom"
          ? { subject: customSubject, message: customMessage }
          : undefined
      const result = previewCustomerOrderEmail(order, type, custom)
      if ("error" in result) {
        setError(result.error)
        return
      }
      setPreview({
        type,
        subject: result.subject,
        text: result.text,
        customSubject: custom?.subject,
        customMessage: custom?.message,
      })
    },
    [order, customSubject, customMessage]
  )

  async function confirmSend() {
    if (!preview) return
    setPhase("sending")
    setError(null)

    try {
      const res = await fetch("/api/admin/orders/customer-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internalRef: order.internalRef,
          type: preview.type,
          subject: preview.customSubject,
          message: preview.customMessage,
        }),
      })

      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        history?: CustomerEmailLogRow[]
        skipped?: boolean
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Could not send email.")
      }

      if (data.history) setHistory(data.history)
      setPhase("sent")
      setPreview(null)
      setCustomOpen(false)

      if (data.skipped) {
        setError(
          "Email was logged but not sent — Resend is not configured on this server."
        )
      }

      setTimeout(() => setPhase("idle"), 2500)
    } catch (err) {
      setPhase("error")
      setError(err instanceof Error ? err.message : "Could not send email.")
    }
  }

  return (
    <div className="space-y-6">
      <DashboardCard
        title="Send customer update"
        subtitle="Transactional emails for this paid order only"
      >
        {validationHint && phase !== "sent" ? (
          <p className="text-sm text-terracotta bg-blush/10 border border-blush/30 rounded-soft px-3 py-2 mb-4">
            {validationHint}
          </p>
        ) : null}

        {error ? (
          <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-3 py-2 mb-4">
            {error}
          </p>
        ) : null}

        {phase === "sent" && !error ? (
          <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-soft px-3 py-2 mb-4">
            Email sent to {order.customerEmail}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!isPickup || !!validationHint || phase === "sending"}
            onClick={() => openPreview("ready_pickup")}
            className={adminBtnPrimary}
          >
            Ready for Pickup
          </button>
          <button
            type="button"
            disabled={!isDelivery || !!validationHint || phase === "sending"}
            onClick={() => openPreview("out_for_delivery")}
            className={adminBtnPrimary}
          >
            Out for Delivery
          </button>
          <button
            type="button"
            disabled={!!validationHint || phase === "sending"}
            onClick={() => setCustomOpen((o) => !o)}
            className={adminBtnSecondary}
          >
            Custom Message
          </button>
        </div>

        {customOpen ? (
          <div className="mt-5 space-y-3 rounded-soft border border-oatmeal/50 bg-linen/30 p-4">
            <label className="block text-sm">
              <span className="text-caption text-xs uppercase tracking-wide block mb-1">
                Subject
              </span>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full rounded-soft border border-oatmeal/80 bg-warm-white px-3 py-2 text-charcoal font-body text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-caption text-xs uppercase tracking-wide block mb-1">
                Message
              </span>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={6}
                className="w-full rounded-soft border border-oatmeal/80 bg-warm-white px-3 py-2 text-charcoal font-body text-sm"
              />
            </label>
            <button
              type="button"
              disabled={!!validationHint || phase === "sending"}
              onClick={() => openPreview("custom")}
              className={adminBtnPrimary}
            >
              Preview custom email
            </button>
          </div>
        ) : null}

        <p className="text-caption text-xs mt-4">
          Sends to {order.customerEmail || "—"} via your bakery email. Not for
          marketing blasts.
        </p>
      </DashboardCard>

      <DashboardCard title="Email history" subtitle="Logged in Customer Emails sheet">
        {history.length === 0 ? (
          <EmptyState
            title="No emails sent yet"
            message="Updates you send from here will appear in this list."
          />
        ) : (
          <ul className="space-y-3">
            {history.map((row, index) => (
              <li
                key={`${row.timestamp}-${index}`}
                className="rounded-soft border border-oatmeal/50 bg-linen/25 px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-medium text-charcoal">{row.subject}</span>
                  <span className="text-caption text-xs">{row.timestamp}</span>
                </div>
                <p className="text-caption text-xs mt-1">
                  {row.emailType} · {row.sentStatus}
                  {row.resendMessageId ? ` · ${row.resendMessageId}` : ""}
                </p>
                {row.message ? (
                  <p className="text-charcoal/80 mt-2 whitespace-pre-wrap line-clamp-4">
                    {row.message}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>

      {preview ? (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="email-preview-title"
        >
          <div className="w-full max-w-lg rounded-t-softer sm:rounded-softer bg-warm-white border border-oatmeal/60 shadow-warm p-5 sm:p-6 max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <h2
              id="email-preview-title"
              className="font-heading text-xl text-charcoal"
            >
              Preview email
            </h2>
            <p className="text-caption text-sm mt-1">
              {customerEmailTypeLabel(preview.type)} → {order.customerEmail}
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="text-caption">Subject: </span>
                <span className="font-medium text-charcoal">{preview.subject}</span>
              </p>
              <pre className="rounded-soft bg-linen/50 border border-oatmeal/40 p-3 text-xs whitespace-pre-wrap font-body text-charcoal/90 max-h-48 overflow-y-auto">
                {preview.text}
              </pre>
            </div>

            <p className="text-caption text-xs mt-4">
              Confirm to send this one-time update for order {order.internalRef}.
            </p>

            <div className="flex flex-col gap-2 mt-5 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                disabled={phase === "sending"}
                onClick={confirmSend}
                className={`${adminBtnPrimary} w-full sm:w-auto`}
              >
                {phase === "sending" ? "Sending…" : "Send email"}
              </button>
              <button
                type="button"
                disabled={phase === "sending"}
                onClick={() => setPreview(null)}
                className={`${adminBtnSecondary} w-full sm:w-auto`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
