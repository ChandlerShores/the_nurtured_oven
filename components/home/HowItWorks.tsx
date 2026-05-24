import Divider from "@/components/ui/Divider"

const steps = [
  {
    icon: "📋",
    title: "Saturday: menu drops",
    description: "We post the weekly menu every Saturday — follow along or sign up for reminders.",
  },
  {
    icon: "🛒",
    title: "Order by Wednesday noon",
    description: "Pick your items or grab a Weekly Comfort Box. Submit your order before the cutoff.",
  },
  {
    icon: "💳",
    title: "Pay to confirm",
    description: "We\u2019ll send a Square payment link. Your order is locked in once payment is received.",
  },
  {
    icon: "🏡",
    title: "Friday: pickup or delivery",
    description: "Grab your fresh-baked treats or have them delivered locally on Friday.",
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-28">
        <div className="text-center mb-14">
          <p className="font-accent text-brown-sugar/60 text-lg mb-2">simple &amp; weekly</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-espresso tracking-wide">
            How it works
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
