import Hero from "@/components/home/Hero"
import ThisWeekMenuSpotlight from "@/components/home/ThisWeekMenuSpotlight"
import HowItWorks from "@/components/home/HowItWorks"
import WildFlowerFundBanner from "@/components/home/WildFlowerFundBanner"
import FounderPreview from "@/components/home/FounderPreview"
import FinalCta from "@/components/home/FinalCta"
import { getCurrentMenu } from "@/lib/content/load-menu"
import { getOrderingPublicStateAsync } from "@/lib/menu/ordering-gate"

export default async function HomePage() {
  const menu = await getCurrentMenu()
  const ordering = await getOrderingPublicStateAsync()
  const orderingOpen = ordering.isOpen
  const closedMessage = ordering.closedMessage

  return (
    <>
      <Hero
        featured={menu.featured}
        orderingOpen={orderingOpen}
        closedMessage={closedMessage}
        comingSoon={ordering.comingSoon}
      />
      <ThisWeekMenuSpotlight
        menu={menu}
        orderingOpen={orderingOpen}
        comingSoon={ordering.comingSoon}
      />
      <HowItWorks />
      <FounderPreview />
      <WildFlowerFundBanner />
      <FinalCta orderingOpen={orderingOpen} comingSoon={ordering.comingSoon} />
    </>
  )
}
