import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '../../auth'
import { getValidationStats } from '../../dao/validationRunDao'

export const metadata = {
  title: 'Dashboard — PRISMA Copy Lab',
}

const VERDICT_LABELS: Record<string, string> = {
  aprobada: 'Aprobada',
  aprobada_con_ajustes: 'Aprobada con ajustes',
  no_aprobada: 'No aprobada',
}

const VERDICT_BAR: Record<string, { bar: string; text: string; bg: string }> = {
  aprobada:          { bar: '#10b981', text: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  aprobada_con_ajustes: { bar: '#f59e0b', text: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  no_aprobada:       { bar: '#ef4444', text: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const stats = await getValidationStats(session.user.id)

  const metricCards = [
    { label: 'Briefings creados',           value: stats.totalBriefs,                     icon: '📄' },
    { label: 'Mensajes generados',           value: stats.totalVersions,                   icon: '✍️' },
    { label: 'Validaciones realizadas',      value: stats.totalValidations,                icon: '✓' },
    { label: 'Media versiones / briefing',   value: stats.avgVersionsPerBrief.toFixed(1),  icon: '≈' },
  ]

  const verdictEntries = Object.entries(stats.verdicts) as Array<
    [keyof typeof stats.verdicts, number]
  >

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold prisma-gradient-text">Dashboard</h1>
          <p className="text-sm text-[#94a3b8] mt-1">Resumen de actividad del equipo</p>
        </div>
        <Link
          href="/briefs"
          className="text-sm font-medium text-[#94a3b8] hover:text-white border border-[#1e1e3a] hover:border-[#7c3aed]/50 rounded-xl px-4 py-2 hover:bg-[#1e1e3a] transition-all"
        >
          ← Briefings
        </Link>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map(({ label, value, icon }) => (
          <div
            key={label}
            className="rounded-2xl px-5 py-5 space-y-3 transition-all"
            style={{
              background: '#0f0f1a',
              border: '1px solid #1e1e3a',
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[#94a3b8]">{label}</p>
              <span
                className="text-base w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}
              >
                {icon}
              </span>
            </div>
            <p className="text-3xl font-bold text-[#e2e8f0] tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* Verdict distribution */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#0f0f1a', border: '1px solid #1e1e3a' }}
      >
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #1e1e3a' }}>
          <h2 className="text-sm font-semibold text-[#e2e8f0]">Distribución de veredictos</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Basado en {stats.totalValidations} validación{stats.totalValidations !== 1 ? 'es' : ''}
          </p>
        </div>

        <div className="px-6 py-5">
          {stats.totalValidations === 0 ? (
            <div className="text-center py-8 space-y-2">
              <div className="text-3xl">📊</div>
              <p className="text-sm text-[#94a3b8]">No hay validaciones todavía.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {verdictEntries.map(([verdict, count]) => {
                const pct = Math.round((count / stats.totalValidations) * 100)
                const meta = VERDICT_BAR[verdict] ?? { bar: '#94a3b8', text: '#94a3b8', bg: 'rgba(148,163,184,0.1)' }
                return (
                  <div key={verdict} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-[#e2e8f0]">
                        {VERDICT_LABELS[verdict]}
                      </span>
                      <span className="font-semibold tabular-nums" style={{ color: meta.text }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div
                      className="h-2 w-full rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
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

    </div>
  )
}
