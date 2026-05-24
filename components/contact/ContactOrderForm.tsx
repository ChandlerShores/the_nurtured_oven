"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import type { ContactIntent } from "@/components/contact/ContactIntentSelector"
import GiftFormFields from "@/components/contact/GiftFormFields"
import WeeklyOrderCart from "@/components/order/WeeklyOrderCart"
import Divider from "@/components/ui/Divider"
import SocialIcons from "@/components/ui/SocialIcons"
import {
  contactFormPanelCopy,
  contactInputClassName,
  contactSuccessMessages,
} from "@/lib/contact/form-copy"
import { resolvePrefillSlug } from "@/lib/contact/prefill"
import {
  emptyContactFormState,
  type ContactFormState,
} from "@/lib/contact/types"
import { fulfillmentPolicy } from "@/lib/content/fulfillment"
import { siteConfig } from "@/lib/content/site"

export default function ContactOrderForm({ intent }: { intent: ContactIntent }) {
  const searchParams = useSearchParams()
  const prefillSlug = resolvePrefillSlug(searchParams.get("item") || "")

  const [cartItems, setCartItems] = useState<{ slug: string; quantity: number }[]>(
    prefillSlug ? [{ slug: prefillSlug, quantity: 1 }] : []
  )
  const [form, setForm] = useState<ContactFormState>(emptyContactFormState)
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("sending")
    setErrorMessage(null)

    try {
      if (intent === "weekly-order") {
        if (cartItems.length === 0) {
          setStatus("error")
          setErrorMessage("Please add at least one item to your order.")
          return
        }

        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            lineItems: cartItems,
            fulfillment: form.fulfillment,
            deliveryAddress: form.deliveryAddress,
            dietary: form.dietary,
            message: form.message,
          }),
        })

        const data = await res.json()

        if (res.ok && data.checkoutUrl) {
          window.location.href = data.checkoutUrl
          return
        }

        setStatus("error")
        setErrorMessage(data.error || "Could not start checkout.")
        return
      }

      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, intent }),
      })

      if (res.ok) {
        setStatus("success")
      } else {
        const data = await res.json().catch(() => ({}))
        setStatus("error")
        setErrorMessage(data.error || null)
      }
    } catch {
      setStatus("error")
      setErrorMessage(null)
    }
  }

  const panel = contactFormPanelCopy[intent]

  if (status === "success") {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="text-4xl mb-4">🍪</div>
        <h2 className="font-heading text-2xl sm:text-3xl text-espresso mb-4 tracking-wide">
          Thank you!
        </h2>
        <Divider icon="heart" />
        <p className="text-brown-sugar/70 text-lg font-body max-w-md mx-auto leading-relaxed">
          {contactSuccessMessages[intent]}
        </p>
        <div className="mt-6 flex justify-center">
          <SocialIcons iconSize={22} />
        </div>
      </div>
    )
  }

  const submitLabel =
    status === "sending"
      ? intent === "weekly-order"
        ? "Redirecting to checkout..."
        : "Sending..."
      : intent === "reminder"
        ? "Sign Up for Reminders"
        : intent === "gift"
          ? "Send Gift Request"
          : intent === "weekly-order"
            ? "Continue to payment"
            : "Send Message"

  return (
    <>
      <div
        id="contact-form-panel"
        role="tabpanel"
        aria-labelledby={`contact-tab-${intent}`}
        className="mb-2"
      >
        <div className="mb-8 pb-6 border-b border-linen/40">
          <h2 className="font-heading text-xl sm:text-2xl text-espresso tracking-wide mb-2">
            {panel.heading}
          </h2>
          <p className="text-brown-sugar/60 text-sm sm:text-base font-body leading-relaxed max-w-2xl">
            {panel.description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {intent === "weekly-order" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
                    >
                      Name <span className="text-blush">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      className={contactInputClassName}
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
                    >
                      Email <span className="text-blush">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      className={contactInputClassName}
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="you@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
                  >
                    Phone{" "}
                    <span className="text-brown-sugar/40 text-xs">(optional)</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className={contactInputClassName}
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="fulfillment"
                      className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
                    >
                      Pickup or delivery?
                    </label>
                    <select
                      id="fulfillment"
                      className={contactInputClassName}
                      value={form.fulfillment}
                      onChange={(e) => update("fulfillment", e.target.value)}
                    >
                      <option value="pickup">
                        {fulfillmentPolicy.pickupOptionLabel}
                      </option>
                      <option value="delivery">
                        {fulfillmentPolicy.deliveryOptionLabel}
                      </option>
                    </select>
                  </div>
                  {form.fulfillment === "delivery" && (
                    <div>
                      <label
                        htmlFor="deliveryAddress"
                        className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
                      >
                        Delivery address
                      </label>
                      <input
                        id="deliveryAddress"
                        type="text"
                        className={contactInputClassName}
                        value={form.deliveryAddress}
                        onChange={(e) =>
                          update("deliveryAddress", e.target.value)
                        }
                        placeholder={fulfillmentPolicy.deliveryAddressPlaceholder}
                      />
                    </div>
                  )}
                </div>

                <p className="text-xs text-brown-sugar/55 leading-relaxed font-body bg-oatmeal/30 rounded-xl px-4 py-3 border border-linen/30">
                  {fulfillmentPolicy.customerFacing}
                </p>

                <p className="text-xs text-brown-sugar/55 leading-relaxed font-body">
                  You&apos;ll confirm your order and pay securely with Square.
                </p>

                <div>
                  <label
                    htmlFor="dietary"
                    className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
                  >
                    Allergy or dietary notes{" "}
                    <span className="text-brown-sugar/40 text-xs">(optional)</span>
                  </label>
                  <input
                    id="dietary"
                    type="text"
                    className={contactInputClassName}
                    value={form.dietary}
                    onChange={(e) => update("dietary", e.target.value)}
                    placeholder="Any allergies or dietary needs we should know about?"
                  />
                  <p className="mt-2 text-xs text-brown-sugar/50 leading-relaxed">
                    {siteConfig.cottageBakeryDisclosure}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
                  >
                    Anything else?{" "}
                    <span className="text-brown-sugar/40 text-xs">(optional)</span>
                  </label>
                  <textarea
                    id="message"
                    rows={2}
                    className={contactInputClassName}
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    placeholder="Special requests or questions..."
                  />
                </div>
              </div>

              <div className="lg:pl-2">
                <p className="block text-sm text-brown-sugar/80 mb-3 tracking-wide font-body">
                  Your order <span className="text-blush">*</span>
                </p>
                <WeeklyOrderCart
                  variant="contact"
                  prefillSlug={prefillSlug}
                  fulfillment={
                    form.fulfillment === "delivery" ? "delivery" : "pickup"
                  }
                  onQuantitiesChange={setCartItems}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
                  >
                    Name <span className="text-blush">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    className={contactInputClassName}
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
                  >
                    Email <span className="text-blush">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className={contactInputClassName}
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@email.com"
                  />
                </div>
              </div>

              {intent === "reminder" && (
                <p className="text-brown-sugar/50 text-sm text-center font-body bg-oatmeal/30 rounded-xl px-4 py-3 border border-linen/30">
                  That&apos;s all we need! We&apos;ll add you to the Friday menu
                  reminder list.
                </p>
              )}

              {intent === "gift" && (
                <GiftFormFields
                  form={form}
                  update={update}
                  inputClassName={contactInputClassName}
                />
              )}

              {intent === "general" && (
                <>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
                    >
                      Phone{" "}
                      <span className="text-brown-sugar/40 text-xs">(optional)</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className={contactInputClassName}
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
                    >
                      Message <span className="text-blush">*</span>
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={4}
                      className={contactInputClassName}
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      placeholder="Questions, future orders, custom inquiries..."
                    />
                  </div>
                </>
              )}
            </>
          )}

          {intent === "gift" && (
            <p className="text-brown-sugar/50 text-xs leading-relaxed text-center">
              We&apos;ll follow up to finalize your gift box details and payment.
            </p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full bg-olive text-cream py-4 rounded-full font-medium text-lg hover:bg-espresso shadow-gentle hover:shadow-warm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
          >
            {submitLabel}
          </button>

          {status === "error" && (
            <p className="text-center text-blush text-sm" role="alert">
              {errorMessage ||
                "Something went wrong. Please try again or reach out directly."}
            </p>
          )}
        </form>
      </div>
    </>
  )
}
