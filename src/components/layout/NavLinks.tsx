'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { canAccessDashboard, canAccessAnalytics } from '../../types/domain'

const BASE_LINKS = [
  { href: '/',        label: 'Inicio',   match: (p: string) => p === '/' },
  { href: '/titulos', label: 'Títulos',  match: (p: string) => p.startsWith('/titulos') },
  { href: '/briefs',  label: 'Briefs',   match: (p: string) => p.startsWith('/briefs') },
]

const DASHBOARD_LINK = {
  href: '/dashboard', label: 'Dashboard', match: (p: string) => p.startsWith('/dashboard'),
}

const ANALISIS_LINK = {
  href: '/analisis', label: 'Análisis', match: (p: string) => p.startsWith('/analisis'),
}

interface Props {
  role?: string
}

export function NavLinks({ role }: Props) {
  const pathname = usePathname()
  const links = [
    ...BASE_LINKS,
    ...(canAccessDashboard(role) ? [DASHBOARD_LINK] : []),
    ...(canAccessAnalytics(role) ? [ANALISIS_LINK] : []),
  ]

  return (
    <nav className="hidden md:flex items-center gap-1">
      {links.map(({ href, label, match }) => {
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
