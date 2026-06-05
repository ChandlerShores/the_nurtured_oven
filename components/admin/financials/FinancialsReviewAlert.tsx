import type { ReactNode } from "react"

interface FinancialsReviewAlertProps {
  title?: string
  children: ReactNode
}

export default function FinancialsReviewAlert({
  title = "Needs review",
  children,
}: FinancialsReviewAlertProps) {
  return (
    <div
      role="status"
      className="rounded-lg border border-terracotta/35 bg-terracotta/10 px-4 py-3 mb-4 text-sm text-espresso"
    >
      <p className="font-semibold">{title}</p>
      <div className="mt-2 text-caption leading-relaxed">{children}</div>
    </div>
  )
}
