import Button from "@/components/ui/Button"
import Divider from "@/components/ui/Divider"
import { siteConfig } from "@/lib/content/site"

export default function FinalCta() {
  return (
    <section className="bg-oatmeal/40">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-14 sm:py-16 text-center">
        <p className="font-accent text-eyebrow text-lg mb-2">don&apos;t miss this week</p>
        <h2 className="font-heading text-3xl sm:text-4xl text-espresso leading-snug tracking-wide">
          Ready to order?
        </h2>
        <Divider icon="flourish" className="my-5" />
        <p className="text-muted text-base sm:text-lg font-body leading-relaxed">
          Order by Wednesday at noon for free Friday pickup or local delivery in
          Georgetown &amp; Lexington.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Button href="/contact?intent=weekly-order" size="lg">
            {siteConfig.orderCta}
          </Button>
          <Button href="/menu" variant="outline" size="lg">
            View menu
          </Button>
        </div>
      </div>
    </section>
  )
}
