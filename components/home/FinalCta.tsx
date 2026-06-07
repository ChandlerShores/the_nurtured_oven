import Button from "@/components/ui/Button"
import Divider from "@/components/ui/Divider"
import { COMING_SOON_COPY } from "@/lib/content/coming-soon"
import { siteConfig } from "@/lib/content/site"

interface FinalCtaProps {
  orderingOpen: boolean
  comingSoon?: boolean
}

export default function FinalCta({
  orderingOpen,
  comingSoon = false,
}: FinalCtaProps) {
  return (
    <section className="bg-espresso">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12 sm:py-14 text-center">
        {comingSoon ? (
          <>
            <p className="font-accent text-cream/85 text-lg mb-2">
              {COMING_SOON_COPY.eyebrow}
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl text-cream leading-snug tracking-wide">
              The first online menu is almost here.
            </h2>
            <Divider
              icon="flourish"
              className="my-5 [&>svg]:text-cream/60 [&::before]:bg-cream/25 [&::after]:bg-cream/25"
            />
            <p className="text-cream/90 text-base sm:text-lg font-body leading-relaxed">
              Join the list for the first menu drop and grand opening note.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Button
                href="/contact?intent=reminder"
                size="lg"
                className="whitespace-nowrap"
              >
                {COMING_SOON_COPY.primaryCta}
              </Button>
              <Button
                href={siteConfig.social.instagram.url}
                variant="inverse"
                size="lg"
                className="whitespace-nowrap"
              >
                {COMING_SOON_COPY.secondaryCta}
              </Button>
            </div>
          </>
        ) : orderingOpen ? (
          <>
            <p className="font-accent text-cream/85 text-lg mb-2">
              don&apos;t miss this week
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl text-cream leading-snug tracking-wide">
              Orders close Wednesday at noon.
            </h2>
            <Divider
              icon="flourish"
              className="my-5 [&>svg]:text-cream/60 [&::before]:bg-cream/25 [&::after]:bg-cream/25"
            />
            <p className="text-cream/90 text-base sm:text-lg font-body leading-relaxed">
              Friday pickup is free. Local delivery is available in Georgetown
              &amp; Lexington.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Button href="/contact?intent=weekly-order" size="lg">
                {siteConfig.orderCta}
              </Button>
              <Button href="/menu" variant="inverse" size="lg">
                View menu
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="font-accent text-cream/85 text-lg mb-2">next drop</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-cream leading-snug tracking-wide">
              This week&apos;s orders are closed.
            </h2>
            <Divider
              icon="flourish"
              className="my-5 [&>svg]:text-cream/60 [&::before]:bg-cream/25 [&::after]:bg-cream/25"
            />
            <p className="text-cream/90 text-base sm:text-lg font-body leading-relaxed">
              The next menu opens Friday at 9 AM Eastern. Sign up for a reminder
              so you don&apos;t miss it.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Button href="/contact?intent=reminder" size="lg">
                Get next menu reminder
              </Button>
              <Button href="/menu" variant="inverse" size="lg">
                View menu
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
