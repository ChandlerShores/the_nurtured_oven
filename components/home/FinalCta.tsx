import Button from "@/components/ui/Button"
import Divider from "@/components/ui/Divider"
import { siteConfig } from "@/lib/content/site"

export default function FinalCta() {
  return (
    <section className="bg-espresso">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12 sm:py-14 text-center">
        <p className="font-accent text-cream/85 text-lg mb-2">don&apos;t miss this week</p>
        <h2 className="font-heading text-3xl sm:text-4xl text-cream leading-snug tracking-wide">
          Orders close Wednesday at noon.
        </h2>
        <Divider
          icon="flourish"
          className="my-5 [&>svg]:text-cream/60 [&::before]:bg-cream/25 [&::after]:bg-cream/25"
        />
        <p className="text-cream/90 text-base sm:text-lg font-body leading-relaxed">
          Friday pickup is free. Local delivery is available in Georgetown &amp;
          Lexington.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Button href="/contact?intent=weekly-order" size="lg">
            {siteConfig.orderCta}
          </Button>
          <Button href="/menu" variant="inverse" size="lg">
            View menu
          </Button>
        </div>
      </div>
    </section>
  )
}
