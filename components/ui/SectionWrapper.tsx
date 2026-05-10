type BgVariant = "cream" | "oatmeal" | "warm-white" | "espresso" | "none"

interface SectionWrapperProps {
  children: React.ReactNode
  bg?: BgVariant
  className?: string
  id?: string
  narrow?: boolean
}

const bgStyles: Record<BgVariant, string> = {
  cream: "bg-cream",
  oatmeal: "bg-oatmeal",
  "warm-white": "bg-warm-white",
  espresso: "bg-espresso text-cream",
  none: "",
}

export default function SectionWrapper({
  children,
  bg = "none",
  className = "",
  id,
  narrow = false,
}: SectionWrapperProps) {
  return (
    <section id={id} className={`${bgStyles[bg]} ${className}`}>
      <div
        className={`mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-28 ${narrow ? "max-w-3xl" : "max-w-7xl"}`}
      >
        {children}
      </div>
    </section>
  )
}
