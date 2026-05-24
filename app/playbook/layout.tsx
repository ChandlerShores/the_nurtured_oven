import type { Metadata } from "next"
import "./playbook.css"

export const metadata: Metadata = {
  title: "Owner Playbook | The Nurtured Oven",
  description:
    "Printable guide — weekly rhythm, products, pricing, and operations for The Nurtured Oven.",
  robots: { index: false, follow: false },
}

export default function PlaybookLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="playbook-doc min-h-screen">
      {children}
    </div>
  )
}
