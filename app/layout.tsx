import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Assembly Visualizer',
  description: 'Interactive assembly language visualizer for CS208 COA',
  generator: 'v0.dev',
  icons: {
    icon: '/fevicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}
