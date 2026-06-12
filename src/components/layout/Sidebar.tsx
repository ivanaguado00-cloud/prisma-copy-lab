'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

// ── Icons (inline SVG, Material Symbols style) ────────────────────────────────

function IconChat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
    </svg>
  )
}

function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
    </svg>
  )
}

function IconCheckCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  )
}

function IconHourglass() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 2v6l2.5 2.5L6 13v6h12v-6l-2.5-2.5L18 8V2H6zm10 14.5V20H8v-3.5l4-4 4 4zM12 11l-4-4V4h8v3l-4 4z"/>
    </svg>
  )
}

function IconCancel() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
    </svg>
  )
}

function IconAdd() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/briefs?channel=whatsapp', label: 'WhatsApp', icon: <IconChat />, channelKey: 'whatsapp' },
  { href: '/briefs?channel=email',    label: 'Email',    icon: <IconMail />, channelKey: 'email' },
]

const STATUS_ITEMS = [
  { href: '/briefs?verdict=aprobada',  label: 'Aprobada',  icon: <IconCheckCircle />, verdictKey: 'aprobada' },
  { href: '/briefs?verdict=pendiente', label: 'Pendiente', icon: <IconHourglass />,   verdictKey: 'pendiente' },
  { href: '/briefs?verdict=rechazada', label: 'Rechazada', icon: <IconCancel />,       verdictKey: 'rechazada' },
]

// ── NavItem ───────────────────────────────────────────────────────────────────

function NavItem({
  href,
  label,
  icon,
  active,
}: {
  href: string
  label: string
  icon: React.ReactNode
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-secondary-container text-on-surface font-semibold'
          : 'text-on-surface-variant hover:bg-surface-container-high'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const channel = searchParams.get('channel')
  const verdict = searchParams.get('verdict')

  return (
    <aside className="hidden md:flex flex-col h-[calc(100vh-64px)] w-64 fixed left-0 top-16 bg-surface-container-low border-r border-outline-variant p-4 gap-2">

      {/* Header */}
      <div className="px-2 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-on-surface rounded flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface" style={{ fontFamily: 'var(--font-heading)' }}>
              Creation Flow
            </p>
            <p className="text-xs text-on-surface-variant">Manage Copy Assets</p>
          </div>
        </div>

        <Link
          href="/briefs/new"
          className="flex items-center justify-center gap-2 w-full bg-on-surface text-white py-2.5 px-4 rounded text-sm font-semibold hover:bg-on-surface-variant transition-colors"
        >
          <IconAdd />
          Create New Brief
        </Link>
      </div>

      {/* Channel nav */}
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={pathname.startsWith('/briefs') && channel === item.channelKey}
          />
        ))}
      </nav>

      {/* Divider */}
      <div className="h-px bg-outline-variant mx-2 my-1" />

      {/* Status nav */}
      <nav className="flex flex-col gap-1">
        {STATUS_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={pathname.startsWith('/briefs') && verdict === item.verdictKey}
          />
        ))}
      </nav>
    </aside>
  )
}
