import Button from "@/components/ui/Button"

interface MenuOrderButtonProps {
  href?: string
  children: string
  size?: "sm" | "md" | "lg"
  orderingOpen: boolean
  soldOut?: boolean
  disabledMessage?: string
  className?: string
}

function isExternalUrl(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://")
}

export default function MenuOrderButton({
  href,
  children,
  size = "lg",
  orderingOpen,
  soldOut,
  disabledMessage,
  className = "",
}: MenuOrderButtonProps) {
  if (soldOut) {
    return (
      <p className="text-sm font-body text-muted-sm italic">
        Sold out this week
      </p>
    )
  }

  if (!orderingOpen || !href) {
    return (
      <p className="text-sm font-body text-muted-sm leading-relaxed max-w-sm">
        {disabledMessage}
      </p>
    )
  }

  if (isExternalUrl(href)) {
    const sizeClasses =
      size === "lg"
        ? "px-9 py-4 text-lg"
        : size === "sm"
          ? "px-5 py-2.5 text-sm"
          : "px-7 py-3 text-base"

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center font-body font-semibold rounded-full bg-olive text-cream hover:bg-espresso shadow-gentle hover:shadow-warm transition-all duration-300 tracking-wide ${sizeClasses} ${className}`}
      >
        {children}
      </a>
    )
  }

  return (
    <Button href={href} size={size} className={className}>
      {children}
    </Button>
  )
}
