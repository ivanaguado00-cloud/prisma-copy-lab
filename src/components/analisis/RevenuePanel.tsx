import type { SendMetricsTotals, ProgramBreakdown } from '../../types/domain'

interface Props {
  totals: SendMetricsTotals
  programs: ProgramBreakdown[]
}

function formatEur(n: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n)
}

export function RevenuePanel({ totals, programs }: Props) {
  const discountSaved = totals.revenueOfficial - totals.revenueReal
  const avgDiscountPct =
    totals.revenueOfficial > 0
      ? Math.round((discountSaved / totals.revenueOfficial) * 100)
      : 0

  return (
    <div className="bg-[#e3f5ec] border border-[#b2dfcc] rounded-lg p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <p className="text-xs font-semibold text-[#1a6639] uppercase tracking-wider mb-1">
            Ingresos generados
          </p>
          <p className="text-4xl font-bold text-[#1a6639] tracking-tight">
            {formatEur(totals.revenueReal)}
          </p>
          <p className="text-xs text-[#1a6639] mt-1">
            Con precios y descuentos vigentes en el momento de la conversión
          </p>
        </div>
        {totals.revenueOfficial > 0 && (
          <div className="text-right">
            <p className="text-xs text-[#1a6639] mb-0.5">Sin descuentos habría sido</p>
            <p className="text-xl font-semibold text-[#1a6639] line-through opacity-50">
              {formatEur(totals.revenueOfficial)}
            </p>
            {avgDiscountPct > 0 && (
              <p className="text-xs text-[#1a6639] mt-0.5">
                Descuento medio aplicado: {avgDiscountPct}%
              </p>
            )}
          </div>
        )}
      </div>

      {programs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {programs.slice(0, 4).map((prog) => (
            <div
              key={prog.program}
              className="bg-[#ffffff] rounded border border-[#b2dfcc] px-3 py-2.5"
            >
              <p className="text-xs text-[#4c4546] truncate mb-0.5">{prog.program}</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[#1b1c1c]">
                  {formatEur(prog.revenueReal)}
                </span>
                <span className="text-xs text-[#7e7576]">
                  {prog.enrollments} matrícula{prog.enrollments !== 1 ? 's' : ''}
                </span>
              </div>
              {prog.revenueOfficial > prog.revenueReal && (
                <p className="text-xs text-[#7e7576] mt-0.5">
                  Tarifa oficial: {formatEur(prog.revenueOfficial)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
