"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { safeAdminNextPath } from "@/lib/admin/safe-admin-path"

export default function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = safeAdminNextPath(searchParams.get("next"))

  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? "Login failed. Try again.")
        return
      }

      router.push(nextPath)
      router.refresh()
    } catch {
      setError("Something went wrong. Check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="admin-password"
          className="block text-sm font-medium text-espresso mb-2 font-body"
        >
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-soft border border-oatmeal/80 bg-warm-white px-4 py-3 text-espresso font-body text-base shadow-gentle focus:border-sage"
          placeholder="Enter admin password"
        />
      </div>

      {error ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-3 py-2 font-body">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-soft bg-espresso text-cream py-3 px-4 font-medium font-body shadow-warm disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  )
}
