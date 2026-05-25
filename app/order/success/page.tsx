import type { Metadata } from "next"
import Link from "next/link"
import Divider from "@/components/ui/Divider"
import Button from "@/components/ui/Button"

export const metadata: Metadata = {
  title: "Order Confirmed | The Nurtured Oven",
  description: "Thank you for your weekly order.",
}

export default function OrderSuccessPage() {
  return (
    <div className="bg-cream min-h-[60vh]">
      <div className="max-w-xl mx-auto px-5 sm:px-8 py-20 text-center">
        <div className="text-4xl mb-4">🍪</div>
        <h1 className="font-heading text-3xl sm:text-4xl text-espresso tracking-wide mb-4">
          Thank you!
        </h1>
        <Divider icon="heart" />
        <p className="text-muted text-lg font-body leading-relaxed mt-6">
          Your payment was received and your weekly order is confirmed. We&apos;ll
          follow up with Friday pickup or Georgetown/Lexington delivery details if needed.
        </p>
        <p className="text-caption text-sm font-body mt-4">
          A receipt was sent to the email you used at checkout.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="/menu" variant="outline">
            Back to menu
          </Button>
          <Button href="/" size="lg">
            Home
          </Button>
        </div>
        <p className="mt-8 text-xs text-hint font-body">
          Questions?{" "}
          <Link href="/contact?intent=general" className="underline hover:text-olive">
            Get in touch
          </Link>
        </p>
      </div>
    </div>
  )
}
