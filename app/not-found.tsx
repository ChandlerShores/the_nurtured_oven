import Button from "@/components/ui/Button"
import Divider from "@/components/ui/Divider"

export default function NotFound() {
  return (
    <div className="bg-cream min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-5">
        <p className="text-5xl mb-4">🍪</p>
        <h1 className="font-heading text-3xl sm:text-4xl text-espresso mb-3 tracking-wide">
          Page not found
        </h1>
        <Divider icon="heart" />
        <p className="text-muted font-body text-lg mb-8 max-w-md">
          Looks like this page wandered off. Let&apos;s get you back to
          something warm.
        </p>
        <Button href="/" size="lg">
          Back to Home
        </Button>
      </div>
    </div>
  )
}
