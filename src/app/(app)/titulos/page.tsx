import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '../../../auth'
import { canManagePrograms } from '../../../types/domain'
import { listPrograms } from '../../../dao/programDao'
import { TitulosFilterBar } from '../../../components/titulos/TitulosFilterBar'
import type { Program } from '../../../types/domain'

export const metadata = { title: 'Títulos — PRISMA Copy Lab' }

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function isDiscountActive(program: Program): boolean {
  if (program.activeDiscount == null) return false
  const now = new Date()
  const from = program.discountValidFrom ? new Date(program.discountValidFrom) : null
  const to   = program.discountValidTo   ? new Date(program.discountValidTo)   : null
  return (from == null || from <= now) && (to == null || to >= now)
}

function hasPromotionalPrice(program: Program): boolean {
  return (
    program.currentPromoPrice != null &&
    program.officialPrice != null &&
    program.currentPromoPrice < program.officialPrice
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3">
      <p className="text-xs text-on-surface-variant mb-1">{label}</p>
      <p className="text-2xl font-bold text-on-surface">{value}</p>
    </div>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border bg-[#e3f5ec] text-[#1a6639] border-[#b6e2ca]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#1a6639] inline-block shrink-0" />
      Activo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border bg-surface-container-high text-on-surface-variant border-outline-variant">
      <span className="w-1.5 h-1.5 rounded-full bg-outline inline-block shrink-0" />
      Inactivo
    </span>
  )
}

function DiscountBadge({ program }: { program: Program }) {
  if (!isDiscountActive(program)) return null
  return (
    <span className="inline-flex items-center text-[10px] font-bold text-[#1a6639] bg-[#e3f5ec] border border-[#b6e2ca] rounded-full px-1.5 py-0 ml-1 shrink-0">
      -{program.activeDiscount}%
    </span>
  )
}

const GRID = 'minmax(220px,1fr) 150px 95px 95px 120px 150px 90px 95px 120px 28px'

type Props = {
  searchParams: Promise<{ school?: string; modality?: string; status?: string }>
}

export default async function TitulosPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { school: activeSchool, modality: activeModality, status: activeStatus } = await searchParams
  const canManage = canManagePrograms(session.user.role)

  const allPrograms = (await listPrograms()) as unknown as Program[]

  // ── KPI data ────────────────────────────────────────────────────────────────
  const totalCount    = allPrograms.length
  const activeCount   = allPrograms.filter((p) => p.isActive).length
  const discountCount = allPrograms.filter((p) => isDiscountActive(p)).length

  const now = new Date()
  const thisMonth = allPrograms.filter((p) => {
    const d = new Date(p.updatedAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const stats = [
    { label: 'Total títulos', value: totalCount },
    { label: 'Activos', value: activeCount },
    { label: 'Con precio promo', value: discountCount },
    { label: 'Actualizados este mes', value: thisMonth },
  ]

  const schools = Array.from(new Set(allPrograms.map((p) => p.school))).sort()

  const modalities = Array.from(
    new Set(allPrograms.map((p) => p.modality).filter((m): m is string => m != null)),
  ).sort()

  const displayed = allPrograms.filter((p) => {
    if (activeSchool   && p.school    !== activeSchool)   return false
    if (activeModality && p.modality  !== activeModality) return false
    if (activeStatus === 'active'   && !p.isActive)       return false
    if (activeStatus === 'inactive' &&  p.isActive)       return false
    return true
  })

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1
            className="text-2xl font-bold text-on-surface"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Títulos
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {displayed.length === 0
              ? 'Base central de programas académicos, comerciales y estratégicos'
              : `${displayed.length} título${displayed.length !== 1 ? 's' : ''} encontrado${displayed.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {canManage && (
          <Link
            href="/titulos/new"
            className="rounded px-4 py-2 text-sm font-semibold bg-[#1b1c1c] text-white hover:bg-[#4c4546] transition-colors shadow-sm"
          >
            + Nuevo título
          </Link>
        )}
      </div>

      <Suspense fallback={<div className="h-10 mb-2" />}>
        <TitulosFilterBar schools={schools} modalities={modalities} />
      </Suspense>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map(({ label, value }) => (
          <StatCard key={label} label={label} value={value} />
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-lg px-6 py-16 text-center space-y-4">
          <p className="text-base font-medium text-on-surface">
            {totalCount === 0 ? 'Aún no hay títulos dados de alta' : 'Sin resultados con estos filtros'}
          </p>
          <p className="text-sm text-on-surface-variant">
            {totalCount === 0
              ? 'Añade el primer programa para construir la base académica y comercial de Universidad Prisma.'
              : 'Prueba con otro estado, vertical o modalidad para volver al listado completo.'}
          </p>
          {totalCount === 0 && canManage && (
            <Link
              href="/titulos/new"
              className="inline-block rounded px-5 py-2 text-sm font-semibold bg-[#1b1c1c] text-white hover:bg-[#4c4546] transition-colors mt-2"
            >
              Crear título
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
          <div
            className="hidden xl:grid gap-3 px-5 py-3 bg-surface-container-low border-b border-outline-variant"
            style={{ gridTemplateColumns: GRID }}
          >
            {[
              'Nombre del título',
              'Vertical / Facultad',
              'Modalidad',
              'Duración',
              'Precio oficial',
              'Precio promocional actual',
              'Matrículas',
              'Estado',
              'Última actualización',
              '',
            ].map((col) => (
              <p key={col} className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider truncate">
                {col}
              </p>
            ))}
          </div>

          <ul>
            {displayed.map((program, idx) => {
              const hasPromo = hasPromotionalPrice(program)

              return (
                <li
                  key={program.id}
                  className={idx < displayed.length - 1 ? 'border-b border-surface-container-low' : ''}
                >
                  <Link
                    href={`/titulos/${program.id}`}
                    className="flex flex-col xl:grid gap-3 items-start xl:items-center px-5 py-3.5 group hover:bg-surface-container-low transition-colors"
                    style={{ gridTemplateColumns: GRID }}
                  >
                    <div className="min-w-0 w-full">
                      <p className="font-medium text-sm text-on-surface truncate group-hover:underline leading-snug">
                        {program.name}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5 xl:hidden truncate">
                        {program.school}{program.modality ? ` · ${program.modality}` : ''}
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-3 xl:hidden">
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-on-surface-variant">Precio oficial</p>
                          <p className="text-sm text-on-surface tabular-nums">{formatCurrency(program.officialPrice)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-on-surface-variant">Precio promo</p>
                          <p className={hasPromo ? 'text-sm font-medium text-[#1a6639] tabular-nums' : 'text-sm text-on-surface-variant'}>
                            {hasPromo ? formatCurrency(program.currentPromoPrice) : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-on-surface-variant">Matrículas</p>
                          <p className="text-sm text-on-surface tabular-nums">{program.enrollmentsTotal}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-on-surface-variant">Estado</p>
                          <StatusBadge active={program.isActive} />
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-on-surface-variant truncate hidden xl:block">
                      {program.school}
                    </p>

                    <p className="text-xs text-on-surface-variant truncate hidden xl:block">
                      {program.modality ?? '—'}
                    </p>

                    <p className="text-xs text-on-surface-variant truncate hidden xl:block">
                      {program.duration ?? '—'}
                    </p>

                    <p className="text-sm text-on-surface tabular-nums shrink-0 hidden xl:block">
                      {formatCurrency(program.officialPrice)}
                    </p>

                    <div className="hidden xl:flex items-center gap-1 shrink-0">
                      {hasPromo ? (
                        <>
                          <p className="text-sm font-medium text-[#1a6639] tabular-nums">
                            {formatCurrency(program.currentPromoPrice)}
                          </p>
                          <DiscountBadge program={program} />
                        </>
                      ) : (
                        <p className="text-sm text-on-surface-variant/50">—</p>
                      )}
                    </div>

                    <p className="text-sm text-on-surface tabular-nums shrink-0 hidden xl:block">
                      {program.enrollmentsTotal}
                    </p>

                    <div className="hidden xl:block shrink-0">
                      <StatusBadge active={program.isActive} />
                    </div>

                    <p className="text-xs text-outline shrink-0 hidden xl:block">
                      {formatDate(program.updatedAt)}
                    </p>

                    <span className="text-outline opacity-0 group-hover:opacity-100 transition-opacity text-sm hidden xl:block">
                      →
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
