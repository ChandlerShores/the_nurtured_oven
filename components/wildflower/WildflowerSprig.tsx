interface WildflowerSprigProps {
  size?: "sm" | "md"
  className?: string
}

const sizes = { sm: 14, md: 24 } as const

export default function WildflowerSprig({
  size = "sm",
  className = "",
}: WildflowerSprigProps) {
  const dim = sizes[size]

  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-sage shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d="M12 22V12" />
      <path d="M12 12c-1.5-2-4-4-5-7a3 3 0 0 1 5 2v5z" />
      <path d="M12 12c1.5-2 4-4 5-7a3 3 0 0 0-5 2v5z" />
      <path d="M12 12c-2.5-1-5.5-1-7.5 0a3 3 0 0 1 3-4l4.5 4z" />
      <path d="M12 12c2.5-1 5.5-1 7.5 0a3 3 0 0 0-3-4l-4.5 4z" />
    </svg>
  )
}
