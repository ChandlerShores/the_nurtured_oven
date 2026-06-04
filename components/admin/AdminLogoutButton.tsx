"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function AdminLogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      router.push("/admin/login")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="text-sm text-olive hover:text-charcoal font-body disabled:opacity-60 w-full text-left min-h-[44px] py-2 touch-manipulation"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  )
}
