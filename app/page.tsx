import Hero from "@/components/home/Hero"
import ThisWeekMenuSpotlight from "@/components/home/ThisWeekMenuSpotlight"
import HowItWorks from "@/components/home/HowItWorks"
import WildFlowerFundBanner from "@/components/home/WildFlowerFundBanner"
import FounderPreview from "@/components/home/FounderPreview"
import FinalCta from "@/components/home/FinalCta"
import { getCurrentMenu } from "@/lib/content/load-menu"
import {
  getDisabledOrderMessageAsync,
  isMenuOpenAsync,
} from "@/lib/menu/ordering"

export default async function HomePage() {
  const menu = await getCurrentMenu()
  const orderingOpen = await isMenuOpenAsync()
  const closedMessage = orderingOpen
    ? ""
    : await getDisabledOrderMessageAsync()

  return (
    <>
      <Hero
        featured={menu.featured}
        orderingOpen={orderingOpen}
        closedMessage={closedMessage}
      />
      <ThisWeekMenuSpotlight menu={menu} orderingOpen={orderingOpen} />
      <HowItWorks />
      <FounderPreview />
      <WildFlowerFundBanner />
      <FinalCta orderingOpen={orderingOpen} />
    </>
  )
}
