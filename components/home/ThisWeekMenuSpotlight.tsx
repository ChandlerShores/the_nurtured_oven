import Image from "next/image"
import Link from "next/link"
import Divider from "@/components/ui/Divider"
import Button from "@/components/ui/Button"
import { currentMenu } from "@/lib/content/currentMenu"
import { siteConfig } from "@/lib/content/site"

const homepageProductCopy: Record<string, string> = {
  "cinnamon-rolls":
    "Soft rolls, warm cinnamon, and homemade frosting. Built for slow Friday mornings.",
  "oatmeal-cookie":
    "A familiar, buttery oatmeal cookie with the kind of comfort that tastes homemade because it is.",
  "marshmallow-cloud-bar":
    "A soft, nostalgic bar with marshmallow sweetness and a playful cloud-like bite.",
}

export default function ThisWeekMenuSpotlight() {
  const { featured, items, cutoffText } = currentMenu
  const homepageItems = [featured, ...items].slice(0, 3)

  return (
    <section className="relative z-10 -mt-5 bg-cream border-b border-linen/30">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-8 sm:mb-10">
          <p className="font-accent text-eyebrow text-lg mb-2">fresh from the oven</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-espresso tracking-wide">
            The weekly drop
          </h2>
          <Divider icon="flourish" className="mt-4 mb-3" />
          <p className="text-muted text-sm sm:text-base font-body max-w-xl mx-auto leading-relaxed">
            {cutoffText}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {homepageItems.map((item, idx) => (
            <Link
              key={item.slug}
              href="/menu"
              className="group flex h-full flex-col bg-warm-white rounded-2xl border border-linen/50 shadow-gentle overflow-hidden"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-oatmeal/30">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <span className="inline-block bg-oatmeal/75 text-espresso/80 text-xs font-medium px-3 py-1 rounded-full tracking-wide uppercase">
                    {idx === 0 ? "featured" : item.roleLabel ?? "this week"}
                  </span>
                  {item.priceLabel && (
                    <span className="shrink-0 rounded-full bg-espresso px-3 py-1 text-xs font-semibold font-body text-cream">
                      {item.priceLabel}
                    </span>
                  )}
                </div>
                <h3 className="font-heading text-xl sm:text-2xl text-espresso tracking-wide mb-2">
                  {item.name}
                </h3>
                <p className="text-muted text-sm font-body leading-relaxed mb-5">
                  {homepageProductCopy[item.slug] ?? item.description}
                </p>
                <span className="mt-auto font-body text-sm font-semibold text-olive group-hover:text-espresso transition-colors">
                  Order this bake
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button href="/contact?intent=weekly-order" size="lg">
            {siteConfig.orderCta}
          </Button>
          <Button href="/menu" variant="outline" size="lg">
            See the full menu
          </Button>
        </div>
      </div>
    </section>
  )
}
