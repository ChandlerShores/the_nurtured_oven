import type { Metadata } from "next"
import Image from "next/image"
import { giftBoxes, giftingMoments } from "@/lib/content/gifts"
import Button from "@/components/ui/Button"
import Divider from "@/components/ui/Divider"

export const metadata: Metadata = {
  title: "Gift Boxes | The Nurtured Oven",
  description:
    "Send fresh-baked comfort to someone you love. Gift boxes for new moms, hard weeks, meal trains, birthdays, and everyday care.",
}

export default function GiftsPage() {
  return (
    <div className="bg-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-10 text-center">
        <p className="font-accent text-brown-sugar/60 text-lg mb-2">thoughtfully wrapped</p>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-espresso tracking-wide">
          Send something sweeter than flowers.
        </h1>
        <Divider icon="heart" className="mt-4 mb-2" />
        <p className="text-brown-sugar/70 text-lg font-body max-w-xl mx-auto leading-relaxed">
          A box of fresh-baked comfort, wrapped with care and ready to brighten
          someone&apos;s day.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {giftingMoments.map((m) => (
            <span
              key={m}
              className="bg-oatmeal/60 text-brown-sugar/70 text-sm px-4 py-1.5 rounded-full font-body border border-linen/40"
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-16 sm:pb-24 space-y-16 sm:space-y-24">
        {giftBoxes.map((box, i) => (
          <section key={box.slug}>
            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center ${
                i % 2 === 1 ? "lg:[direction:rtl] lg:[&>*]:[direction:ltr]" : ""
              }`}
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-warm">
                <Image
                  src={box.image}
                  alt={box.name}
                  fill
                  className={`object-cover ${box.imageClassName ?? ""}`}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              <div>
                <h2 className="font-heading text-2xl sm:text-3xl text-espresso mb-3 tracking-wide">
                  {box.name}
                </h2>
                <Divider icon="heart" className="my-4 justify-start [&::after]:hidden" />
                <p className="text-brown-sugar/70 text-lg leading-relaxed font-body mb-4">
                  {box.longDescription}
                </p>

                {box.occasions && (
                  <div className="mb-6">
                    <p className="text-sm text-brown-sugar/60 mb-2 tracking-wide">
                      Perfect for:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {box.occasions.map((o) => (
                        <span
                          key={o}
                          className="text-xs bg-oatmeal/50 text-brown-sugar/70 px-3 py-1 rounded-full border border-linen/30"
                        >
                          {o}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {box.startingPrice && (
                  <p className="text-sm text-brown-sugar/50 mb-4 font-body">
                    Starting at {box.startingPrice}
                  </p>
                )}

                <Button href={`/contact?item=${encodeURIComponent(box.name)}`}>
                  Request a {box.name}
                </Button>
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="bg-oatmeal/40">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl text-espresso tracking-wide">
            Not sure what to send?
          </h2>
          <Divider icon="heart" />
          <p className="text-brown-sugar/70 font-body text-lg leading-relaxed">
            Tell us about the person and the occasion, and we&apos;ll help you
            choose the perfect box.
          </p>
          <div className="mt-6">
            <Button href="/contact?item=Custom%20Gift%20Request" size="lg">
              Send a Custom Gift Request
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
