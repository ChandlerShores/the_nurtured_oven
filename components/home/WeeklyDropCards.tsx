import Image from "next/image"
import Link from "next/link"
import type { HomepageDropItem } from "@/lib/content/homepage-menu"

interface WeeklyDropCardsProps {
  items: HomepageDropItem[]
  /** When false, cards are static (admin preview). Default true on the live site. */
  linkToMenu?: boolean
}

export default function WeeklyDropCards({
  items,
  linkToMenu = true,
}: WeeklyDropCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
      {items.map((item, idx) => {
        const card = (
          <>
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-oatmeal/30">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : null}
            </div>
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="inline-block bg-oatmeal/75 text-espresso/80 text-xs font-medium px-3 py-1 rounded-full tracking-wide uppercase">
                  {idx === 0 ? "featured" : item.roleLabel ?? "this week"}
                </span>
                {item.priceLabel ? (
                  <span className="shrink-0 rounded-full bg-espresso px-3 py-1 text-xs font-semibold font-body text-cream">
                    {item.priceLabel}
                  </span>
                ) : null}
              </div>
              <h3 className="font-heading text-xl sm:text-2xl text-espresso tracking-wide mb-2">
                {item.name}
              </h3>
              <p className="text-muted text-sm font-body leading-relaxed mb-5">
                {item.description}
              </p>
              {linkToMenu ? (
                <span className="mt-auto font-body text-sm font-semibold text-olive group-hover:text-espresso transition-colors">
                  Order this bake
                </span>
              ) : null}
            </div>
          </>
        )

        const className =
          "group flex h-full flex-col bg-warm-white rounded-2xl border border-linen/50 shadow-gentle overflow-hidden"

        if (linkToMenu) {
          return (
            <Link key={item.slug} href="/menu" className={className}>
              {card}
            </Link>
          )
        }

        return (
          <article key={item.slug} className={className}>
            {card}
          </article>
        )
      })}
    </div>
  )
}
