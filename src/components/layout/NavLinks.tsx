'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/',          label: 'Inicio',    match: (p: string) => p === '/' },
  { href: '/briefs',    label: 'Briefs',    match: (p: string) => p.startsWith('/briefs') },
  { href: '/dashboard', label: 'Dashboard', match: (p: string) => p.startsWith('/dashboard') },
]

export function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex items-center gap-1">
      {NAV_LINKS.map(({ href, label, match }) => {
        const active = match(pathname)
        return (
          <Link
            key={href}
            href={href}
            className={`text-sm px-3 py-1.5 rounded transition-colors ${
              active
                ? 'font-semibold text-on-surface'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
