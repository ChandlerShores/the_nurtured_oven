import { COMING_SOON_COPY } from "@/lib/content/coming-soon"
import { isComingSoonMode } from "@/lib/server/coming-soon-mode"

export function getCheckoutBlockedMessage(): string | null {
  if (isComingSoonMode()) {
    return COMING_SOON_COPY.checkoutMessage
  }

  return null
}
