"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { siteConfig } from "@/lib/content/site"
import SocialIcons from "@/components/ui/SocialIcons"
import Divider from "@/components/ui/Divider"

type FormIntent = "weekly-order" | "gift" | "reminder" | "general"

const intentLabels: Record<FormIntent, { heading: string; description: string }> = {
  "weekly-order": {
    heading: "Place a Weekly Order",
    description:
      "Tell us what you\u2019d like from this week\u2019s menu. We\u2019ll follow up with a Square payment link to confirm your order.",
  },
  gift: {
    heading: "Request a Comfort Box",
    description:
      "Let us know who it\u2019s for, the occasion, and your preferred size. We\u2019ll reach out to finalize the details and payment.",
  },
  reminder: {
    heading: "Get Menu Reminders",
    description:
      "Sign up and we\u2019ll let you know each Saturday when the new weekly menu drops.",
  },
  general: {
    heading: "Get in Touch",
    description:
      "Questions, future orders, or just want to say hello? We\u2019d love to hear from you.",
  },
}

function OrderForm() {
  const searchParams = useSearchParams()
  const intentParam = searchParams.get("intent") as FormIntent | null
  const prefillItem = searchParams.get("item") || ""

  const initialIntent: FormIntent =
    intentParam && intentParam in intentLabels ? intentParam : "weekly-order"

  const [intent, setIntent] = useState<FormIntent>(initialIntent)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    items: prefillItem,
    fulfillment: "pickup",
    deliveryAddress: "",
    giftRecipient: "",
    giftMessage: "",
    giftOccasion: "",
    dietary: "",
    message: "",
  })
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")

  useEffect(() => {
    if (prefillItem) {
      setForm((prev) => ({ ...prev, items: prefillItem }))
    }
  }, [prefillItem])

  useEffect(() => {
    if (intentParam && intentParam in intentLabels) {
      setIntent(intentParam as FormIntent)
    }
  }, [intentParam])

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
        body: JSON.stringify({ ...form, intent }),
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

  const info = intentLabels[intent]

  if (status === "success") {
    const successMessages: Record<FormIntent, string> = {
      "weekly-order":
        "We received your order request. We\u2019ll send a Square payment link to confirm — your order is locked in once payment is received.",
      gift:
        "We received your gift box request. We\u2019ll reach out to finalize the details and payment.",
      reminder:
        "You\u2019re on the list! We\u2019ll notify you each Saturday when the new menu drops.",
      general:
        `Thanks for reaching out. We\u2019ll get back to you ${siteConfig.responseWindow}.`,
    }

    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">🍪</div>
        <h2 className="font-heading text-2xl sm:text-3xl text-espresso mb-4 tracking-wide">
          Thank you!
        </h2>
        <Divider icon="heart" />
        <p className="text-brown-sugar/70 text-lg font-body max-w-md mx-auto leading-relaxed">
          {successMessages[intent]}
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
    <>
      {/* Intent switcher */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {(Object.keys(intentLabels) as FormIntent[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setIntent(key)}
            className={`text-sm px-4 py-2 rounded-full border font-body transition-colors ${
              intent === key
                ? "bg-olive text-cream border-olive"
                : "bg-cream/60 text-olive/70 border-linen/60 hover:border-olive/40"
            }`}
          >
            {intentLabels[key].heading}
          </button>
        ))}
      </div>

      <div className="text-center mb-8">
        <h2 className="font-heading text-xl sm:text-2xl text-espresso tracking-wide mb-2">
          {info.heading}
        </h2>
        <p className="text-brown-sugar/60 text-sm font-body max-w-lg mx-auto leading-relaxed">
          {info.description}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name & Email — always shown */}
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

        {/* Reminder intent only needs name + email */}
        {intent === "reminder" && (
          <p className="text-brown-sugar/50 text-sm text-center font-body">
            That&apos;s all we need! Hit the button below and we&apos;ll add you to the Saturday menu reminder list.
          </p>
        )}

        {/* Weekly order fields */}
        {intent === "weekly-order" && (
          <>
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
                What would you like to order? <span className="text-blush">*</span>
              </label>
              <textarea
                id="items"
                required
                rows={3}
                className={inputBase}
                value={form.items}
                onChange={(e) => update("items", e.target.value)}
                placeholder="e.g., 1 Weekly Comfort Box, 1 6-pack Brown Butter Chocolate Chip Cookies..."
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
                  <option value="pickup">Friday pickup</option>
                  <option value="delivery">Limited local delivery</option>
                </select>
              </div>
              {form.fulfillment === "delivery" && (
                <div>
                  <label htmlFor="deliveryAddress" className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide">
                    Delivery address
                  </label>
                  <input
                    id="deliveryAddress"
                    type="text"
                    className={inputBase}
                    value={form.deliveryAddress}
                    onChange={(e) => update("deliveryAddress", e.target.value)}
                    placeholder="Street address, city"
                  />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="dietary" className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide">
                Allergy or dietary notes <span className="text-brown-sugar/40 text-xs">(optional)</span>
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
          </>
        )}

        {/* Gift fields */}
        {intent === "gift" && (
          <>
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
                Which Comfort Box? <span className="text-blush">*</span>
              </label>
              <select
                id="items"
                required
                className={inputBase}
                value={form.items}
                onChange={(e) => update("items", e.target.value)}
              >
                <option value="">Select a size...</option>
                <option value="Mini Comfort Box">Mini Comfort Box ($16–22)</option>
                <option value="Classic Comfort Box">Classic Comfort Box ($32–42)</option>
                <option value="Gathering Box">Gathering Box ($55–75+)</option>
                <option value="Not sure">Not sure — help me choose</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="giftRecipient" className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide">
                  Who is it for?
                </label>
                <input
                  id="giftRecipient"
                  type="text"
                  className={inputBase}
                  value={form.giftRecipient}
                  onChange={(e) => update("giftRecipient", e.target.value)}
                  placeholder="Recipient name or description"
                />
              </div>
              <div>
                <label htmlFor="giftOccasion" className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide">
                  Occasion
                </label>
                <input
                  id="giftOccasion"
                  type="text"
                  className={inputBase}
                  value={form.giftOccasion}
                  onChange={(e) => update("giftOccasion", e.target.value)}
                  placeholder="e.g., birthday, new baby, thank you"
                />
              </div>
            </div>

            <div>
              <label htmlFor="giftMessage" className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide">
                Gift message <span className="text-brown-sugar/40 text-xs">(optional — we&apos;ll include it in the box)</span>
              </label>
              <textarea
                id="giftMessage"
                rows={2}
                className={inputBase}
                value={form.giftMessage}
                onChange={(e) => update("giftMessage", e.target.value)}
                placeholder="A personal note to include with the gift..."
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
                  <option value="pickup">Friday pickup</option>
                  <option value="delivery">Limited local delivery</option>
                </select>
              </div>
              {form.fulfillment === "delivery" && (
                <div>
                  <label htmlFor="deliveryAddress" className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide">
                    Delivery address
                  </label>
                  <input
                    id="deliveryAddress"
                    type="text"
                    className={inputBase}
                    value={form.deliveryAddress}
                    onChange={(e) => update("deliveryAddress", e.target.value)}
                    placeholder="Street address, city"
                  />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="dietary" className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide">
                Allergy or dietary notes <span className="text-brown-sugar/40 text-xs">(optional)</span>
              </label>
              <input
                id="dietary"
                type="text"
                className={inputBase}
                value={form.dietary}
                onChange={(e) => update("dietary", e.target.value)}
                placeholder="Any allergies or dietary needs?"
              />
              <p className="mt-2 text-xs text-brown-sugar/50 leading-relaxed">
                {siteConfig.cottageBakeryDisclosure}
              </p>
            </div>
          </>
        )}

        {/* General contact fields */}
        {intent === "general" && (
          <>
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
              <label htmlFor="message" className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide">
                Message <span className="text-blush">*</span>
              </label>
              <textarea
                id="message"
                required
                rows={4}
                className={inputBase}
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                placeholder="Questions, future orders, custom inquiries..."
              />
            </div>
          </>
        )}

        {/* Additional notes — weekly order and gift */}
        {(intent === "weekly-order" || intent === "gift") && (
          <div>
            <label htmlFor="message" className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide">
              Anything else? <span className="text-brown-sugar/40 text-xs">(optional)</span>
            </label>
            <textarea
              id="message"
              rows={2}
              className={inputBase}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder="Special requests, preferred fulfillment date, questions..."
            />
          </div>
        )}

        {/* Payment note for order intents */}
        {(intent === "weekly-order" || intent === "gift") && (
          <p className="text-brown-sugar/50 text-xs leading-relaxed text-center">
            Orders are confirmed once payment is received. We&apos;ll send a Square payment link after reviewing your request.
          </p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full bg-olive text-cream py-4 rounded-full font-medium text-lg hover:bg-espresso shadow-gentle hover:shadow-warm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
        >
          {status === "sending"
            ? "Sending..."
            : intent === "reminder"
              ? "Sign Up for Reminders"
              : intent === "gift"
                ? "Send Gift Request"
                : intent === "weekly-order"
                  ? "Submit Order"
                  : "Send Message"}
        </button>

        {status === "error" && (
          <p className="text-center text-blush text-sm">
            Something went wrong. Please try again or reach out directly.
          </p>
        )}
      </form>
    </>
  )
}

export default function ContactPage() {
  return (
    <div className="bg-cream">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <p className="font-accent text-brown-sugar/60 text-lg mb-2">let&apos;s get you taken care of</p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-espresso tracking-wide">
            Order &amp; Contact
          </h1>
          <Divider icon="heart" className="mt-4 mb-2" />
        </div>

        <div className="bg-warm-white rounded-2xl p-6 sm:p-10 shadow-gentle border border-linen/30">
          <Suspense fallback={<div className="py-12 text-center text-brown-sugar/50">Loading form...</div>}>
            <OrderForm />
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
