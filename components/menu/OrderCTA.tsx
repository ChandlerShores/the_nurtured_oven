import Divider from "@/components/ui/Divider"
import MenuOrderButton from "@/components/menu/MenuOrderButton"
import type { CurrentMenu } from "@/lib/content/menu-types"
import { resolveOrderCtaHref } from "@/lib/menu/ordering"

interface OrderCTAProps {
  menu: CurrentMenu
}

export default function OrderCTA({ menu }: OrderCTAProps) {
  const orderHref = resolveOrderCtaHref(menu)

  return (
    <div className="bg-oatmeal/40">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20 text-center">
        <h2 className="font-heading text-2xl sm:text-3xl text-espresso tracking-wide">
          {menu.orderCta.heading}
        </h2>
        <Divider icon="heart" />
        <p className="text-brown-sugar/70 font-body text-lg">
          {menu.orderCta.openBody}
        </p>
        <div className="mt-6">
          <MenuOrderButton
            href={orderHref}
            orderingOpen
            size="lg"
          >
            {menu.orderCta.openButtonText}
          </MenuOrderButton>
        </div>
      </div>
    </div>
  )
}
