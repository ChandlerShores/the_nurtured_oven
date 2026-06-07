import Divider from "@/components/ui/Divider"
import Button from "@/components/ui/Button"
import { COMING_SOON_COPY } from "@/lib/content/coming-soon"
import { siteConfig } from "@/lib/content/site"
import type { CurrentMenu } from "@/lib/content/menu-types"
import { WEEKLY_ORDERING_CLOSED_MESSAGE } from "@/lib/menu/schedule"

interface ClosedMenuCTAProps {
  menu: Pick<CurrentMenu, "orderCta">
  comingSoon?: boolean
}

export default function ClosedMenuCTA({
  menu,
  comingSoon = false,
}: ClosedMenuCTAProps) {
  return (
    <div className="bg-oatmeal/40">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20 text-center">
        <h2 className="font-heading text-2xl sm:text-3xl text-espresso tracking-wide">
          {comingSoon ? COMING_SOON_COPY.eyebrow : menu.orderCta.heading}
        </h2>
        <Divider icon="heart" />
        <p className="text-muted font-body text-lg leading-relaxed">
          {comingSoon ? COMING_SOON_COPY.body : WEEKLY_ORDERING_CLOSED_MESSAGE}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <Button
            href="/contact?intent=reminder"
            variant={comingSoon ? "primary" : "outline"}
            size="lg"
            className="whitespace-nowrap"
          >
            {comingSoon ? COMING_SOON_COPY.primaryCta : "Get next menu reminder"}
          </Button>
          {comingSoon && (
            <Button
              href={siteConfig.social.instagram.url}
              variant="outline"
              size="lg"
              className="whitespace-nowrap"
            >
              {COMING_SOON_COPY.secondaryCta}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
