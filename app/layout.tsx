import type { Metadata, Viewport } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'Am I Rich?',
  description: 'Personal finance tracker',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Am I Rich?' },
}

export const viewport: Viewport = {
  themeColor: '#6C63FF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="max-w-[430px] mx-auto min-h-screen relative">
        <main className="pb-20">{children}</main>
        <BottomNav />
      </body>
    </html>
  )
}
