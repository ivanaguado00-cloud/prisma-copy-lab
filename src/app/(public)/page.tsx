import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  Download,
  FileText,
  Lightbulb,
  ListChecks,
  Percent,
  Plus,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { auth } from '../../auth'
import { getHomeData, type HomeActivityItem, type HomeAlert, type HomeChartPoint, type HomePeriod } from '../../services/homeService'

export const metadata = {
  title: 'Inicio — PRISMA Copy Lab',
  description: 'Vista rápida de estado operativo y accesos principales',
}

type SearchParams = Promise<{ period?: string }>

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { period } = await searchParams
  const activePeriod: HomePeriod = period === '7d' ? '7d' : '30d'
  const home = await getHomeData({
    userId: session.user.id,
    role: session.user.role,
    period: activePeriod,
  })

  const role = session.user.role

  // ── Accesos rápidos según rol ─────────────────────────────────────────────
  const quickActions =
    role === 'redactor'
      ? [
          { label: 'Crear nuevo briefing', href: '/briefs/new', icon: Plus },
          { label: 'Ver mis briefings', href: '/briefs', icon: ListChecks },
          { label: 'Continuar borrador', href: '/briefs?status=pending', icon: FileText },
          { label: 'Ver pendientes de corrección', href: '/briefs?status=rejected', icon: CheckCircle },
        ]
      : role === 'pm'
      ? [
          { label: 'Revisiones pendientes', href: '/briefs?status=submitted', icon: CheckCircle },
          { label: 'Ver todos los briefings', href: '/briefs', icon: ListChecks },
          { label: 'Ver títulos', href: '/titulos', icon: FileText },
          { label: 'Ir a análisis', href: '/analisis', icon: BarChart3 },
          { label: 'Editar descuentos', href: '/titulos', icon: Percent },
          { label: 'Revisar casos de éxito', href: '/analisis', icon: Trophy },
        ]
      : [
          { label: 'Crear nuevo briefing', href: '/briefs/new', icon: Plus },
          { label: 'Ver briefings pendientes', href: '/briefs', icon: ListChecks },
          { label: 'Ir a análisis', href: home.canOpenAnalytics ? '/analisis' : '/dashboard', icon: BarChart3 },
          { label: 'Ver títulos', href: '/titulos', icon: FileText },
          { label: 'Revisar casos de éxito', href: '/analisis', icon: Trophy },
          { label: 'Exportar informe', href: '/analisis', icon: Download },
        ]

  // ── Subtítulo según rol ────────────────────────────────────────────────────
  const roleSubtitle =
    role === 'redactor'
      ? 'Crea, continúa y envía tus briefings de captación.'
      : role === 'pm'
      ? 'Revisiones pendientes, gestión de títulos y análisis de rendimiento.'
      : 'Estado general de Prisma Copy Lab y accesos rápidos a los módulos principales.'

  return (
    <main className="mx-auto w-full max-w-[1280px] px-6 py-8 md:px-16 space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-outline">
            {role === 'redactor' ? 'Mis briefings' : role === 'pm' ? 'Product Manager' : 'Control operativo'}
          </p>
          <h1
            className="mt-2 text-3xl font-bold text-on-surface"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Inicio
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {roleSubtitle}
          </p>
        </div>

        <div className="inline-flex w-fit rounded border border-outline-variant bg-surface-container-lowest p-1">
          {[
            { label: 'Últimos 7 días', value: '7d' },
            { label: 'Últimos 30 días', value: '30d' },
          ].map((option) => (
            <Link
              key={option.value}
              href={`/?period=${option.value}`}
              className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                home.period === option.value
                  ? 'bg-on-surface text-primary-foreground'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {home.operationalCards.map((card) => (
          <div key={card.label} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-4">
            <p className="text-xs text-on-surface-variant">{card.label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-on-surface">{formatNumber(card.value)}</p>
            <p className="mt-1 text-xs text-outline">{card.helper}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Rendimiento rápido" subtitle={home.period === '7d' ? 'Últimos 7 días' : 'Últimos 30 días'}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: 'Envíos', value: formatNumber(home.performanceTotals.sentCount) },
              { label: 'Aperturas', value: formatNumber(home.performanceTotals.opensCount) },
              { label: 'Clics', value: formatNumber(home.performanceTotals.clicksCount) },
              { label: 'Leads react.', value: formatNumber(home.performanceTotals.leadsReactivated) },
              { label: 'Matrículas', value: formatNumber(home.performanceTotals.enrollments) },
              { label: 'Ingresos', value: formatCurrency(home.performanceTotals.revenueReal) },
            ].map((metric) => (
              <div key={metric.label} className="rounded border border-outline-variant bg-surface-container-low px-4 py-3">
                <p className="text-xs text-on-surface-variant">{metric.label}</p>
                <p className="mt-1 text-xl font-bold text-on-surface">{metric.value}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Insight destacado" icon={<Lightbulb className="h-4 w-4" aria-hidden="true" />}>
          <div className="flex h-full flex-col justify-between gap-4">
            <p className="text-base font-semibold leading-relaxed text-on-surface">{home.insight}</p>
            <Link
              href={home.canOpenAnalytics ? '/analisis' : '/dashboard'}
              className="inline-flex w-fit items-center gap-2 rounded border border-on-surface px-3 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"
            >
              Ver detalle <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
        <Panel title="Gráfico principal" subtitle="Mensajes, envíos y clics">
          <HomeChart series={home.chartSeries} />
        </Panel>

        <Panel title="Actividad reciente">
          {home.recentActivity.length > 0 ? (
            <ol className="space-y-3">
              {home.recentActivity.map((item) => (
                <ActivityRow key={`${item.label}-${item.href}-${item.date.toISOString()}`} item={item} />
              ))}
            </ol>
          ) : (
            <EmptyState text="Todavía no hay actividad reciente para mostrar." />
          )}
        </Panel>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1fr]">
        <Panel title="Accesos rápidos">
          <div className="grid gap-2 sm:grid-cols-2">
            {quickActions.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="inline-flex items-center justify-between gap-3 rounded border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-on-surface hover:bg-surface-container-low"
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </span>
                <ArrowRight className="h-4 w-4 text-outline" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Alertas y avisos" icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}>
          <div className="space-y-2">
            {home.alerts.map((alert) => (
              <AlertRow key={alert.label} alert={alert} />
            ))}
          </div>
        </Panel>
      </section>
    </main>
  )
}

function Panel({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-outline-variant bg-surface-container-lowest">
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-5 py-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-semibold text-on-surface">{title}</h2>
        </div>
        {subtitle && <p className="text-xs text-outline">{subtitle}</p>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function ActivityRow({ item }: { item: HomeActivityItem }) {
  return (
    <li className="grid grid-cols-[10px_1fr_auto] items-start gap-3">
      <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${toneClass(item.tone)}`} />
      <div className="min-w-0">
        <Link href={item.href} className="text-sm font-semibold text-on-surface hover:underline">
          {item.label}
        </Link>
        <p className="truncate text-sm text-on-surface-variant">{item.detail}</p>
      </div>
      <time className="text-xs text-outline">{formatShortDate(item.date)}</time>
    </li>
  )
}

function AlertRow({ alert }: { alert: HomeAlert }) {
  return (
    <div className={`rounded border px-4 py-3 text-sm ${alertToneClass(alert.tone)}`}>
      {alert.label}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded border border-dashed border-outline-variant bg-surface-container-low px-4 py-8 text-center text-sm text-outline">
      {text}
    </div>
  )
}

function HomeChart({ series }: { series: HomeChartPoint[] }) {
  const width = 720
  const height = 220
  const padding = { top: 18, right: 18, bottom: 34, left: 42 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const maxValue = Math.max(...series.flatMap((point) => [point.messages, point.sends, point.clicks]), 1)

  const x = (index: number) => padding.left + (series.length <= 1 ? chartWidth / 2 : (index / (series.length - 1)) * chartWidth)
  const y = (value: number) => padding.top + chartHeight - (value / maxValue) * chartHeight

  const messagePath = buildPath(series.map((point, index) => [x(index), y(point.messages)]))
  const sendPath = buildPath(series.map((point, index) => [x(index), y(point.sends)]))
  const clickPath = buildPath(series.map((point, index) => [x(index), y(point.clicks)]))

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-outline">
        <Legend color="#1b1c1c" label="Mensajes generados" />
        <Legend color="#7c5c0a" label="Envíos" />
        <Legend color="#1a6639" label="Clics" />
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Evolución rápida de actividad">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const gridY = padding.top + chartHeight * (1 - ratio)
          return (
            <g key={ratio}>
              <line x1={padding.left} y1={gridY} x2={width - padding.right} y2={gridY} stroke="#e9e8e7" />
              <text x={padding.left - 8} y={gridY + 4} textAnchor="end" fontSize="10" fill="#7e7576">
                {Math.round(maxValue * ratio).toLocaleString('es-ES')}
              </text>
            </g>
          )
        })}
        <path d={sendPath} fill="none" stroke="#7c5c0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={messagePath} fill="none" stroke="#1b1c1c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={clickPath} fill="none" stroke="#1a6639" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {series.map((point, index) => (
          <text
            key={`${point.label}-${index}`}
            x={x(index)}
            y={height - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#7e7576"
          >
            {series.length > 10 && index % 4 !== 0 ? '' : point.label}
          </text>
        ))}
      </svg>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

function buildPath(points: number[][]): string {
  return points
    .map((point, index) => {
      const [pointX = 0, pointY = 0] = point
      return `${index === 0 ? 'M' : 'L'} ${pointX.toFixed(1)} ${pointY.toFixed(1)}`
    })
    .join(' ')
}

function toneClass(tone: HomeActivityItem['tone']): string {
  const classes = {
    neutral: 'bg-outline',
    success: 'bg-on-success-container',
    warning: 'bg-on-warning-container',
    danger: 'bg-on-error-container',
  }
  return classes[tone]
}

function alertToneClass(tone: HomeAlert['tone']): string {
  const classes = {
    neutral: 'border-outline-variant bg-surface-container-low text-on-surface-variant',
    success: 'border-[#b2dfcc] bg-success-container text-on-success-container',
    warning: 'border-[#e8d68a] bg-warning-container text-on-warning-container',
    danger: 'border-[#ffb4ab] bg-error-container text-on-error-container',
  }
  return classes[tone]
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-ES').format(value)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
  }).format(date)
}
