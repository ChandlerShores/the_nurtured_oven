import Divider from "@/components/ui/Divider"

const steps = [
  {
    icon: "📋",
    title: "Friday: menu drops",
    description: "We post the weekly menu every Friday. Follow along or sign up for reminders.",
  },
  {
    icon: "🛒",
    title: "Order by Wednesday noon",
    description: "Choose from this week's menu items. Submit your order before the cutoff.",
  },
  {
    icon: "💳",
    title: "Pay to confirm",
    description: "Pay securely with Square at checkout. Your order is locked in once payment is received.",
  },
  {
    icon: "🏡",
    title: "Friday: pickup or delivery",
    description:
      "Free pickup, or local delivery in Georgetown & Lexington ($7, free on orders $40+).",
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-28">
        <div className="text-center mb-14">
          <p className="font-accent text-eyebrow text-lg mb-2">simple &amp; weekly</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-espresso tracking-wide">
            How it works
          </h2>
          <Divider icon="dot" className="mt-4 mb-0" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5 items-stretch">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex h-full flex-col items-center text-center bg-warm-white rounded-2xl p-6 sm:p-7 shadow-gentle border border-linen/30"
            >
              <div className="flex h-10 shrink-0 items-center justify-center text-3xl leading-none mb-4">
                {step.icon}
              </div>
              <h3 className="font-heading text-lg text-espresso tracking-wide min-h-[3.25rem] flex items-center justify-center mb-2 px-1">
                {step.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed font-body w-full">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
