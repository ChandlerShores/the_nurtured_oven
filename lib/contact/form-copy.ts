import type { ContactIntent } from "@/components/contact/ContactIntentSelector"
import { siteConfig } from "@/lib/content/site"

export const contactFormPanelCopy: Record<
  ContactIntent,
  { heading: string; description: string }
> = {
  "weekly-order": {
    heading: "Order This Week",
    description:
      "Tell us what you\u2019d like, how you\u2019d like it fulfilled, and pay securely with Square.",
  },
  gift: {
    heading: "Request a Comfort Box",
    description:
      "Let us know who it\u2019s for, the occasion, and your preferred size. We\u2019ll reach out to finalize details and payment.",
  },
  reminder: {
    heading: "Get Menu Reminders",
    description:
      "Sign up and we\u2019ll let you know each Friday when the new weekly menu drops.",
  },
  general: {
    heading: "Ask a Question",
    description:
      "Questions, future orders, or just want to say hello? We\u2019d love to hear from you.",
  },
}

export const contactSuccessMessages: Record<ContactIntent, string> = {
  "weekly-order":
    "Your order is confirmed once payment is received at checkout.",
  gift:
    "We received your gift box request. We\u2019ll reach out to finalize the details and payment.",
  reminder:
    "You\u2019re on the list! We\u2019ll notify you each Friday when the new menu drops.",
  general: `Thanks for reaching out. We\u2019ll get back to you ${siteConfig.responseWindow}.`,
}

export const contactInputClassName =
  "w-full bg-cream/60 border border-linen/60 rounded-xl px-4 py-3 text-espresso font-body placeholder:text-espresso/45 focus:outline-none focus:ring-2 focus:ring-blush/30 focus:border-blush/50 transition-all duration-200"
