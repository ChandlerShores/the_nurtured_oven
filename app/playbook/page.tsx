import type { Metadata } from "next"
import Link from "next/link"
import { playbook } from "@/lib/content/playbook"
import Divider from "@/components/ui/Divider"

export const metadata: Metadata = {
  title: "Owner Playbook | The Nurtured Oven",
  description: "A clear guide to how The Nurtured Oven works — weekly rhythm, products, pricing, and operations.",
  robots: { index: false, follow: false },
}

export default function PlaybookPage() {
  return (
    <div className="bg-cream">
      <section className="bg-espresso text-cream">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center">
          <p className="font-accent text-cream/60 text-lg mb-3">owner playbook</p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-wide leading-snug">
            {playbook.headline}
          </h1>
          <Divider icon="heart" className="my-6 [&>svg]:text-blush/50 [&::before]:bg-cream/15 [&::after]:bg-cream/15" />
          <p className="text-cream/80 text-lg sm:text-xl font-body leading-relaxed max-w-2xl mx-auto italic">
            &ldquo;{playbook.tagline}&rdquo;
          </p>
          <p className="mt-6 text-cream/60 text-base font-body leading-relaxed max-w-2xl mx-auto">
            {playbook.oneLiner}
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-warm-white rounded-2xl p-7 border border-linen/40 shadow-gentle">
            <h2 className="font-heading text-xl text-espresso mb-4 tracking-wide">Not this</h2>
            <ul className="space-y-3">
              {playbook.notThis.map((item) => (
                <li key={item} className="flex gap-3 text-brown-sugar/70 font-body text-sm leading-relaxed">
                  <span className="text-blush shrink-0">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-olive/10 rounded-2xl p-7 border border-sage/30 shadow-gentle">
            <h2 className="font-heading text-xl text-espresso mb-4 tracking-wide">This is your model</h2>
            <ul className="space-y-3">
              {playbook.thisIs.map((item) => (
                <li key={item} className="flex gap-3 text-brown-sugar/80 font-body text-sm leading-relaxed">
                  <span className="text-olive shrink-0">♡</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-oatmeal/40">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20">
          <div className="text-center mb-12">
            <p className="font-accent text-brown-sugar/60 text-lg mb-2">what you sell</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-espresso tracking-wide">Five product lanes</h2>
            <Divider icon="dot" className="mt-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {playbook.products.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl p-6 border shadow-gentle ${
                  p.featured
                    ? "bg-espresso text-cream border-espresso sm:col-span-2"
                    : "bg-warm-white border-linen/40"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl shrink-0">{p.icon}</span>
                  <div>
                    <p className={`text-xs uppercase tracking-[0.15em] mb-1 ${p.featured ? "text-cream/50" : "text-brown-sugar/50"}`}>
                      {p.role}
                    </p>
                    <h3 className={`font-heading text-xl tracking-wide mb-2 ${p.featured ? "text-cream" : "text-espresso"}`}>
                      {p.name}
                      {p.featured && (
                        <span className="ml-2 text-xs font-body bg-warm-honey/30 text-warm-honey px-2 py-0.5 rounded-full align-middle">
                          Hero
                        </span>
                      )}
                    </h3>
                    <p className={`text-sm leading-relaxed font-body ${p.featured ? "text-cream/75" : "text-brown-sugar/70"}`}>
                      {p.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="text-center mb-12">
          <p className="font-accent text-brown-sugar/60 text-lg mb-2">the heartbeat</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-espresso tracking-wide">Your week, at a glance</h2>
          <Divider icon="heart" className="mt-4" />
          <p className="mt-4 text-brown-sugar/70 font-body max-w-lg mx-auto">{playbook.coreCta}</p>
        </div>

        <div className="space-y-3">
          {playbook.weekRhythm.map((row, i) => (
            <div
              key={row.day}
              className="grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr] gap-3 sm:gap-6 items-start bg-warm-white rounded-xl p-5 border border-linen/30 shadow-gentle"
            >
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-oatmeal text-espresso text-xs font-heading flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="font-heading text-espresso tracking-wide">{row.day}</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-brown-sugar/50 mb-1">Customers</p>
                <p className="text-sm text-brown-sugar/80 font-body">{row.customer}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-brown-sugar/50 mb-1">You</p>
                <p className="text-sm text-brown-sugar/80 font-body">{row.you}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-sage/15 rounded-2xl p-6 border border-sage/25">
          <h3 className="font-heading text-lg text-espresso mb-3 tracking-wide">
            When ordering is closed, the site still works
          </h3>
          <ul className="space-y-2">
            {playbook.whenClosed.map((item) => (
              <li key={item} className="text-sm text-brown-sugar/75 font-body flex gap-2">
                <span className="text-olive">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-warm-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h2 className="font-heading text-2xl text-espresso mb-6 tracking-wide">How an order moves</h2>
              <ol className="space-y-4">
                {playbook.orderFlow.map((step, i) => (
                  <li key={step} className="flex gap-4">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-olive text-cream text-sm font-heading flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-brown-sugar/80 font-body text-sm leading-relaxed pt-1">{step}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-sm font-heading text-espresso bg-blush/15 rounded-xl px-4 py-3 border border-blush/25">
                Orders are confirmed once payment is received.
              </p>
            </div>
            <div>
              <h2 className="font-heading text-2xl text-espresso mb-6 tracking-wide">Your three tools</h2>
              <div className="space-y-4">
                {playbook.tools.map((t) => (
                  <div key={t.name} className="bg-cream rounded-xl p-5 border border-linen/30">
                    <h3 className="font-heading text-lg text-espresso tracking-wide">{t.name}</h3>
                    <p className="text-brown-sugar/70 text-sm font-body mt-1">{t.job}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl text-espresso tracking-wide">Pricing guide</h2>
          <Divider icon="dot" className="mt-4" />
        </div>
        <div className="overflow-hidden rounded-2xl border border-linen/40 shadow-gentle">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-oatmeal/60 text-left">
                <th className="px-5 py-3 font-heading text-espresso tracking-wide">Product</th>
                <th className="px-5 py-3 font-heading text-espresso tracking-wide">Range</th>
                <th className="px-5 py-3 font-heading text-espresso tracking-wide hidden sm:table-cell">Note</th>
              </tr>
            </thead>
            <tbody>
              {playbook.pricingTargets.map((row, i) => (
                <tr key={row.item} className={i % 2 === 0 ? "bg-warm-white" : "bg-cream/50"}>
                  <td className="px-5 py-3 text-espresso">{row.item}</td>
                  <td className="px-5 py-3 text-olive font-medium">{row.range}</td>
                  <td className="px-5 py-3 text-brown-sugar/60 hidden sm:table-cell">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-center text-brown-sugar/60 text-sm font-body">{playbook.pricingRule}</p>
        <p className="mt-6 text-center text-brown-sugar/70 font-body text-sm bg-oatmeal/30 rounded-xl px-5 py-4 border border-linen/30">
          {playbook.launchCapacity}
        </p>
      </section>

      <section className="bg-oatmeal/30">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h2 className="font-heading text-2xl text-espresso mb-6 tracking-wide">Social rhythm</h2>
              <div className="space-y-2">
                {playbook.marketingRhythm.map((row) => (
                  <div key={row.day} className="flex justify-between gap-4 bg-warm-white rounded-lg px-4 py-3 border border-linen/30 text-sm">
                    <span className="font-heading text-espresso">{row.day}</span>
                    <span className="text-brown-sugar/70 font-body text-right">{row.post}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-heading text-2xl text-espresso mb-6 tracking-wide">Launch path</h2>
              <div className="space-y-4">
                {playbook.phases.map((p) => (
                  <div key={p.phase} className="bg-warm-white rounded-xl p-5 border border-linen/30">
                    <p className="text-xs uppercase tracking-wide text-warm-honey mb-1">{p.phase}</p>
                    <h3 className="font-heading text-lg text-espresso tracking-wide">{p.title}</h3>
                    <p className="text-brown-sugar/70 text-sm font-body mt-2 leading-relaxed">{p.items}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl text-espresso tracking-wide">Golden rules</h2>
          <Divider icon="heart" className="mt-4" />
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {playbook.goldenRules.map((rule) => (
            <li
              key={rule}
              className="bg-warm-white rounded-xl px-5 py-4 border border-linen/30 text-sm text-brown-sugar/80 font-body leading-relaxed flex gap-3"
            >
              <span className="text-blush shrink-0">♡</span>
              {rule}
            </li>
          ))}
        </ul>

        <div className="mt-12 bg-espresso rounded-2xl p-8 sm:p-10 text-center">
          <h3 className="font-heading text-xl text-cream tracking-wide mb-4">Ask yourself every Friday</h3>
          <ul className="space-y-2 max-w-md mx-auto">
            {playbook.weeklyQuestions.map((q) => (
              <li key={q} className="text-cream/70 text-sm font-body">{q}</li>
            ))}
          </ul>
        </div>

        <p className="mt-10 text-center">
          <Link
            href="/"
            className="text-olive hover:text-espresso text-sm font-body underline underline-offset-4 decoration-linen hover:decoration-olive transition-colors"
          >
            ← Back to the website
          </Link>
        </p>
      </section>
    </div>
  )
}
