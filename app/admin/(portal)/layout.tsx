import type { Metadata } from "next"
import AdminShell from "@/components/admin/AdminShell"
import { requireAdminPortal } from "@/lib/admin/require-admin-portal"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AdminPortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await requireAdminPortal()
  return <AdminShell>{children}</AdminShell>
}
