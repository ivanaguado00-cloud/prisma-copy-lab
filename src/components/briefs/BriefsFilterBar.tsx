'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const CHANNEL_FILTERS = [
  { label: 'Todos los canales', value: '' },
  { label: 'WhatsApp',          value: 'whatsapp' },
  { label: 'Email',             value: 'email' },
]

const STATUS_FILTERS = [
  { label: 'Todos',     value: '' },
  { label: 'Aprobado',  value: 'approved' },
  { label: 'Pendiente', value: 'pending' },
  { label: 'Rechazado', value: 'rejected' },
]

function buildHref(searchParams: URLSearchParams, key: 'channel' | 'status', value: string): string {
  const params = new URLSearchParams(searchParams.toString())
  if (value === '') {
    params.delete(key)
  } else {
    params.set(key, value)
  }
  const q = params.toString()
  return q ? `/briefs?${q}` : '/briefs'
}

function FilterPill({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap ${
        active
          ? 'bg-secondary-container text-on-surface font-semibold'
          : 'text-on-surface-variant hover:bg-surface-container-high border border-outline-variant'
      }`}
    >
      {label}
    </Link>
  )
}

export function BriefsFilterBar() {
  const searchParams = useSearchParams()
  const activeChannel = searchParams.get('channel') ?? ''
  const activeStatus  = searchParams.get('status')  ?? ''

  return (
    <div className="flex flex-wrap items-center gap-3 pb-4">
      <div className="flex flex-wrap items-center gap-2">
        {CHANNEL_FILTERS.map((f) => (
          <FilterPill
            key={f.value || 'all-channels'}
            href={buildHref(searchParams, 'channel', f.value)}
            label={f.label}
            active={activeChannel === f.value}
          />
        ))}
      </div>

      <div className="h-4 w-px bg-outline-variant hidden sm:block" />

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => (
          <FilterPill
            key={f.value || 'all-status'}
            href={buildHref(searchParams, 'status', f.value)}
            label={f.label}
            active={activeStatus === f.value}
          />
        ))}
      </div>
    </div>
  )
}
