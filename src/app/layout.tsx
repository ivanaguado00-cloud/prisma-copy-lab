import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Navbar } from '../components/layout/Navbar'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'PRISMA Copy Lab',
  description: 'Generación y validación de mensajes comerciales para Universidad Prisma',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
