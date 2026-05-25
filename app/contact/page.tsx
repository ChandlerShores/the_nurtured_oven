import { Suspense } from "react"
import ContactPageContent from "@/components/contact/ContactPageContent"
import { getOrderingPublicState } from "@/lib/menu/ordering-gate"

export default function ContactPage() {
  const ordering = getOrderingPublicState()

  return (
    <Suspense
      fallback={
        <div className="bg-cream min-h-[50vh] flex items-center justify-center text-caption font-body">
          Loading...
        </div>
      }
    >
      <ContactPageContent
        weeklyOrderingAvailable={ordering.weeklyOrderIntentAvailable}
        orderingClosedMessage={ordering.closedMessage}
      />
    </Suspense>
  )
}
