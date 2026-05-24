type IconProps = {
  className?: string
}

const bg = "#F5EEE4"
const sage = "#6F7D61"
const rose = "#C9968E"

export function OrderThisWeekIcon({ className = "h-16 w-16" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="80" cy="80" r="58" fill={bg} />
      <path
        d="M47 74H113L105 111H55L47 74Z"
        stroke={sage}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M62 74C62 57 70 47 80 47C90 47 98 57 98 74"
        stroke={sage}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M67 87V101"
        stroke={sage}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M93 87V101"
        stroke={sage}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M80 103C76 99 69 94 69 88C69 84 72 81 76 81C78 81 80 82 80 84C80 82 82 81 84 81C88 81 91 84 91 88C91 94 84 99 80 103Z"
        fill={rose}
      />
    </svg>
  )
}

export function ComfortBoxIcon({ className = "h-16 w-16" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="80" cy="80" r="58" fill={bg} />
      <rect
        x="47"
        y="72"
        width="66"
        height="43"
        rx="4"
        stroke={sage}
        strokeWidth="5"
      />
      <path d="M47 86H113" stroke={sage} strokeWidth="5" strokeLinecap="round" />
      <path
        d="M80 72V115"
        stroke={sage}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M80 70C72 57 58 55 58 66C58 75 72 74 80 70Z"
        stroke={rose}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M80 70C88 57 102 55 102 66C102 75 88 74 80 70Z"
        stroke={rose}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M80 103C77 100 72 97 72 92C72 89 74 87 77 87C79 87 80 88 80 90C80 88 82 87 84 87C87 87 89 89 89 92C89 97 83 100 80 103Z"
        fill={rose}
      />
    </svg>
  )
}

export function MenuRemindersIcon({ className = "h-16 w-16" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="80" cy="80" r="58" fill={bg} />
      <rect
        x="45"
        y="58"
        width="70"
        height="51"
        rx="5"
        stroke={sage}
        strokeWidth="5"
      />
      <path
        d="M48 62L80 86L112 62"
        stroke={sage}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M80 96C76 92 70 88 70 82C70 78 73 75 77 75C79 75 80 76 80 78C80 76 82 75 84 75C88 75 91 78 91 82C91 88 84 92 80 96Z"
        fill={rose}
      />
    </svg>
  )
}

export function AskQuestionIcon({ className = "h-16 w-16" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="80" cy="80" r="58" fill={bg} />
      <path
        d="M48 75C48 60 62 49 80 49C98 49 112 60 112 75C112 90 98 101 80 101C75 101 70 100 66 98L52 108L56 92C51 88 48 82 48 75Z"
        stroke={sage}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M80 88C76 84 70 80 70 74C70 70 73 67 77 67C79 67 80 68 80 70C80 68 82 67 84 67C88 67 91 70 91 74C91 80 84 84 80 88Z"
        fill={rose}
      />
    </svg>
  )
}
