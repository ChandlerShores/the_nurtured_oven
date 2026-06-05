import { siteConfig } from "@/lib/content/site"
import type { FaqEntry } from "@/lib/content/faq"
import type { ContactIntent } from "@/lib/contact/intents"
import { CONTACT_INTENT_IDS } from "@/lib/contact/intents"

export function getPublicNav() {
  return siteConfig.nav
}

/** Gift box page removed; keep API guard for legacy ?intent=gift links. */
export function isGiftContactIntentEnabled(): boolean {
  return false
}

export function getVisibleContactIntentIds(
  weeklyOrderingAvailable: boolean
): ContactIntent[] {
  return CONTACT_INTENT_IDS.filter((id) => {
    if (id === "gift") return false
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
  return "This week\u2019s ordering window has closed. Sign up for menu reminders."
}

export function getPublicFaqEntries(entries: FaqEntry[]): FaqEntry[] {
  return entries
}

export function getHomepageFaqEntries(entries: FaqEntry[]): FaqEntry[] {
  const publicEntries = getPublicFaqEntries(entries)
  return [publicEntries[0], publicEntries[1]].filter(Boolean) as FaqEntry[]
}
