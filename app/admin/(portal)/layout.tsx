import AdminShell from "@/components/admin/AdminShell"

export default function AdminPortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AdminShell>{children}</AdminShell>
}
