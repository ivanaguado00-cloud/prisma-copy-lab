import type { SendMetricsTotals } from '../../types/domain'

interface Props {
  totals: SendMetricsTotals
}

interface FunnelStep {
  label: string
  value: number
  pct: number
  color: string
  description: string
}

function pct(part: number, whole: number): number {
  if (whole === 0) return 0
  return Math.round((part / whole) * 1000) / 10
}

function formatNum(n: number): string {
  return new Intl.NumberFormat('es-ES').format(n)
}

export function ConversionFunnel({ totals }: Props) {
  const steps: FunnelStep[] = [
    {
      label: 'Enviados',
      value: totals.sentCount,
      pct: 100,
      color: '#1b1c1c',
      description: 'Total de mensajes enviados al canal',
    },
    {
      label: 'Entregados',
      value: totals.deliveredCount,
      pct: pct(totals.deliveredCount, totals.sentCount),
      color: '#4c4546',
      description: 'Sobre enviados',
    },
    {
      label: 'Abiertos',
      value: totals.opensCount,
      pct: pct(totals.opensCount, totals.deliveredCount),
      color: '#7e7576',
      description: 'Sobre entregados · interés inicial',
    },
    {
      label: 'Clics',
      value: totals.clicksCount,
      pct: pct(totals.clicksCount, totals.opensCount),
      color: '#b08c30',
      description: 'Sobre abiertos · evaluación de CTA',
    },
    {
      label: 'Leads reactivados',
      value: totals.leadsReactivated,
      pct: pct(totals.leadsReactivated, totals.clicksCount),
      color: '#2e6e4e',
      description: 'Sobre clics · respuesta cualificada',
    },
    {
      label: 'Matrículas',
      value: totals.enrollments,
      pct: pct(totals.enrollments, totals.leadsReactivated),
      color: '#1b6639',
      description: 'Sobre leads · conversión final',
    },
  ]

  const maxWidth = totals.sentCount > 0 ? totals.sentCount : 1

  return (
    <div>
      {/* Rebotes */}
      {totals.bouncedCount > 0 && (
        <div className="mb-3 flex items-center gap-2 text-xs text-[#93000a]">
          <span className="inline-block w-2 h-2 rounded-full bg-[#ffdad6] border border-[#ffb4ab]" />
          <span>
            <strong>{formatNum(totals.bouncedCount)}</strong> rebotes (
            {pct(totals.bouncedCount, totals.sentCount)}% sobre enviados)
          </span>
        </div>
      )}

      <div className="space-y-3">
        {steps.map((step, idx) => (
          <div key={step.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#7e7576] w-4">{idx + 1}</span>
                <span className="font-medium text-[#1b1c1c]">{step.label}</span>
                <span className="text-xs text-[#7e7576]">· {step.description}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-semibold tabular-nums text-[#1b1c1c]">
                  {formatNum(step.value)}
                </span>
                <span className="text-xs tabular-nums text-[#7e7576] w-10 text-right">
                  {step.pct}%
                </span>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-[#e9e8e7] overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${totals.sentCount > 0 ? Math.round((step.value / maxWidth) * 100) : 0}%`,
                  background: step.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
