import Divider from "@/components/ui/Divider"
import Button from "@/components/ui/Button"
import type { CurrentMenu } from "@/lib/content/menu-types"
import { WEEKLY_ORDERING_CLOSED_MESSAGE } from "@/lib/menu/schedule"

interface ClosedMenuCTAProps {
  menu: Pick<CurrentMenu, "orderCta">
}

export default function ClosedMenuCTA({ menu }: ClosedMenuCTAProps) {
  return (
    <div className="bg-oatmeal/40">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20 text-center">
        <h2 className="font-heading text-2xl sm:text-3xl text-espresso tracking-wide">
          {menu.orderCta.heading}
        </h2>
        <Divider icon="heart" />
        <p className="text-muted font-body text-lg leading-relaxed">
          {WEEKLY_ORDERING_CLOSED_MESSAGE}
        </p>
        <div className="mt-6 flex justify-center">
          <Button href="/contact?intent=reminder" variant="outline" size="lg">
            Get next menu reminder
          </Button>
        </div>
      </div>
    </div>
  )
}
