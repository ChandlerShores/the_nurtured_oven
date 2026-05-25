"use client"

import Link from "next/link"

export default function PlaybookToolbar() {
  return (
    <div className="playbook-no-print sticky top-0 z-20 border-b border-linen/50 bg-cream/95 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-body text-muted">
          Owner playbook: use <strong className="text-espresso font-medium">Print</strong>{" "}
          and save as PDF to share.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/"
            className="text-sm font-body text-muted hover:text-espresso px-3 py-2 rounded-lg border border-linen/50"
          >
            Website
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="text-sm font-body bg-olive text-cream px-4 py-2 rounded-lg hover:bg-espresso transition-colors"
          >
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  )
}
