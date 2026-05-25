import type { Metadata } from "next"
import { Lora, Inter, Dancing_Script } from "next/font/google"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { getOrderingPublicState } from "@/lib/menu/ordering-gate"
import "./globals.css"

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-accent",
  display: "swap",
})

export const metadata: Metadata = {
  title: "The Nurtured Oven | Weekly Comfort Sweets from Kentucky",
  description:
    "Small-batch comfort sweets, made weekly, boxed beautifully, and shared with care. Order by Wednesday for free Friday pickup or local delivery in Georgetown & Lexington.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const ordering = getOrderingPublicState()

  return (
    <html lang="en" className={`${lora.variable} ${inter.variable} ${dancingScript.variable}`}>
      <body className="min-h-screen antialiased flex flex-col">
        <a href="#main-content" className="skip-link font-body">
          Skip to main content
        </a>
        <Header
          orderingOpen={ordering.isOpen}
          bannerNote={ordering.bannerNote}
        />
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
