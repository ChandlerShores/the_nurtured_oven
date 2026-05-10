import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FBF6EE",
        oatmeal: "#F0E6D6",
        linen: "#E4D8CA",
        blush: "#DEB5A7",
        sage: "#A3B18A",
        "brown-sugar": "#7D6548",
        espresso: "#4A3728",
        "warm-white": "#FDF9F3",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        accent: ["var(--font-accent)", "cursive"],
      },
      borderRadius: {
        soft: "1rem",
        softer: "1.5rem",
      },
      boxShadow: {
        gentle: "0 2px 12px rgba(74, 55, 40, 0.06)",
        warm: "0 4px 24px rgba(74, 55, 40, 0.08)",
      },
    },
  },
  plugins: [],
}
export default config
