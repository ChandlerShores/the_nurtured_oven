import Link from "next/link"
import type { CurrentMenu } from "@/lib/content/menu-types"

interface OrderingStripProps {
  menu: Pick<CurrentMenu, "cutoffText" | "fulfillmentText">
}

export default function OrderingStrip({ menu }: OrderingStripProps) {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 pb-12">
      <div className="bg-oatmeal/40 border border-linen/40 rounded-2xl px-6 py-5 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-center sm:text-left">
        <div>
          <p className="font-heading text-base text-espresso tracking-wide">
            {menu.cutoffText}
          </p>
          <p className="text-caption text-sm font-body mt-1">
            {menu.fulfillmentText}
          </p>
        </div>
        <Link
          href="#order-cta"
          className="shrink-0 inline-flex items-center justify-center font-body font-semibold rounded-full bg-olive text-cream hover:bg-espresso shadow-gentle hover:shadow-warm transition-all duration-300 tracking-wide px-7 py-3 text-base"
        >
          How to order
        </Link>
      </div>
    </div>
  )
}
