import Link from "next/link"

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost"
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
    "bg-brown-sugar text-warm-white hover:bg-espresso shadow-gentle hover:shadow-warm transition-all duration-300",
  secondary:
    "bg-oatmeal text-espresso hover:bg-linen shadow-gentle transition-all duration-300",
  outline:
    "border border-brown-sugar/40 text-brown-sugar hover:bg-brown-sugar hover:text-warm-white transition-all duration-300",
  ghost:
    "text-brown-sugar hover:text-espresso hover:bg-oatmeal/40 transition-all duration-300",
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
    "inline-flex items-center justify-center font-body font-medium rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown-sugar/60 tracking-wide"
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
