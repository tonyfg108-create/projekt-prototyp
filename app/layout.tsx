import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono'
})

export const metadata: Metadata = {
  title: 'Good Deeds Network - Earn Rewards for Real-World Impact',
  description: 'Join the global community making a difference. Complete environmental cleanup tasks, help your community, and earn Impact Tokens verified by AI.',
  generator: 'Good Deeds Network',
  keywords: ['environmental', 'cleanup', 'community', 'rewards', 'volunteer', 'impact', 'sustainability'],
  authors: [{ name: 'Good Deeds Network' }],
  openGraph: {
    title: 'Good Deeds Network',
    description: 'Earn rewards for real-world positive impact',
    type: 'website',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1a1a2e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased min-h-screen">
        {children}
        <Toaster position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
