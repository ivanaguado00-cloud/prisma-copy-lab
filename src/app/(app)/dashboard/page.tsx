import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '../../../auth'
import {
  getValidationStats,
  getFirstAttemptApprovalRate,
  getRecentBriefsSummary,
} from '../../../dao/validationRunDao'
import { getBriefStatusStats, getRoleWorkloadStats, getGenerationModeStats } from '../../../dao/briefDao'
import { canAccessDashboard } from '../../../types/domain'
import { DashboardChannelBar } from '../../../components/dashboard/DashboardChannelBar'

export const metadata = {
  title: 'Dashboard — PRISMA Copy Lab',
}

const VERDICT_LABELS: Record<string, string> = {
  aprobada: 'Aprobada',
  aprobada_con_ajustes: 'Aprobada con ajustes',
  no_aprobada: 'No aprobada',
}

const VERDICT_COLORS: Record<string, { bar: string; text: string; bg: string; border: string }> = {
  aprobada:             { bar: '#1b1c1c', text: '#1b1c1c', bg: '#e3f5ec', border: '#b2dfcc' },
  aprobada_con_ajustes: { bar: '#4c4546', text: '#7c5c0a', bg: '#fef3cd', border: '#e8d68a' },
  no_aprobada:          { bar: '#7e7576', text: '#93000a', bg: '#ffdad6', border: '#ffb4ab' },
}

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
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

type Props = { searchParams: Promise<{ channel?: string }> }

