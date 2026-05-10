import { socialLinks } from "@/lib/content/social"

interface SocialIconsProps {
  className?: string
  iconSize?: number
}

export default function SocialIcons({
  className = "",
  iconSize = 20,
}: SocialIconsProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <a
        href={socialLinks.instagram.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow on Instagram"
        className="text-brown-sugar/60 hover:text-espresso transition-colors duration-200"
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      </a>
      <a
        href={socialLinks.facebook.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow on Facebook"
        className="text-brown-sugar/60 hover:text-espresso transition-colors duration-200"
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      </a>
    </div>
  )
}
