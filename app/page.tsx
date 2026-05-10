import Hero from "@/components/home/Hero"
import EmotionalSection from "@/components/home/EmotionalSection"
import TreatGrid from "@/components/home/TreatGrid"
import GiftSection from "@/components/home/GiftSection"
import FounderPreview from "@/components/home/FounderPreview"
import HowItWorks from "@/components/home/HowItWorks"
import RecentBakes from "@/components/home/RecentBakes"
import FaqTeaser from "@/components/home/FaqTeaser"
import FinalCta from "@/components/home/FinalCta"

export default function HomePage() {
  return (
    <>
      <Hero />
      <EmotionalSection />
      <TreatGrid />
      <GiftSection />
      <FounderPreview />
      <HowItWorks />
      <RecentBakes />
      <FaqTeaser />
      <FinalCta />
    </>
  )
}
