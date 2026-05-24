import type { Metadata } from "next"
import Image from "next/image"
import { weeklyMenu } from "@/lib/content/menu"
import { availability } from "@/lib/content/availability"
import Button from "@/components/ui/Button"
import Divider from "@/components/ui/Divider"

export const metadata: Metadata = {
  title: "This Week's Menu | The Nurtured Oven",
  description:
    "Order this week's small-batch comfort sweets. Cookies, bars, brownies, and the Weekly Comfort Box — order by Wednesday for Friday pickup or delivery.",
}

export default function MenuPage() {
  return (
    <div className="bg-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-10 text-center">
        <p className="font-accent text-brown-sugar/60 text-lg mb-2">made fresh every week</p>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-espresso tracking-wide">
          {weeklyMenu.weekLabel}
        </h1>
        <Divider icon="heart" className="mt-4 mb-2" />
        <p className="text-brown-sugar/70 text-lg font-body max-w-xl mx-auto leading-relaxed">
          {weeklyMenu.cutoffNote}
        </p>
        <p className="mt-2 text-brown-sugar/50 text-sm font-body">
          {weeklyMenu.fulfillmentDate}
        </p>
      </div>

      {/* Weekly Comfort Box — hero product */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-12">
        <div className="bg-warm-white rounded-2xl border border-linen/30 shadow-warm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-10">
            <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[320px] overflow-hidden">
              <Image
                src={weeklyMenu.comfortBox.image}
                alt={weeklyMenu.comfortBox.name}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>
            <div className="p-8 sm:p-10 lg:pl-2 lg:pr-12 flex flex-col justify-center">
              <span className="inline-block bg-blush/20 text-blush text-xs font-medium px-3 py-1 rounded-full w-fit mb-4 tracking-wide">
                Featured
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl text-espresso tracking-wide mb-3">
                {weeklyMenu.comfortBox.name}
              </h2>
              <p className="text-brown-sugar/70 text-lg leading-relaxed font-body mb-2">
                {weeklyMenu.comfortBox.description}
              </p>
              <p className="text-brown-sugar/50 text-sm font-body mb-1">
                {weeklyMenu.comfortBox.includes}
              </p>
              <p className="font-heading text-xl text-espresso mt-4 mb-6">
                {weeklyMenu.comfortBox.priceLabel}
              </p>
              <div>
                <Button href="/contact?item=Weekly+Comfort+Box" size="lg">
                  Order a Comfort Box
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual items */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-16 sm:pb-24">
        <h2 className="font-heading text-2xl sm:text-3xl text-espresso tracking-wide text-center mb-2">
          Also available this week
        </h2>
        <Divider icon="dot" className="mt-2 mb-10" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {weeklyMenu.items.map((item) => (
            <div
              key={item.slug}
              className="bg-warm-white rounded-xl p-6 border border-linen/30 shadow-gentle flex flex-col"
            >
              <h3 className="font-heading text-lg text-espresso tracking-wide mb-2">
                {item.name}
              </h3>
              <p className="text-brown-sugar/60 text-sm leading-relaxed font-body flex-1">
                {item.description}
              </p>
              {item.allergenTags && item.allergenTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.allergenTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-oatmeal/60 text-brown-sugar/70 px-2.5 py-0.5 rounded-full border border-linen/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="font-heading text-base text-espresso mt-4">
                {item.priceLabel}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Order CTA */}
      <div className="bg-oatmeal/40">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl text-espresso tracking-wide">
            Ready to order?
          </h2>
          <Divider icon="heart" />
          <p className="text-brown-sugar/70 font-body text-lg">
            {availability.orderingOpen
              ? "Place your order by Wednesday at noon. We\u2019ll send a Square payment link to confirm."
              : availability.closedNote}
          </p>
          <div className="mt-6">
            <Button href="/contact?intent=weekly-order" size="lg">
              Place My Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
