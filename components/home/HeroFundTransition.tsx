export default function HeroFundTransition() {
  return (
    <div
      className="relative -mt-8 sm:-mt-10 -mb-8 sm:-mb-10 z-20 pointer-events-none"
      aria-hidden="true"
    >
      <div className="h-[70px] sm:h-[82px] bg-gradient-to-b from-espresso/24 via-oatmeal/52 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-transparent to-oatmeal/20" />
      <div className="absolute inset-x-0 bottom-0 h-5 bg-gradient-to-b from-oatmeal/18 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-2 opacity-35">
          <span className="h-px w-5 sm:w-6 bg-espresso/18" />
          <svg width="10" height="9" viewBox="0 0 14 13" fill="currentColor" className="text-blush/55">
            <path d="M7 12.5s-5.5-3.5-5.5-7A3 3 0 0 1 7 3a3 3 0 0 1 5.5 2.5c0 3.5-5.5 7-5.5 7z" />
          </svg>
          <span className="h-px w-5 sm:w-6 bg-espresso/18" />
        </div>
      </div>
    </div>
  )
}
