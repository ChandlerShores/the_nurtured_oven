import { playbook } from "@/lib/content/playbook"
import PlaybookToolbar from "@/components/playbook/PlaybookToolbar"

function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow?: string
  title: string
}) {
  return (
    <header className="mb-5">
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.12em] text-caption font-body mb-1">
          {eyebrow}
        </p>
      )}
      <h2 className="font-heading text-2xl text-espresso tracking-wide border-b border-linen/50 pb-2">
        {title}
      </h2>
    </header>
  )
}

export default function PlaybookDocument() {
  const printedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <>
      <PlaybookToolbar />

      <article className="max-w-3xl mx-auto">
        {/* Page 1 - Cover */}
        <section className="playbook-page playbook-avoid-break mb-12">
          <div className="playbook-cover-band rounded-xl px-6 py-10 sm:py-12 text-center mb-8">
            <p className="font-accent text-cream/70 text-lg mb-2">The Nurtured Oven</p>
            <h1 className="font-heading text-3xl sm:text-4xl tracking-wide text-cream leading-snug">
              Owner Playbook
            </h1>
            <p className="mt-4 text-cream/85 text-lg font-body italic max-w-md mx-auto">
              &ldquo;{playbook.tagline}&rdquo;
            </p>
          </div>

          <h2 className="font-heading text-xl text-espresso mb-3 tracking-wide">
            {playbook.headline}
          </h2>
          <p className="text-muted font-body leading-relaxed mb-8">
            {playbook.oneLiner}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="playbook-muted-box rounded-lg playbook-avoid-break">
              <h3 className="font-heading text-base text-espresso mb-2">Not this</h3>
              <ul className="space-y-1.5 text-sm font-body text-muted list-disc pl-4">
                {playbook.notThis.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="playbook-muted-box rounded-lg playbook-avoid-break border-olive/30">
              <h3 className="font-heading text-base text-espresso mb-2">This is your model</h3>
              <ul className="space-y-1.5 text-sm font-body text-muted list-disc pl-4">
                {playbook.thisIs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="playbook-no-print mt-8 text-xs text-caption font-body text-center">
            Prepared {printedDate}. Print this page or the full document as PDF.
          </p>
        </section>

        {/* Page 2 - Products */}
        <section className="playbook-page mb-12">
          <SectionTitle eyebrow="What you sell" title="Five product lanes" />
          <div className="space-y-4">
            {playbook.products.map((p) => (
              <div
                key={p.name}
                className={`playbook-avoid-break rounded-lg border px-4 py-3 ${
                  p.featured
                    ? "border-espresso/40 bg-oatmeal/40"
                    : "border-linen/50 bg-warm-white/80"
                }`}
              >
                <p className="text-xs uppercase tracking-wide text-caption font-body">
                  {p.role}
                  {p.featured ? " · Hero product" : ""}
                </p>
                <h3 className="font-heading text-lg text-espresso tracking-wide mt-0.5">
                  {p.name}
                </h3>
                <p className="text-sm text-muted-sm font-body mt-1 leading-relaxed">
                  {p.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Page 3 - Weekly rhythm */}
        <section className="playbook-page mb-12">
          <SectionTitle eyebrow="The heartbeat" title="Your week, at a glance" />
          <p className="text-sm font-body text-muted-sm mb-4 -mt-2">
            {playbook.coreCta}
          </p>

          <table className="playbook-table w-full text-sm font-body mb-6">
            <thead>
              <tr>
                <th className="w-[22%]">Day</th>
                <th className="w-[39%]">Customers</th>
                <th className="w-[39%]">You</th>
              </tr>
            </thead>
            <tbody>
              {playbook.weekRhythm.map((row) => (
                <tr key={row.day}>
                  <td className="font-heading text-espresso">{row.day}</td>
                  <td>{row.customer}</td>
                  <td>{row.you}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="playbook-muted-box rounded-lg playbook-avoid-break">
            <h3 className="font-heading text-base text-espresso mb-2">
              When ordering is closed, the site still works
            </h3>
            <ul className="text-sm font-body text-muted list-disc pl-4 space-y-1">
              {playbook.whenClosed.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Page 4 - Operations */}
        <section className="playbook-page mb-12">
          <SectionTitle title="How an order moves" />
          <ol className="list-decimal pl-5 space-y-2 text-sm font-body text-muted mb-8">
            {playbook.orderFlow.map((step) => (
              <li key={step} className="pl-1 leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
          <p className="text-sm font-heading text-espresso playbook-muted-box rounded-lg mb-8">
            Orders are confirmed once payment is received.
          </p>

          <SectionTitle title="Your three tools" />
          <table className="playbook-table w-full text-sm font-body">
            <thead>
              <tr>
                <th className="w-[28%]">Tool</th>
                <th>Job</th>
              </tr>
            </thead>
            <tbody>
              {playbook.tools.map((t) => (
                <tr key={t.name}>
                  <td className="font-heading text-espresso">{t.name}</td>
                  <td>{t.job}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Page 5 - Pricing */}
        <section className="playbook-page mb-12">
          <SectionTitle title="Pricing guide" />
          <table className="playbook-table w-full text-sm font-body mb-4">
            <thead>
              <tr>
                <th>Product</th>
                <th className="w-[22%]">Range</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {playbook.pricingTargets.map((row) => (
                <tr key={row.item}>
                  <td className="text-espresso">{row.item}</td>
                  <td className="font-medium">{row.range}</td>
                  <td className="text-muted-sm">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-sm font-body text-muted-sm mb-4">{playbook.pricingRule}</p>
          <p className="text-sm font-body text-muted playbook-muted-box rounded-lg">
            {playbook.launchCapacity}
          </p>
        </section>

        {/* Page 6 - Marketing & launch */}
        <section className="playbook-page mb-12">
          <div className="grid grid-cols-1 gap-8">
            <div>
              <SectionTitle title="Social rhythm" />
              <table className="playbook-table w-full text-sm font-body">
                <thead>
                  <tr>
                    <th className="w-[28%]">Day</th>
                    <th>Post focus</th>
                  </tr>
                </thead>
                <tbody>
                  {playbook.marketingRhythm.map((row) => (
                    <tr key={row.day}>
                      <td className="font-heading text-espresso">{row.day}</td>
                      <td>{row.post}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <SectionTitle title="Launch path" />
              <div className="space-y-3">
                {playbook.phases.map((p) => (
                  <div
                    key={p.phase}
                    className="playbook-avoid-break playbook-muted-box rounded-lg"
                  >
                    <p className="text-xs uppercase tracking-wide text-caption font-body">
                      {p.phase}: {p.title}
                    </p>
                    <p className="text-sm font-body text-muted mt-1 leading-relaxed">
                      {p.items}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Page 7 - Golden rules */}
        <section className="playbook-page mb-8">
          <SectionTitle title="Golden rules" />
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
            {playbook.goldenRules.map((rule) => (
              <li
                key={rule}
                className="playbook-avoid-break text-sm font-body text-muted playbook-muted-box rounded-lg list-none"
              >
                {rule}
              </li>
            ))}
          </ul>

          <div className="playbook-cover-band rounded-lg px-5 py-6 playbook-avoid-break">
            <h3 className="font-heading text-lg text-cream tracking-wide text-center mb-3">
              Ask yourself every Friday
            </h3>
            <ul className="max-w-md mx-auto space-y-1.5">
              {playbook.weeklyQuestions.map((q) => (
                <li key={q} className="text-sm font-body text-cream/85 text-center">
                  {q}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <footer className="pt-6 border-t border-linen/40 text-center text-xs font-body text-caption">
          <p>The Nurtured Oven · Owner Playbook · {printedDate}</p>
          <p className="playbook-no-print mt-2">
            thenurturedoven.com/playbook (private; not indexed)
          </p>
        </footer>
      </article>
    </>
  )
}
