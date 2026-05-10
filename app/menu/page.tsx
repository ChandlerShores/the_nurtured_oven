import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { menuCategories } from "@/lib/content/menu"
import Button from "@/components/ui/Button"
import Divider from "@/components/ui/Divider"

export const metadata: Metadata = {
  title: "Menu | The Nurtured Oven",
  description:
    "Browse small-batch cookies, bars, brownies, seasonal treats, and gift boxes from The Nurtured Oven.",
}

export default function MenuPage() {
  return (
    <div className="bg-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-10 text-center">
        <p className="font-accent text-brown-sugar/60 text-lg mb-2">made from scratch</p>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-espresso tracking-wide">
          What we bake
        </h1>
        <Divider icon="heart" className="mt-4 mb-2" />
        <p className="text-brown-sugar/70 text-lg font-body max-w-xl mx-auto leading-relaxed">
          Everything is made from scratch in small batches. Flavors rotate with
          the seasons — follow along on social media for the latest.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-16 sm:pb-24 space-y-20">
        {menuCategories.map((cat) => (
          <section key={cat.slug} id={cat.slug} className="scroll-mt-24">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
              <div className="lg:col-span-2 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-gentle">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>

              <div className="lg:col-span-3">
                <h2 className="font-heading text-2xl sm:text-3xl text-espresso mb-2 tracking-wide">
                  {cat.name}
                </h2>
                <p className="text-brown-sugar/70 font-body leading-relaxed mb-6">
                  {cat.description}
                </p>

                <div className="space-y-3">
                  {cat.items.map((item) => (
                    <div
                      key={item.slug}
                      className="bg-warm-white rounded-xl p-5 border border-linen/30 shadow-gentle"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-heading text-lg text-espresso tracking-wide">
                            {item.name}
                          </h3>
                          <p className="text-brown-sugar/60 text-sm mt-1 leading-relaxed font-body">
                            {item.description}
                          </p>
                          {item.allergenTags && item.allergenTags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
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
                        </div>
                        <div className="text-right shrink-0">
                          {item.price && (
                            <span className="text-sm text-brown-sugar/50 font-body block mb-2">
                              {item.price}
                            </span>
                          )}
                          <Link
                            href={`/contact?item=${encodeURIComponent(item.name)}`}
                            className="text-sm text-brown-sugar/70 hover:text-espresso underline underline-offset-4 decoration-linen hover:decoration-brown-sugar transition-colors whitespace-nowrap"
                          >
                            Request this treat
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="bg-oatmeal/40">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl text-espresso tracking-wide">
            Something catch your eye?
          </h2>
          <Divider icon="heart" />
          <p className="text-brown-sugar/70 font-body text-lg">
            Send us an order inquiry and we&apos;ll take care of the rest.
          </p>
          <div className="mt-6">
            <Button href="/contact" size="lg">
              Request an Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
