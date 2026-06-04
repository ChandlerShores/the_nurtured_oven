"use client"

import { adminBtnPrimary } from "@/components/admin/ui/admin-button"

export default function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button type="button" className={adminBtnPrimary} onClick={() => window.print()}>
      {label}
    </button>
  )
}
