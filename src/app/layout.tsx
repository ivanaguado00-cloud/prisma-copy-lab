import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Navbar } from '../components/layout/Navbar'
import './globals.css'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
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
      className={`${inter.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
