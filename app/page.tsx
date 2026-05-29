import Hero from "@/components/home/Hero"
import WildFlowerFundBanner from "@/components/home/WildFlowerFundBanner"
import ThisWeekMenuSpotlight from "@/components/home/ThisWeekMenuSpotlight"
import EmotionalSection from "@/components/home/EmotionalSection"
import GiftSection from "@/components/home/GiftSection"
import FounderPreview from "@/components/home/FounderPreview"
import WildFlowerFundSection from "@/components/home/WildFlowerFundSection"
import HowItWorks from "@/components/home/HowItWorks"
import FaqTeaser from "@/components/home/FaqTeaser"
import FinalCta from "@/components/home/FinalCta"

export default function HomePage() {
  return (
    <>
      <Hero />
      <WildFlowerFundBanner />
      <ThisWeekMenuSpotlight />
      <EmotionalSection />
      <GiftSection />
      <FounderPreview />
      <WildFlowerFundSection />
      <HowItWorks />
      <FaqTeaser />
      <FinalCta />
    </>
  )
}
