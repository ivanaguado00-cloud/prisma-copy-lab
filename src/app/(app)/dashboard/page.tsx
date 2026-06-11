import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '../../../auth'
import {
  getValidationStats,
  getFirstAttemptApprovalRate,
  getRecentBriefsSummary,
} from '../../../dao/validationRunDao'

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

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [stats, firstAttemptRate, recentBriefs] = await Promise.all([
    getValidationStats(session.user.id),
    getFirstAttemptApprovalRate(session.user.id),
    getRecentBriefsSummary(session.user.id, 5),
  ])

  const metricCards = [
    { label: 'Briefings creados',         value: stats.totalBriefs },
    { label: 'Mensajes generados',         value: stats.totalVersions },
    { label: 'Validaciones realizadas',    value: stats.totalValidations },
    { label: 'Promedio versiones/brief',   value: stats.avgVersionsPerBrief.toFixed(1) },
  ]

  const verdictEntries = Object.entries(stats.verdicts) as Array<
    [keyof typeof stats.verdicts, number]
  >

  return (
    <div className="px-6 md:px-10 py-8 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#1b1c1c]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Dashboard
          </h1>
          <p className="text-sm text-[#4c4546] mt-0.5">Resumen de actividad del equipo</p>
        </div>
        <Link
          href="/briefs"
          className="text-sm font-medium text-[#4c4546] hover:text-[#1b1c1c] border border-[#cfc4c5] hover:border-[#1b1c1c] rounded px-4 py-2 transition-all"
        >
          ← Briefings
        </Link>
      </div>

      {/* Metric cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map(({ label, value }) => (
          <div key={label} className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg px-5 py-5">
            <p className="text-xs text-[#4c4546] mb-3">{label}</p>
            <p className="text-3xl font-bold text-[#1b1c1c] tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* First-attempt rate + most-used channel */}
      <div className="grid gap-3 sm:grid-cols-2">

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
      </div>

      {/* Verdict distribution */}
      <div className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e9e8e7]">
          <h2 className="text-sm font-semibold text-[#1b1c1c]">Distribución de veredictos</h2>
          <p className="text-xs text-[#7e7576] mt-0.5">
            Basado en {stats.totalValidations} validación{stats.totalValidations !== 1 ? 'es' : ''}
          </p>
        </div>
        <div className="px-6 py-5">
          {stats.totalValidations === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[#7e7576]">No hay validaciones todavía.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {verdictEntries.map(([verdict, count]) => {
                const pct = Math.round((count / stats.totalValidations) * 100)
                const colors = VERDICT_COLORS[verdict] ?? { bar: '#7e7576', text: '#1b1c1c', bg: '#e9e8e7', border: '#cfc4c5' }
                return (
                  <div key={verdict} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-[#1b1c1c]">{VERDICT_LABELS[verdict]}</span>
                      <span className="font-semibold tabular-nums text-[#4c4546]">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#e9e8e7] overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${pct}%`, background: colors.bar }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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
