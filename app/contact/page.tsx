"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { siteConfig } from "@/lib/content/site"
import SocialIcons from "@/components/ui/SocialIcons"
import Divider from "@/components/ui/Divider"

function InquiryForm() {
  const searchParams = useSearchParams()
  const prefillItem = searchParams.get("item") || ""

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    items: prefillItem,
    fulfillment: "pickup",
    date: "",
    dietary: "",
    message: "",
  })
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")

  useEffect(() => {
    if (prefillItem) {
      setForm((prev) => ({ ...prev, items: prefillItem }))
    }
  }, [prefillItem])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("sending")

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setStatus("success")
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">🍪</div>
        <h2 className="font-heading text-2xl sm:text-3xl text-espresso mb-4 tracking-wide">
          Thank you — we received your request.
        </h2>
        <Divider icon="heart" />
        <p className="text-brown-sugar/70 text-lg font-body max-w-md mx-auto leading-relaxed">
          The owner will reach out {siteConfig.responseWindow} to confirm the
          details. In the meantime, follow along for updates:
        </p>
        <div className="mt-6 flex justify-center">
          <SocialIcons iconSize={22} />
        </div>
      </div>
    )
  }

  const inputBase =
    "w-full bg-cream/60 border border-linen/60 rounded-xl px-4 py-3 text-espresso font-body placeholder:text-brown-sugar/40 focus:outline-none focus:ring-2 focus:ring-blush/30 focus:border-blush/50 transition-all duration-200"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide">
            Name <span className="text-blush">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            className={inputBase}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide">
            Email <span className="text-blush">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            className={inputBase}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@email.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide">
          Phone <span className="text-brown-sugar/40 text-xs">(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          className={inputBase}
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="(555) 123-4567"
        />
      </div>

      <div>
        <label htmlFor="items" className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide">
          What are you interested in? <span className="text-blush">*</span>
        </label>
        <textarea
          id="items"
          required
          rows={3}
          className={inputBase}
          value={form.items}
          onChange={(e) => update("items", e.target.value)}
          placeholder="e.g., a dozen chocolate chip cookies, a Comfort Box for a friend, custom gift request..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="fulfillment" className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide">
            Pickup or delivery?
          </label>
          <select
            id="fulfillment"
            className={inputBase}
            value={form.fulfillment}
            onChange={(e) => update("fulfillment", e.target.value)}
          >
            <option value="pickup">Local pickup</option>
            <option value="delivery">Limited local delivery</option>
            <option value="not-sure">Not sure yet</option>
          </select>
        </div>
        <div>
          <label htmlFor="date" className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide">
            Desired date
          </label>
          <input
            id="date"
            type="text"
            className={inputBase}
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            placeholder="e.g., this Friday, next weekend"
          />
        </div>
      </div>

      <div>
        <label htmlFor="dietary" className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide">
          Dietary/allergy notes <span className="text-brown-sugar/40 text-xs">(optional)</span>
        </label>
        <input
          id="dietary"
          type="text"
          className={inputBase}
          value={form.dietary}
          onChange={(e) => update("dietary", e.target.value)}
          placeholder="Any allergies or dietary needs we should know about?"
        />
        <p className="mt-2 text-xs text-brown-sugar/50 leading-relaxed">
          {siteConfig.cottageBakeryDisclosure}
        </p>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide">
          Anything else? <span className="text-brown-sugar/40 text-xs">(optional)</span>
        </label>
        <textarea
          id="message"
          rows={3}
          className={inputBase}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Notes about your order, gift message, questions..."
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-brown-sugar text-warm-white py-4 rounded-full font-medium text-lg hover:bg-espresso shadow-gentle hover:shadow-warm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
      >
        {status === "sending" ? "Sending..." : "Send Order Inquiry"}
      </button>

      {status === "error" && (
        <p className="text-center text-blush text-sm">
          Something went wrong. Please try again or reach out directly.
        </p>
      )}
    </form>
  )
}

export default function ContactPage() {
  return (
    <div className="bg-cream">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <p className="font-accent text-brown-sugar/60 text-lg mb-2">we&apos;d love to hear from you</p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-espresso tracking-wide">
            Request an Order
          </h1>
          <Divider icon="heart" className="mt-4 mb-2" />
          <p className="text-brown-sugar/70 text-lg font-body max-w-xl mx-auto leading-relaxed">
            Tell us what you&apos;re looking for and we&apos;ll get back to you
            to confirm the details. No commitment — just a conversation.
          </p>
        </div>

        <div className="bg-warm-white rounded-2xl p-6 sm:p-10 shadow-gentle border border-linen/30">
          <Suspense fallback={<div className="py-12 text-center text-brown-sugar/50">Loading form...</div>}>
            <InquiryForm />
          </Suspense>
        </div>

        <div className="mt-12 text-center">
          <p className="text-brown-sugar/60 text-sm font-body">
            Prefer to connect another way? Find us on social media.
          </p>
          <div className="mt-3 flex justify-center">
            <SocialIcons iconSize={20} />
          </div>
        </div>
      </div>
    </div>
  )
}
