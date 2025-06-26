import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

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
      <body>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
      </body>
    </html>
  )
}
