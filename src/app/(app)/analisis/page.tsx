import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '../../../auth'
import { canAccessAnalytics } from '../../../types/domain'
import {
  listSendMetrics,
  listSuccessCases,
  computeTotals,
  computeWeeklySeries,
  computeChannelBreakdown,
  computeProgramBreakdown,
} from '../../../dao/sendMetricsDao'
import { AnalysisFilterBar } from '../../../components/analisis/AnalysisFilterBar'
import { ConversionFunnel } from '../../../components/analisis/ConversionFunnel'
import { RevenuePanel } from '../../../components/analisis/RevenuePanel'
import {
  TimelineChartClient,
  ChannelChartClient,
  ProgramChartClient,
  RevenueChartClient,
} from '../../../components/analisis/AnalysisChartsClient'
import { ABComparatorClient } from '../../../components/analisis/ABComparatorClient'
import { SendMetricMessageView } from '../../../components/analisis/SendMetricMessageView'
import { LearningMemoryPanel } from '../../../components/analisis/LearningMemoryPanel'

export const metadata = {
  title: 'Análisis — PRISMA Copy Lab',
}

type SearchParams = Promise<{
  channel?: string
  dateRange?: string
  briefIds?: string   // comma-separated briefIds; absent = todos
}>

function resolveDateFilter(range: string | undefined): { dateFrom?: Date; dateTo?: Date } {
  const now = new Date()
  switch (range) {
    case '7d':
      return { dateFrom: daysAgo(now, 7) }
    case '90d':
      return { dateFrom: daysAgo(now, 90) }
    case 'month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      return { dateFrom: from }
    }
    case 'all':
      return {}
    case '30d':
    default:
      return { dateFrom: daysAgo(now, 30) }
  }
}

function daysAgo(from: Date, days: number): Date {
  const d = new Date(from)
  d.setDate(d.getDate() - days)
  return d
}

export default async function AnalisisPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (!canAccessAnalytics(session.user.role)) redirect('/briefs')

  const { channel, dateRange, briefIds } = await searchParams
  const dateFilter = resolveDateFilter(dateRange)

  // Parse comma-separated briefIds from URL
  const selectedBriefIds = briefIds ? briefIds.split(',').filter(Boolean) : []

  const [allSends, successCases] = await Promise.all([
    listSendMetrics({ channel, ...dateFilter }),
    listSuccessCases(),
  ])

  // activeSends = the dataset that drives ALL metric panels.
  // If the user selected specific briefIds, narrow to those; otherwise use all.
  const activeSends = selectedBriefIds.length > 0
    ? allSends.filter((s: (typeof allSends)[0]) => selectedBriefIds.includes(s.briefId))
    : allSends

  const totals           = computeTotals(activeSends)
  const weeklySeries     = computeWeeklySeries(activeSends)
  const channelBreakdown = computeChannelBreakdown(activeSends)
  const programBreakdown = computeProgramBreakdown(activeSends)

  // Message view: only available when exactly one send is active
  const selectedSend = activeSends.length === 1 ? activeSends[0] : null

  return (
    <div className="px-6 md:px-10 py-8 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-[#1b1c1c]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Análisis y rendimiento
        </h1>
        <p className="text-sm text-[#4c4546] mt-0.5">
          Métricas de envíos, conversión e ingresos generados por las comunicaciones de Prisma Copy Lab
        </p>
      </div>

      {/* Filters (client component — URL-based, no full page reload) */}
      <Suspense fallback={<div className="h-9" />}>
        <AnalysisFilterBar
          sends={allSends}
          totalSends={allSends.length}
          selectedBriefIds={selectedBriefIds}
        />
      </Suspense>

      {/* Empty state */}
      {allSends.length === 0 ? (
        <div className="bg-[#ffffff] border border-dashed border-[#cfc4c5] rounded-lg px-6 py-16 text-center space-y-3">
          <p className="text-base font-medium text-[#1b1c1c]">Sin datos de envíos todavía</p>
          <p className="text-sm text-[#7e7576]">
            Los datos de análisis aparecen aquí cuando se registran métricas de envío vinculadas a briefings aprobados.
          </p>
        </div>
      ) : (
        <>
          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Enviados',     value: formatNum(totals.sentCount) },
              { label: 'Entregados',   value: formatNum(totals.deliveredCount) },
              { label: 'Abiertos',     value: formatNum(totals.opensCount) },
              { label: 'Clics',        value: formatNum(totals.clicksCount) },
              { label: 'Leads react.', value: formatNum(totals.leadsReactivated) },
              { label: 'Matrículas',   value: formatNum(totals.enrollments) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg px-4 py-4"
              >
                <p className="text-xs text-[#7e7576] mb-2">{label}</p>
                <p className="text-2xl font-bold text-[#1b1c1c] tracking-tight">{value}</p>
              </div>
            ))}
          </div>

          {/* Revenue */}
          {totals.revenueReal > 0 && (
            <RevenuePanel totals={totals} programs={programBreakdown} />
          )}

          {/* Funnel */}
          <Section title="Funnel de conversión">
            <ConversionFunnel totals={totals} />
          </Section>

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Section title="Evolución temporal" compact>
              <TimelineChartClient series={weeklySeries} />
            </Section>
            <Section title="Ingresos acumulados" compact>
              <RevenueChartClient series={weeklySeries} />
            </Section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Section title="Conversión por canal" compact>
              <ChannelChartClient breakdown={channelBreakdown} />
            </Section>
            <Section title="Conversión por programa" compact>
              <ProgramChartClient programs={programBreakdown} />
            </Section>
          </div>

          {/* Message view — only when exactly ONE send is selected */}
          {selectedSend && (
            <Section title={`Mensaje enviado — ${selectedSend.brief.title}`}>
              <SendMetricMessageView send={selectedSend} />
            </Section>
          )}

          {/* A/B Comparator — always uses the full filtered list for flexible comparison */}
          {allSends.length >= 2 && (
            <Section title="Comparador A/B">
              <ABComparatorClient sends={allSends} />
            </Section>
          )}

          {/* Learning memory */}
          <Section
            title="Memoria de aprendizaje"
            subtitle={`${successCases.length} caso${successCases.length !== 1 ? 's' : ''} de éxito guardado${successCases.length !== 1 ? 's' : ''}`}
          >
            <LearningMemoryPanel cases={successCases} />
          </Section>
        </>
      )}
    </div>
  )
}

// ── Small layout helpers ──────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  compact = false,
  children,
}: {
  title: string
  subtitle?: string
  compact?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg overflow-hidden">
      <div className={`px-5 border-b border-[#e9e8e7] ${compact ? 'py-3' : 'py-4'}`}>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[#1b1c1c]">{title}</h2>
          {subtitle && <span className="text-xs text-[#7e7576]">{subtitle}</span>}
        </div>
      </div>
      <div className={compact ? 'px-5 py-4' : 'px-5 py-5'}>{children}</div>
    </div>
  )
}

function formatNum(n: number): string {
  return new Intl.NumberFormat('es-ES').format(n)
}
