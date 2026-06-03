import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin | The Nurtured Oven",
  robots: { index: false, follow: false },
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-[100dvh] bg-admin-bg font-body text-charcoal">
      {children}
    </div>
  )
}
