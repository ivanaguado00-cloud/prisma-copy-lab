import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '../../auth'
import {
  getValidationStats,
  getFirstAttemptApprovalRate,
  getRecentBriefsSummary,
} from '../../dao/validationRunDao'

export const metadata = {
  title: 'Dashboard — PRISMA Copy Lab',
}

const VERDICT_LABELS: Record<string, string> = {
  aprobada: 'Aprobada',
  aprobada_con_ajustes: 'Aprobada con ajustes',
  no_aprobada: 'No aprobada',
}

const VERDICT_BAR: Record<string, { bar: string; text: string }> = {
  aprobada:             { bar: '#10b981', text: '#10b981' },
  aprobada_con_ajustes: { bar: '#f59e0b', text: '#f59e0b' },
  no_aprobada:          { bar: '#ef4444', text: '#ef4444' },
}

const VERDICT_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  aprobada:             { bg: '#052e16', text: '#10b981', border: '#065f46' },
  aprobada_con_ajustes: { bg: '#1c1400', text: '#f59e0b', border: '#92400e' },
  no_aprobada:          { bg: '#1c0000', text: '#ef4444', border: '#7f1d1d' },
}

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
}

const CHANNEL_BADGE: Record<string, string> = {
  whatsapp: 'bg-[#052e16] text-[#34d399] border-[#065f46]',
  email: 'bg-[#1e1b4b] text-[#a5b4fc] border-[#3730a3]',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
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
    { label: 'Briefings creados',          value: stats.totalBriefs,                    icon: '📄' },
    { label: 'Mensajes generados',          value: stats.totalVersions,                  icon: '✍️' },
    { label: 'Validaciones realizadas',     value: stats.totalValidations,               icon: '✓' },
    { label: 'Media versiones / briefing',  value: stats.avgVersionsPerBrief.toFixed(1), icon: '≈' },
  ]

  const verdictEntries = Object.entries(stats.verdicts) as Array<
    [keyof typeof stats.verdicts, number]
  >

  const darkCard = { background: '#0f0f1a', border: '1px solid #1e1e3a' } as const
  const sectionBorder = { borderBottom: '1px solid #1e1e3a' } as const

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold prisma-gradient-text">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Resumen de actividad del equipo</p>
        </div>
        <Link
          href="/briefs"
          className="text-sm font-medium text-slate-400 hover:text-white border border-[#1e1e3a] hover:border-[#7c3aed]/50 rounded-xl px-4 py-2 hover:bg-[#1e1e3a] transition-all"
        >
          ← Briefings
        </Link>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map(({ label, value, icon }) => (
          <div key={label} className="rounded-2xl px-5 py-5 space-y-3" style={darkCard}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-400">{label}</p>
              <span
                className="text-base w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}
              >
                {icon}
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-100 tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* First-attempt rate + most-used channel */}
      <div className="grid gap-4 sm:grid-cols-2">

        <div className="rounded-2xl px-5 py-5 space-y-3" style={darkCard}>
          <p className="text-xs font-medium text-slate-400">Tasa de aprobación en 1.ª versión</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-slate-100 tracking-tight">{firstAttemptRate}%</p>
            <p className="text-xs text-slate-500 mb-1">mensajes v1 aprobados</p>
          </div>
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${firstAttemptRate}%`, background: '#10b981', boxShadow: '0 0 8px #10b98160' }}
            />
          </div>
        </div>

        <div className="rounded-2xl px-5 py-5 space-y-3" style={darkCard}>
          <p className="text-xs font-medium text-slate-400">Canal más usado</p>
          {stats.mostUsedChannel ? (
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center text-sm font-semibold px-3 py-1 rounded-full border ${
                  CHANNEL_BADGE[stats.mostUsedChannel] ?? 'bg-[#1e1e3a] text-slate-300 border-[#1e1e3a]'
                }`}
              >
                {stats.mostUsedChannel === 'whatsapp' ? '💬 ' : '✉️ '}
                {CHANNEL_LABELS[stats.mostUsedChannel] ?? stats.mostUsedChannel}
              </span>
              <p className="text-xs text-slate-500">de {stats.totalBriefs} briefings</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500 mt-1">Sin datos todavía</p>
          )}
        </div>
      </div>

      {/* Verdict distribution */}
      <div className="rounded-2xl overflow-hidden" style={darkCard}>
        <div className="px-6 py-4" style={sectionBorder}>
          <h2 className="text-sm font-semibold text-slate-100">Distribución de veredictos</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Basado en {stats.totalValidations} validación{stats.totalValidations !== 1 ? 'es' : ''}
          </p>
        </div>
        <div className="px-6 py-5">
          {stats.totalValidations === 0 ? (
            <div className="text-center py-8 space-y-2">
              <div className="text-3xl">📊</div>
              <p className="text-sm text-slate-500">No hay validaciones todavía.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {verdictEntries.map(([verdict, count]) => {
                const pct = Math.round((count / stats.totalValidations) * 100)
                const meta = VERDICT_BAR[verdict] ?? { bar: '#94a3b8', text: '#94a3b8' }
                return (
                  <div key={verdict} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-200">{VERDICT_LABELS[verdict]}</span>
                      <span className="font-semibold tabular-nums" style={{ color: meta.text }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${pct}%`, background: meta.bar, boxShadow: `0 0 8px ${meta.bar}60` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="rounded-2xl overflow-hidden" style={darkCard}>
        <div className="px-6 py-4" style={sectionBorder}>
          <h2 className="text-sm font-semibold text-slate-100">Actividad reciente</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Últimos {recentBriefs.length} briefings
          </p>
        </div>

        {recentBriefs.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-slate-500">No hay briefings todavía.</p>
          </div>
        ) : (
          <ul>
            {recentBriefs.map((brief, idx) => {
              const badge = brief.latestVerdict ? VERDICT_BADGE[brief.latestVerdict] : null
              return (
                <li
                  key={brief.id}
                  style={idx < recentBriefs.length - 1 ? { borderBottom: '1px solid #1a1a2e' } : {}}
                >
                  <Link
                    href={`/briefs/${brief.id}`}
                    className="flex items-center justify-between px-6 py-3.5 gap-4 group hover:bg-[#1a1a2e] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${
                          CHANNEL_BADGE[brief.channel] ?? 'bg-[#1e1e3a] text-slate-400 border-[#1e1e3a]'
                        }`}
                      >
                        {CHANNEL_LABELS[brief.channel] ?? brief.channel}
                      </span>
                      <p className="text-sm font-medium text-slate-300 truncate group-hover:text-white transition-colors">
                        {brief.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      {badge ? (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full border"
                          style={{ background: badge.bg, color: badge.text, borderColor: badge.border }}
                        >
                          {VERDICT_LABELS[brief.latestVerdict!]}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">Sin validar</span>
                      )}
                      <span className="text-xs text-slate-500">{formatDate(brief.createdAt)}</span>
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
