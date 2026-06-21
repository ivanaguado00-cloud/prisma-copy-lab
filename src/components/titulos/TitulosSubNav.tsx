'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Tab {
  href: string
  label: string
  match: (p: string) => boolean
}

const TABS_BASE: Tab[] = [
  {
    href: '/titulos',
    label: 'Todos los títulos',
    match: (p) => p === '/titulos',
  },
]

const TAB_NEW: Tab = {
  href: '/titulos/new',
  label: 'Nuevo título',
  match: (p) => p.startsWith('/titulos/new'),
}

interface Props {
  canManage: boolean
}

export function TitulosSubNav({ canManage }: Props) {
  const pathname = usePathname()
  const tabs: Tab[] = canManage ? [...TABS_BASE, TAB_NEW] : TABS_BASE

  return (
    <div className="border-b border-outline-variant bg-surface-bright">
      <div className="mx-auto max-w-[1280px] px-6 md:px-16">
        <nav className="flex items-end gap-0 -mb-px">
          {tabs.map(({ href, label, match }) => {
            const active = match(pathname)
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  active
                    ? 'text-on-surface border-on-surface'
                    : 'text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
