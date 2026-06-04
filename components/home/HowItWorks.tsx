import Divider from "@/components/ui/Divider"

const steps = [
  {
    title: "Friday: menu drops",
    description: "We post the weekly menu every Friday.",
  },
  {
    title: "Order by Wednesday noon",
    description: "Choose from this week's bakes and submit before the cutoff.",
  },
  {
    title: "Pay to confirm",
    description: "Pay securely with Square. Your order locks in once payment is received.",
  },
  {
    title: "Friday: pickup or delivery",
    description:
      "Free pickup, or local delivery in Georgetown & Lexington (from $7; your fee shows at checkout).",
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-oatmeal/55 border-y border-linen/35">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-10">
          <p className="font-accent text-eyebrow text-lg mb-2">simple &amp; weekly</p>
          <h2 className="font-heading text-2xl sm:text-3xl text-espresso tracking-wide">
            How it works
          </h2>
          <Divider icon="flourish" className="mt-4 mb-0" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {steps.map((step, i) => (
            <div
              key={i}
              className="bg-cream rounded-xl border border-brown-sugar/20 p-5 sm:p-6 text-center shadow-gentle"
            >
              <p className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-olive text-sm font-semibold font-body text-cream">
                {i + 1}
              </p>
              <h3 className="font-heading text-base sm:text-lg text-espresso tracking-wide mb-2 min-h-[2.75rem] flex items-center justify-center">
                {step.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed font-body">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
