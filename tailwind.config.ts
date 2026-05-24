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
        cream: "#F8F4EE",
        oatmeal: "#E9E0D2",
        sage: "#AEB5A0",
        olive: "#7F8672",
        blush: "#C89E9B",
        "warm-honey": "#D0A55B",
        espresso: "#4A352C",
        linen: "#F3EDE3",
        "brown-sugar": "#7F8672",
        "warm-white": "#F3EDE3",
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
        gentle: "0 2px 12px rgba(74, 53, 44, 0.06)",
        warm: "0 4px 24px rgba(74, 53, 44, 0.08)",
      },
    },
  },
  plugins: [],
}
export default config
