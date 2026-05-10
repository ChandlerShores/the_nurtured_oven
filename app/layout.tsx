import type { Metadata } from "next"
import { Lora, Inter, Dancing_Script } from "next/font/google"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
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
  title: "The Nurtured Oven | Fresh-Baked Comfort from Kentucky",
  description:
    "Small-batch cookies, bars, and nostalgic sweets made in Kentucky with warmth, intention, and care. Order comfort for yourself or send a gift to someone you love.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable} ${dancingScript.variable}`}>
      <body className="min-h-screen antialiased flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
