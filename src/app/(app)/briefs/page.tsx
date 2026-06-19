import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '../../../auth'
import { listBriefs } from '../../../dao/briefDao'
import { BriefsFilterBar } from '../../../components/briefs/BriefsFilterBar'
import { canCreateBriefs, canSeeAllBriefs } from '../../../types/domain'

export const metadata = {
  title: 'Briefings — PRISMA Copy Lab',
}

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
}

const CHANNEL_BADGE: Record<string, string> = {
  whatsapp: 'bg-surface-container-high text-on-surface border-outline-variant',
  email:    'bg-surface-container-high text-on-surface border-outline-variant',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function formatBriefNumber(briefNumber: number): string {
  return `BR-${briefNumber.toString().padStart(3, '0')}`
}

type Props = { searchParams: Promise<{ channel?: string; status?: string }> }

export default async function BriefsListPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { channel: activeChannel, status: activeStatus } = await searchParams

  const role = session.user.role
  const seeAll = canSeeAllBriefs(role)
  const canCreate = canCreateBriefs(role)

  const allBriefs = await listBriefs(seeAll ? undefined : session.user.id)

  // Rechazados que pertenecen al usuario actual (para el badge)
  const myRejectedCount = allBriefs.filter(
    (b) => b.reviewStatus === 'rejected' && b.userId === session.user.id,
  ).length

  const displayedBriefs = allBriefs.filter((b) => {
    const channelMatch = !activeChannel || b.channel === activeChannel
    const statusMatch  = !activeStatus  || b.reviewStatus === activeStatus
    return channelMatch && statusMatch
  })

  const totalBriefs = allBriefs.length
  const whatsappCount = allBriefs.filter((b) => b.channel === 'whatsapp').length
  const emailCount = allBriefs.filter((b) => b.channel === 'email').length

  const stats = [
    { label: 'Total briefs', value: totalBriefs },
    { label: 'WhatsApp', value: whatsappCount },
    { label: 'Email', value: emailCount },
    { label: 'Este mes', value: allBriefs.filter((b) => {
        const d = new Date(b.createdAt)
        const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }).length },
  ]

  const newBriefHref = activeChannel ? `/briefs/new?channel=${activeChannel}` : '/briefs/new'

  return (
    <div className="px-6 md:px-10 py-8 max-w-5xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1
            className="text-2xl font-bold text-on-surface"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Briefings
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {displayedBriefs.length === 0
              ? 'Crea tu primer briefing para empezar'
              : `${displayedBriefs.length} briefing${displayedBriefs.length !== 1 ? 's' : ''} encontrado${displayedBriefs.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {canCreate && (
          <Link
            href={newBriefHref}
            className="rounded px-4 py-2 text-sm font-semibold bg-[#1b1c1c] text-white hover:bg-[#4c4546] transition-colors shadow-sm"
          >
            + Nuevo briefing
          </Link>
        )}
      </div>

      {/* Filter bar */}
      <Suspense fallback={<div className="h-10 mb-2" />}>
        <BriefsFilterBar rejectedCount={myRejectedCount} />
      </Suspense>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3"
          >
            <p className="text-xs text-on-surface-variant mb-1">{label}</p>
            <p className="text-2xl font-bold text-on-surface">{value}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {displayedBriefs.length === 0 ? (
        <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-lg px-6 py-16 text-center space-y-4">
          <p className="text-base font-medium text-on-surface">Sin briefings todavía</p>
          <p className="text-sm text-on-surface-variant">
            {canCreate
              ? 'Empieza creando un briefing para generar mensajes de captación.'
              : 'Todavía no hay briefings disponibles.'}
          </p>
          {canCreate && (
            <Link
              href={newBriefHref}
              className="inline-block rounded px-5 py-2 text-sm font-semibold bg-[#1b1c1c] text-white hover:bg-[#4c4546] transition-colors mt-2"
            >
              Crear briefing
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">

          {/* Table header */}
          <div className="hidden md:grid gap-4 px-5 py-3 bg-surface-container-low border-b border-outline-variant" style={{ gridTemplateColumns: '80px 100px 1fr 130px 110px 130px 32px' }}>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Nº</p>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Canal</p>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Título</p>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Fecha</p>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Estado</p>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Responsable</p>
            <span />
          </div>

          <ul>
            {displayedBriefs.map((brief, idx) => {
              const statusMeta: Record<string, { label: string; cls: string; responsable: string }> = {
                pending:   { label: 'Borrador',       cls: 'bg-surface-container-high text-on-surface-variant border-outline-variant',          responsable: 'Redactor' },
                submitted: { label: 'En revisión',    cls: 'bg-[#e9e8e7] text-[#1b1c1c] border-[#cfc4c5]',                                     responsable: 'Product Manager' },
                approved:  { label: 'Aprobado',       cls: 'bg-success-container text-on-success-container border-success-container',            responsable: 'Equipo CRM' },
                rejected:  { label: 'Rechazado',      cls: 'bg-error-container/30 text-on-error-container border-error-container/50',            responsable: 'Redactor' },
              }
              const sm = statusMeta[brief.reviewStatus ?? 'pending'] ?? statusMeta['pending']!!

              return (
                <li
                  key={brief.id}
                  className={idx < displayedBriefs.length - 1 ? 'border-b border-surface-container-low' : ''}
                >
                  <Link
                    href={`/briefs/${brief.id}`}
                    className="flex md:grid gap-4 items-center px-5 py-3.5 group hover:bg-surface-container-low transition-colors"
                    style={{ gridTemplateColumns: '80px 100px 1fr 130px 110px 130px 32px' }}
                  >
                    <span className="text-xs font-mono font-semibold text-outline shrink-0">
                      {formatBriefNumber(brief.briefNumber)}
                    </span>
                    <div className="flex flex-col gap-1 shrink-0">
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded border w-fit ${
                          CHANNEL_BADGE[brief.channel] ?? 'bg-surface-container-high text-on-surface border-outline-variant'
                        }`}
                      >
                        {CHANNEL_LABELS[brief.channel] ?? brief.channel}
                      </span>
                      {brief.generationMode === 'ab_test' && (
                        <span className="inline-flex items-center text-[10px] font-bold border border-[#1b1c1c] text-[#1b1c1c] rounded-full px-2 py-0 w-fit">
                          A/B
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-on-surface truncate group-hover:text-on-surface transition-colors text-sm">
                      {brief.title}
                    </p>
                    <p className="text-sm text-outline shrink-0 hidden md:block">{formatDate(brief.createdAt)}</p>
                    <span
                      className={`hidden md:inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded border shrink-0 w-fit ${sm.cls}`}
                    >
                      {sm.label}
                    </span>
                    <p className="text-sm text-on-surface-variant shrink-0 hidden md:block">{sm.responsable}</p>
                    <span className="text-outline opacity-0 group-hover:opacity-100 transition-opacity text-sm">→</span>
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
