import Link from 'next/link'
import { buttonVariants } from '../ui/button'
import type { Program } from '../../types/domain'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(value: number | null): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}

function formatPercent(value: number | null): string {
  if (value == null) return '—'
  return `${value}%`
}

function formatDate(value: Date | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg overflow-hidden">
      <div className="px-5 py-3 border-b border-[#e9e8e7]">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#7e7576]">{title}</h2>
      </div>
      <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {children}
      </div>
    </div>
  )
}

function DataField({
  label,
  value,
  wide,
}: {
  label: string
  value: string | number | null | undefined
  wide?: boolean
}) {
  const display = value == null || value === '' ? '—' : String(value)
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <p className="text-xs text-[#7e7576] mb-0.5">{label}</p>
      <p className="text-sm text-[#1b1c1c] whitespace-pre-wrap">{display}</p>
    </div>
  )
}

function DiscountBadge({ program }: { program: Program }) {
  const now = new Date()
  const from = program.discountValidFrom ? new Date(program.discountValidFrom) : null
  const to   = program.discountValidTo   ? new Date(program.discountValidTo)   : null

  const isActive =
    program.activeDiscount != null &&
    (from == null || from <= now) &&
    (to == null   || to >= now)

  if (!isActive) return null

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#e3f5ec] text-[#1a6639]">
      {program.activeDiscount}% activo
      {(from || to) && (
        <span className="font-normal opacity-80">
          · {from ? formatDate(from) : '∞'} – {to ? formatDate(to) : '∞'}
        </span>
      )}
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  program: Program
  canEdit: boolean
}

export function ProgramDetail({ program, canEdit }: Props) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[#7e7576] mb-1">{program.school}</p>
          <h1
            className="text-2xl font-bold text-[#1b1c1c]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {program.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <DiscountBadge program={program} />
            {program.modality && (
              <span className="text-xs text-[#7e7576] bg-[#f5f3f3] border border-[#e9e8e7] rounded-full px-2.5 py-0.5">
                {program.modality}
              </span>
            )}
            {program.duration && (
              <span className="text-xs text-[#7e7576] bg-[#f5f3f3] border border-[#e9e8e7] rounded-full px-2.5 py-0.5">
                {program.duration}
              </span>
            )}
          </div>
        </div>
        {canEdit && (
          <Link href={`/titulos/${program.id}/editar`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Editar
          </Link>
        )}
      </div>

      {/* Commercial info */}
      <Section title="Información comercial">
        <DataField label="Precio oficial"        value={formatCurrency(program.officialPrice)} />
        <DataField label="Precio promocional"    value={formatCurrency(program.currentPromoPrice)} />
        <DataField label="Descuento activo"      value={formatPercent(program.activeDiscount)} />
        <DataField label="Validez del descuento" value={
          (program.discountValidFrom || program.discountValidTo)
            ? `${formatDate(program.discountValidFrom)} – ${formatDate(program.discountValidTo)}`
            : null
        } />
        <DataField label="Matrículas conseguidas" value={program.enrollmentsTotal > 0 ? program.enrollmentsTotal : null} />
        <DataField label="Ingresos generados"    value={program.revenueTotal > 0 ? formatCurrency(program.revenueTotal) : null} />
        <DataField label="Tasa de conversión"    value={formatPercent(program.conversionRate)} />
        <DataField label="Canal que mejor funciona" value={program.bestChannel} />
        <DataField label="Última campaña"        value={program.lastCampaign} />
        <DataField label="Comunicaciones asociadas" value={program.associatedCampaigns} wide />
      </Section>

      {/* Academic info */}
      <Section title="Información académica">
        <DataField label="Duración"              value={program.duration} />
        <DataField label="Créditos ECTS"         value={program.credits} />
        <DataField label="Modalidad"             value={program.modality} />
        <DataField label="Inicio de convocatoria" value={program.convocationStart} />
        <DataField label="Asignaturas o módulos" value={program.subjectsOrModules}  wide />
        <DataField label="Enfoques principales"  value={program.mainFocuses}         wide />
        <DataField label="Salidas profesionales" value={program.careerOutcomes}      wide />
        <DataField label="Perfil recomendado"    value={program.targetProfile}       wide />
        <DataField label="Propuesta de valor"    value={program.valueProposition}    wide />
        <DataField label="Argumentos comerciales" value={program.mainCommercialArgs}  wide />
        <DataField label="Claims validados"      value={program.validatedClaims}     wide />
        <DataField label="Restricciones"         value={program.restrictions}        wide />
      </Section>

      {/* AI info */}
      <Section title="Información para IA">
        <DataField label="Mensajes que mejor han funcionado" value={program.bestMessages}          wide />
        <DataField label="CTAs con mejor rendimiento"        value={program.bestCtas}              wide />
        <DataField label="Enfoques ganadores"                value={program.winningApproaches}     wide />
        <DataField label="Casos de éxito asociados"          value={program.successCasesAi}        wide />
        <DataField label="Recomendaciones para futuros briefings" value={program.futureRecommendations} wide />
        <DataField label="Observaciones del equipo"          value={program.teamObservations}      wide />
      </Section>
    </div>
  )
}
