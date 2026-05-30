import Image from "next/image"
import Button from "@/components/ui/Button"
import Divider from "@/components/ui/Divider"
import { launchConfig } from "@/lib/content/launch"

const moments = [
  "New moms",
  "Meal trains",
  "Thank-you gifts",
  "Birthdays",
  "Hard weeks",
  "Team appreciation",
]

export default function GiftSection() {
  if (!launchConfig.giftComfortBoxesEnabled) {
    return null
  }

  return (
    <section className="bg-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-warm order-2 lg:order-1">
            <Image
              src="/images/oatmeal_cookie_tulips.png"
              alt="Oatmeal cookie on a fluted plate with pink tulips"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="order-1 lg:order-2">
            <p className="font-accent text-eyebrow text-lg mb-2">beautifully boxed</p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] text-espresso leading-snug tracking-wide">
              Send something sweeter than flowers.
            </h2>
            <Divider icon="heart" className="my-5 justify-start [&::after]:hidden" />
            <p className="text-muted text-lg leading-relaxed font-body">
              Choose a Mini, Classic, or Gathering Comfort Box, filled with
              this week&apos;s best bakes, wrapped with care, and ready to
              brighten someone&apos;s day.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {moments.map((m) => (
                <span
                  key={m}
                  className="bg-oatmeal/70 text-muted text-sm px-4 py-1.5 rounded-full font-body border border-linen/50"
                >
                  {m}
                </span>
              ))}
            </div>

            <div className="mt-8">
              <Button href="/gifts" size="lg">
                Explore Comfort Boxes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
