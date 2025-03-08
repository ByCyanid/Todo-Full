import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Todo Projesi',
  description: 'Created with Cyanid',
  generator: 'Cyanid',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
