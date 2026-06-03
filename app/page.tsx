import Hero from "@/components/home/Hero"
import ThisWeekMenuSpotlight from "@/components/home/ThisWeekMenuSpotlight"
import HowItWorks from "@/components/home/HowItWorks"
import WildFlowerFundBanner from "@/components/home/WildFlowerFundBanner"
import FounderPreview from "@/components/home/FounderPreview"
import FinalCta from "@/components/home/FinalCta"
import { getCurrentMenu } from "@/lib/content/load-menu"

export default async function HomePage() {
  const menu = await getCurrentMenu()

  return (
    <>
      <Hero featured={menu.featured} />
      <ThisWeekMenuSpotlight menu={menu} />
      <HowItWorks />
      <FounderPreview />
      <WildFlowerFundBanner />
      <FinalCta />
    </>
  )
}
