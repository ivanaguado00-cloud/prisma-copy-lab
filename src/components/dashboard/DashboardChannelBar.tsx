'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const CHANNEL_FILTERS = [
  { label: 'Todos',     value: '' },
  { label: 'Email',     value: 'email' },
  { label: 'WhatsApp',  value: 'whatsapp' },
]

function ChannelTab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 text-sm rounded transition-colors whitespace-nowrap ${
        active
          ? 'bg-[#1b1c1c] text-white font-semibold'
          : 'text-[#4c4546] hover:bg-[#e9e8e7] border border-[#cfc4c5]'
      }`}
    >
      {label}
    </Link>
  )
}

export function DashboardChannelBar() {
  const searchParams = useSearchParams()
  const activeChannel = searchParams.get('channel') ?? ''

  return (
    <div className="flex items-center gap-2">
      {CHANNEL_FILTERS.map((f) => {
        const params = new URLSearchParams(searchParams.toString())
        if (f.value === '') {
          params.delete('channel')
        } else {
          params.set('channel', f.value)
        }
        const q = params.toString()
        const href = q ? `/dashboard?${q}` : '/dashboard'
        return (
          <ChannelTab
            key={f.value || 'all'}
            href={href}
            label={f.label}
            active={activeChannel === f.value}
          />
        )
      })}
    </div>
  )
}