export default async function DashboardPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (!canAccessDashboard(session.user.role)) redirect('/briefs')

  const { channel } = await searchParams
  const activeChannel = channel ?? undefined   // undefined = todos los canales

  // Coordinador y admin ven datos globales (sin filtro de userId)
  const [stats, firstAttemptRate, recentBriefs, briefStatusStats, roleWorkload, generationModeStats] = await Promise.all([
    getValidationStats(undefined, activeChannel),
    getFirstAttemptApprovalRate(undefined, activeChannel),
    getRecentBriefsSummary(undefined, 5, activeChannel),
    getBriefStatusStats(undefined, activeChannel),
    getRoleWorkloadStats(undefined, activeChannel),
    getGenerationModeStats(undefined, activeChannel),
  ])

  const briefsAprobados = briefStatusStats.aprobado + briefStatusStats.aprobado_con_ajustes

  const metricCards = [
    { label: 'Briefings creados',              value: stats.totalBriefs },
    { label: 'Briefings aprobados',            value: briefsAprobados },
    { label: 'Mensajes generados',             value: stats.totalVersions },
    { label: 'Promedio versiones/briefing',    value: stats.avgVersionsPerBrief.toFixed(1) },
  ]

  const briefStatusEntries: Array<{ key: string; label: string; count: number; bar: string }> = [
    { key: 'borrador',           label: 'Borrador',             count: briefStatusStats.borrador,           bar: '#cfc4c5' },
    { key: 'en_revision',        label: 'En revisión',          count: briefStatusStats.en_revision,        bar: '#4c4546' },
    { key: 'aprobado',           label: 'Aprobado',             count: briefStatusStats.aprobado,           bar: '#1b1c1c' },
    { key: 'aprobado_con_ajustes', label: 'Aprobado con ajustes', count: briefStatusStats.aprobado_con_ajustes, bar: '#b08c30' },
    { key: 'rechazado',          label: 'Rechazado',            count: briefStatusStats.rechazado,          bar: '#93000a' },
  ]

  return (
    <div className="px-6 md:px-10 py-8 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-[#1b1c1c]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Dashboard
          </h1>
          <p className="text-sm text-[#4c4546] mt-0.5">
            {activeChannel === 'email'
              ? 'Métricas de Email'
              : activeChannel === 'whatsapp'
              ? 'Métricas de WhatsApp'
              : 'Resumen de actividad del equipo'}
          </p>
        </div>
        <Link
          href="/briefs"
          className="text-sm font-medium text-[#4c4546] hover:text-[#1b1c1c] border border-[#cfc4c5] hover:border-[#1b1c1c] rounded px-4 py-2 transition-all shrink-0"
        >
          ← Briefings
        </Link>
      </div>

      {/* Channel filter */}
      <Suspense fallback={<div className="h-9" />}>
        <DashboardChannelBar />
      </Suspense>

      {/* Metric cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map(({ label, value }) => (
          <div key={label} className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg px-5 py-5">
            <p className="text-xs text-[#4c4546] mb-3">{label}</p>
            <p className="text-3xl font-bold text-[#1b1c1c] tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* First-attempt rate + most-used channel + A/B mode */}
      <div className="grid gap-3 sm:grid-cols-3">

        <div className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg px-5 py-5">
          <p className="text-xs text-[#4c4546] mb-3">Tasa de aprobación en 1.ª versión</p>
          <div className="flex items-end gap-2 mb-3">
            <p className="text-3xl font-bold text-[#1b1c1c] tracking-tight">{firstAttemptRate}%</p>
            <p className="text-xs text-[#7e7576] mb-1">mensajes v1 aprobados</p>
          </div>
          <div className="h-2 w-full rounded-full bg-[#e9e8e7] overflow-hidden">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${firstAttemptRate}%`, background: '#1b1c1c' }}
            />
          </div>
        </div>

        <div className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg px-5 py-5">
          <p className="text-xs text-[#4c4546] mb-3">Canal más usado</p>
          {stats.mostUsedChannel ? (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center text-sm font-semibold px-3 py-1 rounded border bg-[#e9e8e7] text-[#1b1c1c] border-[#cfc4c5]">
                {stats.mostUsedChannel === 'whatsapp' ? '💬 ' : '✉️ '}
                {CHANNEL_LABELS[stats.mostUsedChannel] ?? stats.mostUsedChannel}
              </span>
              <p className="text-xs text-[#7e7576]">de {stats.totalBriefs} briefings</p>
            </div>
          ) : (
            <p className="text-sm text-[#7e7576] mt-1">Sin datos todavía</p>
          )}
        </div>

        <div className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg px-5 py-5">
          <p className="text-xs text-[#4c4546] mb-3">Briefings con test A/B</p>
          {generationModeStats.total === 0 ? (
            <p className="text-sm text-[#7e7576] mt-1">Sin datos todavía</p>
          ) : (
            <>
              <div className="flex items-end gap-2 mb-3">
                <p className="text-3xl font-bold text-[#1b1c1c] tracking-tight">{generationModeStats.ab_test}</p>
                <p className="text-xs text-[#7e7576] mb-1">A/B · {generationModeStats.standard} estándar</p>
              </div>
              <div className="h-2 w-full rounded-full bg-[#e9e8e7] overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.round((generationModeStats.ab_test / generationModeStats.total) * 100)}%`,
                    background: '#1b1c1c',
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Brief status distribution */}
      <div className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e9e8e7]">
          <h2 className="text-sm font-semibold text-[#1b1c1c]">Estado de los briefings creados</h2>
          <p className="text-xs text-[#7e7576] mt-0.5">
            {briefStatusStats.total} briefing{briefStatusStats.total !== 1 ? 's' : ''} en total — cada uno contabilizado según su fase actual
          </p>
        </div>
        <div className="px-6 py-5">
          {briefStatusStats.total === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[#7e7576]">No hay briefings todavía.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {briefStatusEntries.map(({ key, label, count, bar }) => {
                const pct = Math.round((count / briefStatusStats.total) * 100)
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-[#1b1c1c]">{label}</span>
                      <span className="font-semibold tabular-nums text-[#4c4546]">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#e9e8e7] overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${pct}%`, background: bar }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Role workload */}
      <div className="grid gap-3 sm:grid-cols-2">

        {/* Redactor */}
        <div className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e9e8e7]">
            <h2 className="text-sm font-semibold text-[#1b1c1c]">Redactor</h2>
            <p className="text-xs text-[#7e7576] mt-0.5">Tareas de creación y generación</p>
          </div>
          <ul className="divide-y divide-[#f5f3f3]">
            {([
              { label: 'Briefings creados',           value: roleWorkload.redactor.briefingsCreados },
              { label: 'Mensajes generados',           value: roleWorkload.redactor.mensajesGenerados },
              { label: 'Nuevas versiones (v2+)',       value: roleWorkload.redactor.refinamientos },
              { label: 'Pendientes de corrección',     value: roleWorkload.redactor.pendientesCorreccion },
            ] as const).map(({ label, value }) => (
              <li key={label} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-[#4c4546]">{label}</span>
                <span className="text-sm font-semibold tabular-nums text-[#1b1c1c]">{value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Product Manager */}
        <div className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e9e8e7]">
            <h2 className="text-sm font-semibold text-[#1b1c1c]">Product Manager</h2>
            <p className="text-xs text-[#7e7576] mt-0.5">Tareas de revisión y validación</p>
          </div>
          <ul className="divide-y divide-[#f5f3f3]">
            {([
              { label: 'Briefings revisados',          value: roleWorkload.pm.briefingsRevisados },
              { label: 'Aprobados',                    value: roleWorkload.pm.aprobados },
              { label: 'Aprobados con ajustes',        value: roleWorkload.pm.aprobadosConAjustes },
              { label: 'Rechazados',                   value: roleWorkload.pm.rechazados },
            ] as const).map(({ label, value }) => (
              <li key={label} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-[#4c4546]">{label}</span>
                <span className="text-sm font-semibold tabular-nums text-[#1b1c1c]">{value}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Recent activity */}
      <div className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e9e8e7]">
          <h2 className="text-sm font-semibold text-[#1b1c1c]">Actividad reciente</h2>
          <p className="text-xs text-[#7e7576] mt-0.5">Últimos {recentBriefs.length} briefings</p>
        </div>

        {recentBriefs.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-[#7e7576]">No hay briefings todavía.</p>
          </div>
        ) : (
          <ul>
            {recentBriefs.map((brief, idx) => {
              const colors = brief.latestVerdict ? VERDICT_COLORS[brief.latestVerdict] : null
              return (
                <li
                  key={brief.id}
                  className={idx < recentBriefs.length - 1 ? 'border-b border-[#f5f3f3]' : ''}
                >
                  <Link
                    href={`/briefs/${brief.id}`}
                    className="flex items-center justify-between px-6 py-3.5 gap-4 group hover:bg-[#f5f3f3] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono font-semibold text-[#7e7576] shrink-0">
                        {formatBriefNumber(brief.briefNumber)}
                      </span>
                      <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded border bg-[#e9e8e7] text-[#1b1c1c] border-[#cfc4c5] shrink-0">
                        {CHANNEL_LABELS[brief.channel] ?? brief.channel}
                      </span>
                      <p className="text-sm font-medium text-[#1b1c1c] truncate group-hover:text-[#000000] transition-colors">
                        {brief.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      {colors ? (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded border"
                          style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}
                        >
                          {VERDICT_LABELS[brief.latestVerdict!]}
                        </span>
                      ) : (
                        <span className="text-xs text-[#7e7576]">Sin validar</span>
                      )}
                      <span className="text-xs text-[#7e7576]">{formatDate(brief.createdAt)}</span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

    </div>
  )
}
