import type { Metadata } from "next"
import { littleExtras } from "@/lib/content/little-extras"
import { isWeeklyOrderingAcceptedAsync } from "@/lib/menu/ordering-gate"
import Button from "@/components/ui/Button"
import Divider from "@/components/ui/Divider"

export const metadata: Metadata = {
  title: "Little Extras | The Nurtured Oven",
  description:
    "Grab a Little Extras box on Fridays: leftover batches, test flavors, and beautifully imperfect treats at a friendly price. First paid, first claimed.",
}

export default async function LittleExtrasPage() {
  const orderingOpen = await isWeeklyOrderingAcceptedAsync()

  return (
    <div className="bg-cream">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-10 text-center">
        <p className="font-accent text-eyebrow text-lg mb-2">
          {littleExtras.tagline}
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-espresso tracking-wide">
          {littleExtras.headline}
        </h1>
        <Divider icon="heart" className="mt-4 mb-2" />
        <p className="text-muted text-lg font-body max-w-xl mx-auto leading-relaxed">
          {littleExtras.description}
        </p>
        <p className="mt-4 font-heading text-xl text-espresso">
          {littleExtras.priceLabel}
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-5 sm:px-8 lg:px-12 pb-12">
        <div className="bg-warm-white rounded-2xl p-6 sm:p-10 border border-linen/30 shadow-gentle">
          <h2 className="font-heading text-xl text-espresso tracking-wide mb-6">
            How it works
          </h2>
          <ol className="space-y-4">
            {littleExtras.howItWorks.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="shrink-0 w-7 h-7 rounded-full bg-oatmeal/70 text-espresso text-sm font-heading flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-muted text-base leading-relaxed font-body">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 sm:px-8 lg:px-12 pb-16 sm:pb-24 text-center">
        <p className="text-caption text-sm font-body leading-relaxed mb-8">
          {littleExtras.availabilityNote}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button href="/contact?intent=reminder" variant="outline">
            Get Menu Reminders
          </Button>
          {orderingOpen ? (
            <Button href="/contact?intent=weekly-order">
              Order This Week&apos;s Menu
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
