'use client'

import Link from 'next/link'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { buttonVariants } from '../ui/button'
import type { PublicProgramSummary } from '../../services/publicCatalogService'

interface PublicProgramExplorerProps {
  programs: PublicProgramSummary[]
}

const ALL_VALUE = 'Todos'

export function PublicProgramExplorer({ programs }: PublicProgramExplorerProps) {
  const [query, setQuery] = useState('')
  const [selectedSchool, setSelectedSchool] = useState(ALL_VALUE)
  const [selectedType, setSelectedType] = useState(ALL_VALUE)
  const [selectedMarket, setSelectedMarket] = useState(ALL_VALUE)

  const schools = useMemo(() => buildOptions(programs.map((program) => program.school)), [programs])
  const programTypes = useMemo(() => buildOptions(programs.map((program) => program.programType)), [programs])
  const markets = ['Europa', 'Colombia', 'Ecuador', 'Perú']

  const filteredPrograms = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es-ES')

    return programs.filter((program) => {
      const matchesQuery =
        normalizedQuery === '' ||
        [program.name, program.school, program.valueProposition, program.careerOutcomes ?? '']
          .join(' ')
          .toLocaleLowerCase('es-ES')
          .includes(normalizedQuery)

      const matchesSchool = selectedSchool === ALL_VALUE || program.school === selectedSchool
      const matchesType = selectedType === ALL_VALUE || program.programType === selectedType
      const matchesMarket = selectedMarket === ALL_VALUE || program.market.includes(selectedMarket)

      return matchesQuery && matchesSchool && matchesType && matchesMarket
    })
  }, [programs, query, selectedMarket, selectedSchool, selectedType])

  return (
    <section id="titulos" className="border-t border-outline-variant bg-surface-container-low px-6 py-14 md:px-16 md:py-18">
      <div className="mx-auto grid w-full max-w-[1280px] gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-5">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-outline">
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Catálogo
            </p>
            <h2 className="mt-3 text-2xl font-bold text-on-surface" style={{ fontFamily: 'var(--font-heading)' }}>
              Encuentra tu título
            </h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              Explora programas online por área, tipo de titulación y mercado disponible.
            </p>
          </div>

          <div className="space-y-4">
            <label htmlFor="program-search" className="block text-sm font-medium text-on-surface">
              Buscar
            </label>
            <div className="flex h-11 items-center gap-2 border border-outline-variant bg-white px-3">
              <Search className="size-4 text-outline" aria-hidden="true" />
              <input
                id="program-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="IA, diseño, industria..."
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-outline"
              />
            </div>
          </div>

          <FilterSelect label="Facultad" value={selectedSchool} options={[ALL_VALUE, ...schools]} onChange={setSelectedSchool} />
          <FilterSelect label="Tipo" value={selectedType} options={[ALL_VALUE, ...programTypes]} onChange={setSelectedType} />
          <FilterSelect label="Mercado" value={selectedMarket} options={[ALL_VALUE, ...markets]} onChange={setSelectedMarket} />
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant pb-3">
            <p className="text-sm font-medium text-on-surface">
              {filteredPrograms.length} títulos disponibles
            </p>
            <Link href="/login" className="text-sm font-semibold text-on-surface hover:underline">
              Acceso interno
            </Link>
          </div>

          {filteredPrograms.length === 0 ? (
            <div className="border border-dashed border-outline-variant bg-white px-6 py-12 text-center">
              <p className="text-sm font-semibold text-on-surface">No hay títulos con esos filtros.</p>
              <p className="mt-1 text-sm text-on-surface-variant">Prueba con otra facultad, mercado o palabra clave.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredPrograms.map((program) => (
                <article key={program.id} className="border border-outline-variant bg-white p-5 transition-colors hover:border-on-surface">
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-surface-container px-2 py-1 text-xs font-medium text-on-surface-variant">
                      {program.programType}
                    </span>
                    <span className="bg-[#e3f5ec] px-2 py-1 text-xs font-medium text-[#1a6639]">
                      {program.modality}
                    </span>
                  </div>

                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-outline">{program.school}</p>
                  <h3 className="mt-1 text-lg font-bold leading-snug text-on-surface" style={{ fontFamily: 'var(--font-heading)' }}>
                    {program.name}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-on-surface-variant">
                    {program.valueProposition}
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-outline-variant pt-4 text-sm">
                    <div>
                      <dt className="text-xs text-outline">Mercado</dt>
                      <dd className="font-medium text-on-surface">{program.market}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-outline">Duración</dt>
                      <dd className="font-medium text-on-surface">{program.duration ?? 'Flexible'}</dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link href={`/universidad-prisma/programas/${program.id}`} className={buttonVariants({ size: 'sm' })}>
                      Ver programa
                    </Link>
                    <Link href={`/universidad-prisma/solicita-informacion?programa=${encodeURIComponent(program.id)}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                      Solicitar admisión
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

interface FilterSelectProps {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-on-surface">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full border border-outline-variant bg-white px-3 text-sm text-on-surface outline-none focus:border-on-surface"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

function buildOptions(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'es'))
}
