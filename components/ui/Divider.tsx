interface DividerProps {
  icon?: "heart" | "flourish" | "dot" | "wildflower"
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
    wildflower: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sage">
        <path d="M12 22V12" />
        <path d="M12 12c-1.5-2-4-4-5-7a3 3 0 0 1 5 2v5z" />
        <path d="M12 12c1.5-2 4-4 5-7a3 3 0 0 0-5 2v5z" />
        <path d="M12 12c-2.5-1-5.5-1-7.5 0a3 3 0 0 1 3-4l4.5 4z" />
        <path d="M12 12c2.5-1 5.5-1 7.5 0a3 3 0 0 0-3-4l-4.5 4z" />
      </svg>
    ),
  }

  return (
    <div className={`ornament-divider ${className}`}>
      {icons[icon]}
    </div>
  )
}
