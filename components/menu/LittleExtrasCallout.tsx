import Button from "@/components/ui/Button"
import type { LittleExtrasCalloutContent } from "@/lib/content/menu-types"

interface LittleExtrasCalloutProps {
  callout: LittleExtrasCalloutContent
}

export default function LittleExtrasCallout({ callout }: LittleExtrasCalloutProps) {
  if (!callout.enabled) return null

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 pb-12 text-center">
      <div className="bg-warm-white rounded-2xl border border-linen/30 shadow-gentle px-6 py-8 sm:px-10">
        <p className="font-accent text-eyebrow text-base mb-2">
          friday bonus
        </p>
        <p className="text-muted font-body text-sm leading-relaxed mb-5">
          {callout.text}
        </p>
        <Button href={callout.href} variant="outline" size="md">
          {callout.buttonText}
        </Button>
      </div>
    </div>
  )
}
