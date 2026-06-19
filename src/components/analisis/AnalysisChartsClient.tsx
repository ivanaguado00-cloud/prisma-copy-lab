'use client'

import type { WeeklyDataPoint, ChannelBreakdown, ProgramBreakdown } from '../../types/domain'

// ── Line chart (SVG, no external deps) ───────────────────────────────────────

interface LineSeries {
  name: string
  values: number[]
  color: string
  dashed?: boolean
}

function LineChart({ labels, series }: { labels: string[]; series: LineSeries[] }) {
  const W = 540
  const H = 160
  const pad = { top: 12, right: 12, bottom: 28, left: 40 }
  const chartW = W - pad.left - pad.right
  const chartH = H - pad.top - pad.bottom
  const allVals = series.flatMap((s) => s.values)
  const maxVal = Math.max(...allVals, 1)
  const n = labels.length

  const xScale = (i: number) => pad.left + (n <= 1 ? chartW / 2 : (i / (n - 1)) * chartW)
  const yScale = (v: number) => pad.top + chartH - (v / maxVal) * chartH

  const gridLines = [0, 0.25, 0.5, 0.75, 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden="true">
      {/* Grid */}
      {gridLines.map((pct) => {
        const y = pad.top + chartH * (1 - pct)
        return (
          <g key={pct}>
            <line
              x1={pad.left} y1={y}
              x2={pad.left + chartW} y2={y}
              stroke="#e9e8e7" strokeWidth="1"
            />
            <text x={pad.left - 4} y={y + 4} textAnchor="end" fontSize="10" fill="#7e7576">
              {pct === 0 ? '0' : Math.round(maxVal * pct).toLocaleString('es-ES')}
            </text>
          </g>
        )
      })}
      {/* Series */}
      {series.map(({ name, values, color, dashed }) => {
        const points = values.map((v, i) => `${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ')
        return (
          <polyline
            key={name}
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={dashed ? '5 3' : undefined}
          />
        )
      })}
      {/* Dots */}
      {series.map(({ name, values, color }) =>
        values.map((v, i) => (
          <circle
            key={`${name}-${i}`}
            cx={xScale(i)}
            cy={yScale(v)}
            r="3"
            fill={color}
          />
        )),
      )}
      {/* X labels */}
      {labels.map((label, i) => (
        <text
          key={label}
          x={xScale(i)}
          y={H - 4}
          textAnchor="middle"
          fontSize="10"
          fill="#7e7576"
        >
          {label}
        </text>
      ))}
    </svg>
  )
}

// ── Bar chart (CSS Flexbox) ───────────────────────────────────────────────────

interface BarDatum {
  label: string
  value: number
  color: string
  sublabel?: string
}

function BarChart({ bars, height = 140 }: { bars: BarDatum[]; height?: number }) {
  const maxVal = Math.max(...bars.map((b) => b.value), 1)
  const innerH = height - 48 // leave room for label + value

  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {bars.map(({ label, value, color, sublabel }) => {
        const barH = Math.max(Math.round((value / maxVal) * innerH), value > 0 ? 2 : 0)
        return (
          <div key={label} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className="text-xs font-semibold text-[#1b1c1c] tabular-nums">
              {value > 999 ? `${(value / 1000).toFixed(1)}k` : value}
            </span>
            <div
              className="w-full rounded-t transition-all"
              style={{ height: barH, background: color, minHeight: value > 0 ? 2 : 0 }}
            />
            <span className="text-[10px] text-[#7e7576] text-center leading-tight truncate w-full text-center">
              {label}
            </span>
            {sublabel && (
              <span className="text-[9px] text-[#7e7576]">{sublabel}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Exported chart panels ─────────────────────────────────────────────────────

interface TimelineChartProps {
  series: WeeklyDataPoint[]
}

export function TimelineChartClient({ series }: TimelineChartProps) {
  if (series.length === 0) {
    return <EmptyChart />
  }

  const labels = series.map((s) => s.label.replace(/^\d{4}-/, ''))

  const lineSeries = [
    { name: 'Aperturas', values: series.map((s) => s.opens),  color: '#4c4546' },
    { name: 'Clics',     values: series.map((s) => s.clicks), color: '#b08c30' },
    { name: 'Matrículas', values: series.map((s) => s.enrollments * 10), color: '#1b6639', dashed: true },
  ]

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-2 text-xs text-[#7e7576]">
        {[
          { color: '#4c4546', label: 'Aperturas' },
          { color: '#b08c30', label: 'Clics' },
          { color: '#1b6639', label: 'Matrículas (×10)', dashed: true },
        ].map(({ color, label, dashed }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span
              className="inline-block w-6 border-t-2"
              style={{
                borderColor: color,
                borderStyle: dashed ? 'dashed' : 'solid',
              }}
            />
            {label}
          </span>
        ))}
      </div>
      <LineChart labels={labels} series={lineSeries} />
    </div>
  )
}

interface ChannelChartProps {
  breakdown: ChannelBreakdown[]
}

const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: '#1b6639',
  email:    '#1b1c1c',
}

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email:    'Email',
}

export function ChannelChartClient({ breakdown }: ChannelChartProps) {
  if (breakdown.length === 0) {
    return <EmptyChart />
  }

  const metrics: Array<{ key: keyof ChannelBreakdown; label: string }> = [
    { key: 'opensCount',      label: 'Aperturas' },
    { key: 'clicksCount',     label: 'Clics' },
    { key: 'enrollments',     label: 'Matrículas' },
  ]

  return (
    <div className="space-y-4">
      {metrics.map(({ key, label }) => {
        const bars: BarDatum[] = breakdown.map((ch) => ({
          label: CHANNEL_LABELS[ch.channel] ?? ch.channel,
          value: ch[key] as number,
          color: CHANNEL_COLORS[ch.channel] ?? '#7e7576',
        }))
        return (
          <div key={key}>
            <p className="text-xs text-[#7e7576] mb-1">{label}</p>
            <BarChart bars={bars} height={80} />
          </div>
        )
      })}
    </div>
  )
}

interface ProgramChartProps {
  programs: ProgramBreakdown[]
}

export function ProgramChartClient({ programs }: ProgramChartProps) {
  if (programs.length === 0) {
    return <EmptyChart />
  }

  const maxRev = Math.max(...programs.map((p) => p.revenueReal), 1)

  return (
    <div className="space-y-3">
      {programs.slice(0, 6).map((prog, idx) => {
        const pct = Math.round((prog.revenueReal / maxRev) * 100)
        const shade = idx === 0 ? '#1b1c1c' : idx === 1 ? '#4c4546' : '#7e7576'
        return (
          <div key={prog.program} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#1b1c1c] font-medium truncate max-w-[60%]">{prog.program}</span>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-[#7e7576]">{prog.enrollments} mat.</span>
                <span className="text-sm font-semibold text-[#1b1c1c] tabular-nums">
                  {formatEur(prog.revenueReal)}
                </span>
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#e9e8e7] overflow-hidden">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${pct}%`, background: shade }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface RevenueChartProps {
  series: WeeklyDataPoint[]
}

export function RevenueChartClient({ series }: RevenueChartProps) {
  if (series.length === 0) {
    return <EmptyChart />
  }

  // Compute cumulative
  let cumReal = 0
  const cumSeries = series.map((s) => {
    cumReal += s.revenue
    return { label: s.label.replace(/^\d{4}-/, ''), value: Math.round(cumReal) }
  })

  const bars: BarDatum[] = cumSeries.map((s) => ({
    label: s.label,
    value: s.value,
    color: '#1b1c1c',
  }))

  return (
    <div>
      <p className="text-xs text-[#7e7576] mb-2">Ingresos acumulados por semana (€)</p>
      <BarChart bars={bars} height={160} />
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-32 text-sm text-[#7e7576]">
      Sin datos suficientes para mostrar el gráfico
    </div>
  )
}

function formatEur(n: number): string {
  if (n === 0) return '0 €'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k €`
  return `${n} €`
}
