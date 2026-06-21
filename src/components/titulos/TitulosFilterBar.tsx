'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const STATUS_FILTERS = [
  { label: 'Todos',     value: '' },
  { label: 'Activos',   value: 'active' },
  { label: 'Inactivos', value: 'inactive' },
]

function buildHref(
  searchParams: URLSearchParams,
  key: string,
  value: string,
): string {
  const params = new URLSearchParams(searchParams.toString())
  if (value === '') {
    params.delete(key)
  } else {
    params.set(key, value)
  }
  const q = params.toString()
  return q ? `/titulos?${q}` : '/titulos'
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

interface Props {
  schools: string[]
  modalities: string[]
}

export function TitulosFilterBar({ schools, modalities }: Props) {
  const searchParams = useSearchParams()
  const activeSchool   = searchParams.get('school')   ?? ''
  const activeModality = searchParams.get('modality') ?? ''
  const activeStatus   = searchParams.get('status')   ?? ''

  return (
    <div className="flex flex-wrap items-center gap-3 pb-4">

      {/* Estado */}
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

      {/* Escuela */}
      {schools.length > 1 && (
        <>
          <div className="h-4 w-px bg-outline-variant hidden sm:block" />
          <div className="flex flex-wrap items-center gap-2">
            <FilterPill
              href={buildHref(searchParams, 'school', '')}
              label="Todas las escuelas"
              active={activeSchool === ''}
            />
            {schools.map((s) => (
              <FilterPill
                key={s}
                href={buildHref(searchParams, 'school', s)}
                label={s}
                active={activeSchool === s}
              />
            ))}
          </div>
        </>
      )}

      {/* Modalidad */}
      {modalities.length > 1 && (
        <>
          <div className="h-4 w-px bg-outline-variant hidden sm:block" />
          <div className="flex flex-wrap items-center gap-2">
            <FilterPill
              href={buildHref(searchParams, 'modality', '')}
              label="Todas las modalidades"
              active={activeModality === ''}
            />
            {modalities.map((m) => (
              <FilterPill
                key={m}
                href={buildHref(searchParams, 'modality', m)}
                label={m}
                active={activeModality === m}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
