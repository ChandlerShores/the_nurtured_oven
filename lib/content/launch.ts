import { siteConfig } from "@/lib/content/site"
import type { FaqEntry } from "@/lib/content/faq"
import type { ContactIntent } from "@/lib/contact/intents"
import { CONTACT_INTENT_IDS } from "@/lib/contact/intents"

/**
 * Week 1 launch toggles — flip these to restore gift boxes + Little Extras sitewide.
 * See docs/LAUNCH_WEEK1.md for what each flag affects and how to revert.
 */
export const launchConfig = {
  /** Mini / Classic / Gathering gift tiers at /gifts */
  giftComfortBoxesEnabled: false,
  /** Friday Little Extras page + menu callout */
  littleExtrasEnabled: false,
} as const

const GIFT_NAV_HREF = "/gifts"
const LITTLE_EXTRAS_NAV_HREF = "/little-extras"

const FAQ_GIFT_TIERS = "What are the Comfort Box gift tiers?"
const FAQ_LITTLE_EXTRAS = "What are Little Extras?"
const FAQ_ORDERING_CLOSED = "What if ordering is closed when I visit the site?"

export function getPublicNav() {
  return siteConfig.nav.filter((item) => {
    if (!launchConfig.giftComfortBoxesEnabled && item.href === GIFT_NAV_HREF) {
      return false
    }
    if (!launchConfig.littleExtrasEnabled && item.href === LITTLE_EXTRAS_NAV_HREF) {
      return false
    }
    return true
  })
}

export function isGiftContactIntentEnabled(): boolean {
  return launchConfig.giftComfortBoxesEnabled
}

export function getVisibleContactIntentIds(
  weeklyOrderingAvailable: boolean
): ContactIntent[] {
  return CONTACT_INTENT_IDS.filter((id) => {
    if (!isGiftContactIntentEnabled() && id === "gift") return false
    if (!weeklyOrderingAvailable && id === "weekly-order") return false
    return true
  })
}

export function resolveContactDefaultIntent(
  weeklyOrderingAvailable: boolean,
  intentParam: ContactIntent | null
): ContactIntent {
  const allowed = getVisibleContactIntentIds(weeklyOrderingAvailable)

  if (intentParam && allowed.includes(intentParam)) {
    return intentParam
  }

  if (weeklyOrderingAvailable) {
    return "weekly-order"
  }

  return allowed[0] ?? "reminder"
}

export function getClosedNote(): string {
  const parts = [
    "This week\u2019s ordering window has closed.",
    "Sign up for menu reminders",
  ]

  if (launchConfig.giftComfortBoxesEnabled) {
    parts.push("request a future gift box")
  }

  if (launchConfig.littleExtrasEnabled) {
    parts.push("check out Little Extras on Friday")
  }

  if (parts.length === 2) {
    return `${parts[0]} ${parts[1]}.`
  }

  return `${parts[0]} ${parts.slice(1).join(", or ")}.`
}

export function getClosedOrderingFaqAnswer(): string {
  const intro =
    "You can sign up for menu reminders so you\u2019ll know the moment the next menu drops."

  const extras: string[] = []
  if (launchConfig.giftComfortBoxesEnabled) {
    extras.push("request a future gift box")
  }
  extras.push("ask about a custom order")
  if (launchConfig.littleExtrasEnabled) {
    extras.push("check if Little Extras are available on Friday")
  }

  if (extras.length === 1) {
    return `${intro} You can also ${extras[0]}.`
  }

  const last = extras[extras.length - 1]
  const rest = extras.slice(0, -1).join(", ")
  return `${intro} You can also ${rest}, or ${last}.`
}

export function getPublicFaqEntries(entries: FaqEntry[]): FaqEntry[] {
  return entries
    .filter((entry) => {
      if (!launchConfig.giftComfortBoxesEnabled && entry.question === FAQ_GIFT_TIERS) {
        return false
      }
      if (!launchConfig.littleExtrasEnabled && entry.question === FAQ_LITTLE_EXTRAS) {
        return false
      }
      return true
    })
    .map((entry) => {
      if (entry.question === FAQ_ORDERING_CLOSED) {
        return { ...entry, answer: getClosedOrderingFaqAnswer() }
      }
      return entry
    })
}

export function getHomepageFaqEntries(entries: FaqEntry[]): FaqEntry[] {
  const publicEntries = getPublicFaqEntries(entries)
  const picks = [publicEntries[0], publicEntries[1]]
  if (launchConfig.giftComfortBoxesEnabled) {
    const giftFaq = publicEntries.find((e) => e.question === FAQ_GIFT_TIERS)
    if (giftFaq) picks.push(giftFaq)
  }
  return picks.filter(Boolean) as FaqEntry[]
}

export function shouldShowTreatCategory(href: string): boolean {
  if (!launchConfig.giftComfortBoxesEnabled && href === GIFT_NAV_HREF) {
    return false
  }
  if (!launchConfig.littleExtrasEnabled && href === LITTLE_EXTRAS_NAV_HREF) {
    return false
  }
  return true
}
