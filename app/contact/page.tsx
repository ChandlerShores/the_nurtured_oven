"use client"

import { Suspense } from "react"
import ContactPageContent from "@/components/contact/ContactPageContent"

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-cream min-h-[50vh] flex items-center justify-center text-caption font-body">
          Loading...
        </div>
      }
    >
      <ContactPageContent />
    </Suspense>
  )
}
