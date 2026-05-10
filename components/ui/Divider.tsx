interface DividerProps {
  icon?: "heart" | "flourish" | "dot"
  className?: string
}

export default function Divider({ icon = "heart", className = "" }: DividerProps) {
  const icons = {
    heart: (
      <svg width="14" height="13" viewBox="0 0 14 13" fill="currentColor" className="text-blush">
        <path d="M7 12.5s-5.5-3.5-5.5-7A3 3 0 0 1 7 3a3 3 0 0 1 5.5 2.5c0 3.5-5.5 7-5.5 7z" />
      </svg>
    ),
    flourish: (
      <svg width="20" height="8" viewBox="0 0 20 8" fill="none" stroke="currentColor" strokeWidth="1" className="text-linen">
        <path d="M0 4c3-3 5-3 7 0s4 3 6 0 3-3 7 0" />
      </svg>
    ),
    dot: (
      <span className="w-1.5 h-1.5 rounded-full bg-blush" />
    ),
  }

  return (
    <div className={`ornament-divider ${className}`}>
      {icons[icon]}
    </div>
  )
}
