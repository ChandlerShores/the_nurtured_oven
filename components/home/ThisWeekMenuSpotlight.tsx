import Divider from "@/components/ui/Divider"
import Button from "@/components/ui/Button"
import WeeklyDropCards from "@/components/home/WeeklyDropCards"
import { getHomepageDropItems } from "@/lib/content/homepage-menu"
import type { CurrentMenu } from "@/lib/content/menu-types"
import { siteConfig } from "@/lib/content/site"

interface ThisWeekMenuSpotlightProps {
  menu: CurrentMenu
}

export default function ThisWeekMenuSpotlight({ menu }: ThisWeekMenuSpotlightProps) {
  const { cutoffText } = menu
  const homepageItems = getHomepageDropItems(menu)

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

        <WeeklyDropCards items={homepageItems} />

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
