import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import AdminLoginForm from "@/components/admin/AdminLoginForm"
import { isAdminAuthenticated } from "@/lib/admin/auth"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin")
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4 py-10 bg-admin-bg">
      <div className="w-full max-w-md rounded-softer border border-oatmeal/60 bg-warm-white p-8 shadow-warm">
        <p className="font-accent text-2xl text-blush text-center mb-1">
          The Nurtured Oven
        </p>
        <h1 className="font-heading text-2xl text-center text-charcoal mb-2">
          Baker sign-in
        </h1>
        <p className="text-caption text-center text-sm mb-8">
          Orders and status updates for this week&apos;s batch.
        </p>
        <Suspense
          fallback={
            <p className="text-caption text-center text-sm">Loading…</p>
          }
        >
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  )
}
