import Link from "next/link"

type ButtonVariant = "primary" | "secondary" | "outline" | "inverse" | "ghost"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps {
  children: React.ReactNode
  href?: string
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  type?: "button" | "submit"
  disabled?: boolean
  onClick?: () => void
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-olive text-cream hover:bg-espresso shadow-gentle hover:shadow-warm transition-all duration-300",
  secondary:
    "bg-oatmeal text-espresso hover:bg-linen shadow-gentle transition-all duration-300",
  outline:
    "border-2 border-olive bg-cream text-espresso shadow-gentle hover:bg-olive hover:text-cream transition-all duration-300",
  inverse:
    "border-2 border-cream bg-cream/25 text-cream shadow-[0_2px_16px_rgba(0,0,0,0.2)] backdrop-blur-sm hover:bg-cream hover:text-espresso transition-all duration-300",
  ghost:
    "text-olive hover:text-espresso hover:bg-oatmeal/40 transition-all duration-300",
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-5 py-2.5 text-sm",
  md: "px-7 py-3 text-base",
  lg: "px-9 py-4 text-lg",
}

export default function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
  onClick,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-body font-semibold rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown-sugar/60 tracking-wide"
  const styles = `${base} ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      className={styles}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
