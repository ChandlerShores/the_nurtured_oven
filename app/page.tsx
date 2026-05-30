import Hero from "@/components/home/Hero"
import ThisWeekMenuSpotlight from "@/components/home/ThisWeekMenuSpotlight"
import HowItWorks from "@/components/home/HowItWorks"
import WildFlowerFundBanner from "@/components/home/WildFlowerFundBanner"
import FounderPreview from "@/components/home/FounderPreview"
import FinalCta from "@/components/home/FinalCta"

export default function HomePage() {
  return (
    <>
      <Hero />
      <ThisWeekMenuSpotlight />
      <HowItWorks />
      <FounderPreview />
      <WildFlowerFundBanner />
      <FinalCta />
    </>
  )
}
