'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState, useRef, useEffect } from 'react'
import type { SendMetricsWithBrief } from '../../dao/sendMetricsDao'

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
}

const DATE_RANGE_OPTIONS = [
  { value: '7d',    label: 'Últimos 7 días' },
  { value: '30d',   label: 'Últimos 30 días' },
  { value: '90d',   label: 'Últimos 90 días' },
  { value: 'month', label: 'Este mes' },
  { value: 'all',   label: 'Todo' },
]

interface Props {
  sends: SendMetricsWithBrief[]
  totalSends: number
  selectedBriefIds: string[]
}

export function AnalysisFilterBar({ sends, totalSends, selectedBriefIds }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()

  const activeChannel   = params.get('channel') ?? 'all'
  const activeDateRange = params.get('dateRange') ?? '30d'

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Update date/channel params, clearing the briefIds selection
  const updateParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString())
      if (value === '' || value === 'all') {
        next.delete(key)
      } else {
        next.set(key, value)
      }
      // Changing date or channel resets the selection
      next.delete('briefIds')
      router.push(`${pathname}?${next.toString()}`)
    },
    [params, pathname, router],
  )

  // Toggle a single briefId in the comma-separated briefIds param
  const toggleBrief = useCallback(
    (briefId: string) => {
      const next = new URLSearchParams(params.toString())
      const current = (next.get('briefIds') ?? '').split(',').filter(Boolean)
      const idx = current.indexOf(briefId)
      if (idx === -1) {
        current.push(briefId)
      } else {
        current.splice(idx, 1)
      }
      if (current.length === 0) {
        next.delete('briefIds')
      } else {
        next.set('briefIds', current.join(','))
      }
      router.push(`${pathname}?${next.toString()}`)
    },
    [params, pathname, router],
  )

  // Clear selection → show all
  const clearSelection = useCallback(() => {
    const next = new URLSearchParams(params.toString())
    next.delete('briefIds')
    router.push(`${pathname}?${next.toString()}`)
    setDropdownOpen(false)
  }, [params, pathname, router])

  // Button label
  const buttonLabel =
    selectedBriefIds.length === 0
      ? `Todas las comunicaciones (${totalSends})`
      : selectedBriefIds.length === 1
        ? (() => {
            const s = sends.find((x) => x.briefId === selectedBriefIds[0])
            const title = s?.brief.title ?? 'Comunicación seleccionada'
            return title.length > 36 ? title.substring(0, 36) + '…' : title
          })()
        : `${selectedBriefIds.length} seleccionadas`

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">

      {/* ── Date range ── */}
      <div className="flex items-center gap-1 bg-[#ffffff] border border-[#cfc4c5] rounded-lg px-1 py-1">
        {DATE_RANGE_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateParam('dateRange', value)}
            className={`text-xs px-3 py-1.5 rounded transition-colors ${
              activeDateRange === value
                ? 'bg-[#1b1c1c] text-white font-medium'
                : 'text-[#4c4546] hover:text-[#1b1c1c] hover:bg-[#f5f3f3]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Channel ── */}
      <div className="flex items-center gap-1 bg-[#ffffff] border border-[#cfc4c5] rounded-lg px-1 py-1">
        {(['all', 'email', 'whatsapp'] as const).map((ch) => (
          <button
            key={ch}
            onClick={() => updateParam('channel', ch)}
            className={`text-xs px-3 py-1.5 rounded transition-colors ${
              activeChannel === ch
                ? 'bg-[#1b1c1c] text-white font-medium'
                : 'text-[#4c4546] hover:text-[#1b1c1c] hover:bg-[#f5f3f3]'
            }`}
          >
            {ch === 'all' ? 'Todos los canales' : CHANNEL_LABELS[ch]}
          </button>
        ))}
      </div>

      {/* ── Communication multi-select ── */}
      {sends.length > 0 && (
        <div className="relative" ref={dropdownRef}>
          {/* Trigger button */}
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className={`flex items-center gap-2 text-xs border rounded-lg px-3 py-2 bg-[#ffffff] transition-all ${
              selectedBriefIds.length > 0
                ? 'border-[#1b1c1c] text-[#1b1c1c] font-medium'
                : 'border-[#cfc4c5] text-[#4c4546] hover:border-[#1b1c1c] hover:text-[#1b1c1c]'
            }`}
          >
            <span>{buttonLabel}</span>
            <svg
              width="10" height="6" viewBox="0 0 10 6" fill="none"
              className={`text-[#7e7576] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            >
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dropdown panel */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 z-20 bg-[#ffffff] border border-[#cfc4c5] rounded-lg shadow-lg min-w-[300px] max-h-72 overflow-y-auto">

              {/* "Todas" row */}
              <button
                onClick={clearSelection}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs hover:bg-[#f5f3f3] border-b border-[#e9e8e7] text-left"
              >
                <Checkbox checked={selectedBriefIds.length === 0} />
                <span className={selectedBriefIds.length === 0 ? 'font-semibold text-[#1b1c1c]' : 'text-[#4c4546]'}>
                  Todas las comunicaciones ({totalSends})
                </span>
              </button>

              {/* Individual sends */}
              {sends.map((s) => {
                const checked = selectedBriefIds.includes(s.briefId)
                return (
                  <button
                    key={s.briefId}
                    onClick={() => toggleBrief(s.briefId)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs hover:bg-[#f5f3f3] border-b border-[#f5f3f3] last:border-b-0 text-left"
                  >
                    <Checkbox checked={checked} />
                    <div className="min-w-0">
                      <div className={`truncate ${checked ? 'font-semibold text-[#1b1c1c]' : 'text-[#1b1c1c]'}`}>
                        {s.brief.title}
                      </div>
                      <div className="text-[#7e7576] flex items-center gap-1.5 mt-0.5">
                        <span>{CHANNEL_LABELS[s.brief.channel] ?? s.brief.channel}</span>
                        {s.sentAt && <><span>·</span><span>{formatShortDate(s.sentAt)}</span></>}
                        {s.enrollments > 0 && (
                          <><span>·</span><span>{s.enrollments} mat.</span></>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Clear badge when selection active */}
      {selectedBriefIds.length > 0 && (
        <button
          onClick={clearSelection}
          className="text-xs text-[#7e7576] hover:text-[#1b1c1c] underline underline-offset-2 transition-colors"
        >
          Limpiar selección
        </button>
      )}
    </div>
  )
}

// ── Micro-component ─────────────────────────────────────────────────────────

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex-shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
        checked ? 'bg-[#1b1c1c] border-[#1b1c1c]' : 'border-[#cfc4c5] bg-white'
      }`}
    >
      {checked && (
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
          <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </span>
  )
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).format(new Date(date))
}
