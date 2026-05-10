import Divider from "@/components/ui/Divider"

const steps = [
  {
    icon: "🍪",
    title: "Choose your treats",
    description: "Browse cookies, bars, brownies, or pick a gift box.",
  },
  {
    icon: "💌",
    title: "Send an inquiry",
    description: "Fill out our simple order form with your details.",
  },
  {
    icon: "♡",
    title: "We confirm details",
    description: "The owner will reach out to finalize your order.",
  },
  {
    icon: "🏡",
    title: "Pickup or delivery",
    description: "Grab your fresh-baked treats or have them delivered.",
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-28">
        <div className="text-center mb-14">
          <p className="font-accent text-brown-sugar/60 text-lg mb-2">simple &amp; personal</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-espresso tracking-wide">
            How ordering works
          </h2>
          <Divider icon="dot" className="mt-4 mb-0" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
          {steps.map((step, i) => (
            <div
              key={i}
              className="text-center bg-warm-white rounded-2xl p-7 shadow-gentle border border-linen/30"
            >
              <div className="text-3xl mb-4">{step.icon}</div>
              <h3 className="font-heading text-lg text-espresso mb-2 tracking-wide">
                {step.title}
              </h3>
              <p className="text-brown-sugar/70 text-sm leading-relaxed font-body">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
