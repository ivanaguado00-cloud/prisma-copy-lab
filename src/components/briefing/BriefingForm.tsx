'use client'

import { useState, useRef, useEffect } from 'react'
import { useActionState } from 'react'
import { createBriefAction, type BriefActionState } from '../../app/actions/briefActions'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  FACULTIES,
  OBJECTIVES,
  PALANCAS,
  NEWSLETTER_SECTORS,
  EDITORIAL_ANGLES,
  OFFER_TYPES,
  EMAIL_VARIANTS,
  PREDEFINED_CTAS,
  CTA_CUSTOM_SENTINEL,
  deriveAudience,
  selectionToText,
  type SelectionItem,
} from '../../lib/briefingOptions'
import {
  EMAIL_TEMPLATE,
  EMAIL_TEMPLATE_LABELS,
  type Channel,
  type EmailTemplate,
} from '../../types/domain'

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputCls =
  'bg-transparent border-[#cfc4c5] text-[#1b1c1c] placeholder:text-[#7e7576] focus-visible:ring-0 focus-visible:border-[#1b1c1c]'

const selectTriggerCls =
  'bg-transparent border-[#cfc4c5] text-[#1b1c1c] focus:ring-0 focus:border-[#1b1c1c]'

const selectContentCls = 'bg-[#ffffff] border-[#cfc4c5]'

const selectItemCls = 'text-[#1b1c1c] focus:bg-[#f5f3f3] focus:text-[#1b1c1c]'

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldError({ state, field }: { state: BriefActionState | null; field: string }) {
  const error = state?.errors?.find((e) => e.field === field)
  if (!error) return null
  return (
    <p id={`${field}-error`} role="alert" className="mt-1 text-sm text-[#ba1a1a]">
      {error.message}
    </p>
  )
}

function ValidationSummary({
  state,
  summaryRef,
}: {
  state: BriefActionState | null
  summaryRef: React.RefObject<HTMLDivElement | null>
}) {
  if (!state?.errors?.length) return null

  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      aria-live="assertive"
      className="rounded border border-[#ba1a1a] bg-[#fff5f5] px-4 py-3 text-[#7f1010] outline-none focus:ring-2 focus:ring-[#ba1a1a]"
    >
      <p className="font-semibold">No hemos podido generar el mensaje todavía.</p>
      <p className="mt-1 text-sm">Revisa estos campos y vuelve a intentarlo:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {state.errors.map((error) => (
          <li key={`${error.field}-${error.message}`}>{error.message}</li>
        ))}
      </ul>
    </div>
  )
}

function FormLabel({
  htmlFor,
  children,
  optional,
}: {
  htmlFor?: string
  children: React.ReactNode
  optional?: boolean
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-[#1b1c1c] flex items-center gap-1.5">
      {children}
      {optional && <span className="text-xs font-normal text-[#7e7576]">(opcional)</span>}
    </label>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7e7576] pt-2">{children}</p>
  )
}

// ── Program multi-select ──────────────────────────────────────────────────────

function ProgramSelector({
  selection,
  onChange,
}: {
  selection: SelectionItem[]
  onChange: (s: SelectionItem[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function isSelected(item: SelectionItem) {
    return selection.some((s) => s.type === item.type && s.id === item.id)
  }

  function toggle(item: SelectionItem) {
    if (isSelected(item)) {
      onChange(selection.filter((s) => !(s.type === item.type && s.id === item.id)))
    } else {
      onChange([...selection, item])
    }
  }

  function remove(item: SelectionItem) {
    onChange(selection.filter((s) => !(s.type === item.type && s.id === item.id)))
  }

  return (
    <div ref={ref} className="relative">
      {/* Selected chips */}
      {selection.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selection.map((item) => {
            const label =
              item.type === 'faculty'
                ? `Facultad de ${FACULTIES.find((f) => f.id === item.id)?.name ?? item.id}`
                : item.type === 'vertical'
                  ? FACULTIES.flatMap((f) => f.verticals).find((v) => v.id === item.id)?.name ?? item.id
                  : FACULTIES.flatMap((f) => f.verticals)
                      .flatMap((v) => v.programs)
                      .find((p) => p.id === item.id)?.name ?? item.id
            return (
              <span
                key={`${item.type}-${item.id}`}
                className="inline-flex items-center gap-1 text-xs bg-[#e9e8e7] text-[#1b1c1c] border border-[#cfc4c5] rounded px-2 py-0.5"
              >
                {label}
                <button
                  type="button"
                  onClick={() => remove(item)}
                  className="text-[#7e7576] hover:text-[#1b1c1c] ml-0.5"
                  aria-label={`Quitar ${label}`}
                >
                  ×
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded border border-[#cfc4c5] bg-transparent px-3 py-2 text-sm text-[#7e7576] hover:border-[#1b1c1c] transition-colors text-left"
      >
        <span>{selection.length === 0 ? 'Añadir programa, vertical o facultad…' : 'Añadir más…'}</span>
        <span className="text-[10px]">▾</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-72 overflow-y-auto bg-white border border-[#cfc4c5] rounded shadow-sm">
          {FACULTIES.map((faculty) => (
            <div key={faculty.id}>
              {/* Faculty level */}
              <button
                type="button"
                onClick={() => toggle({ type: 'faculty', id: faculty.id })}
                className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 transition-colors ${
                  isSelected({ type: 'faculty', id: faculty.id })
                    ? 'bg-[#e9e8e7] text-[#1b1c1c]'
                    : 'text-[#4c4546] hover:bg-[#f5f3f3]'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                    isSelected({ type: 'faculty', id: faculty.id })
                      ? 'bg-[#1b1c1c] border-[#1b1c1c]'
                      : 'border-[#cfc4c5]'
                  }`}
                >
                  {isSelected({ type: 'faculty', id: faculty.id }) && (
                    <span className="text-white text-[8px]">✓</span>
                  )}
                </span>
                Facultad de {faculty.name}
              </button>

              {/* Verticals */}
              {faculty.verticals.map((vertical) => (
                <div key={vertical.id}>
                  <button
                    type="button"
                    onClick={() => toggle({ type: 'vertical', id: vertical.id })}
                    className={`w-full text-left pl-7 pr-3 py-1.5 text-xs flex items-center gap-2 transition-colors ${
                      isSelected({ type: 'vertical', id: vertical.id })
                        ? 'bg-[#f5f3f3] text-[#1b1c1c] font-medium'
                        : 'text-[#4c4546] hover:bg-[#f5f3f3]'
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded border flex items-center justify-center shrink-0 ${
                        isSelected({ type: 'vertical', id: vertical.id })
                          ? 'bg-[#1b1c1c] border-[#1b1c1c]'
                          : 'border-[#cfc4c5]'
                      }`}
                    >
                      {isSelected({ type: 'vertical', id: vertical.id }) && (
                        <span className="text-white text-[7px]">✓</span>
                      )}
                    </span>
                    {vertical.name}
                  </button>

                  {/* Programs */}
                  {vertical.programs.map((program) => (
                    <button
                      key={program.id}
                      type="button"
                      onClick={() => toggle({ type: 'program', id: program.id })}
                      className={`w-full text-left pl-11 pr-3 py-1 text-[11px] flex items-center gap-2 transition-colors ${
                        isSelected({ type: 'program', id: program.id })
                          ? 'bg-[#f5f3f3] text-[#1b1c1c] font-medium'
                          : 'text-[#7e7576] hover:bg-[#f5f3f3] hover:text-[#1b1c1c]'
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded border flex items-center justify-center shrink-0 ${
                          isSelected({ type: 'program', id: program.id })
                            ? 'bg-[#1b1c1c] border-[#1b1c1c]'
                            : 'border-[#e9e8e7]'
                        }`}
                      >
                        {isSelected({ type: 'program', id: program.id }) && (
                          <span className="text-white text-[7px]">✓</span>
                        )}
                      </span>
                      {program.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Demo fixtures ─────────────────────────────────────────────────────────────

// WhatsApp quick reply button options
export const WA_QUICK_REPLY_OPTIONS = [
  'Sí, me interesa',
  'Quiero que me llamen',
  'No me interesa',
] as const
export type WaQuickReply = (typeof WA_QUICK_REPLY_OPTIONS)[number]

interface DemoFixture {
  title: string
  objective: string
  programSelection: SelectionItem[]
  cta: string
  context: string
  palancaPrincipal?: string
  palancasApoyo?: string[]
  offerType?: string
  offerAmount?: string
  offerDeadline?: string
  reminderAction?: string
  sector?: string
  editorialAngle?: string
  variant?: string
  waButtons?: WaQuickReply[]
}

const DEMO_BY_TYPE: Record<string, DemoFixture[]> = {
  whatsapp: [
    {
      title: 'WA Reactivación MBA — Leads fríos',
      objective: 'Reactivación de interés',
      programSelection: [{ type: 'program', id: 'master-mba' }],
      cta: 'Solicita información sin compromiso',
      context: 'Leads que dejaron datos hace más de 3 meses sin actividad. Primer contacto directo por WhatsApp. Mensaje corto y personal.',
      waButtons: ['Sí, me interesa', 'No me interesa'],
    },
    {
      title: 'WA Captación Máster IA — Perfil técnico',
      objective: 'Captación de nuevos leads',
      programSelection: [{ type: 'program', id: 'master-ia' }],
      cta: 'Descubre el programa',
      context: 'Ingenieros y desarrolladores sin contacto previo. Tono directo, primera línea debe enganchar en la notificación.',
      waButtons: ['Sí, me interesa', 'Quiero que me llamen', 'No me interesa'],
    },
    {
      title: 'WA Recordatorio matrícula — Cierre convocatoria',
      objective: 'Conversión a matrícula',
      programSelection: [{ type: 'vertical', id: 'business-direction' }],
      cta: 'Reserva tu plaza ahora',
      context: 'Leads cualificados que han preguntado por el programa pero no han completado la matrícula. Urgencia real por cierre de plazo.',
      waButtons: ['Sí, me interesa', 'Quiero que me llamen'],
    },
  ],
  standard: [
    {
      title: 'Presentación MBA — Captación Q3',
      objective: 'Captación de nuevos leads',
      programSelection: [{ type: 'program', id: 'master-mba' }],
      cta: 'Solicita información sin compromiso',
      context: 'Leads que visitaron la web del MBA pero no dejaron datos. Enfoque profesional.',
      variant: 'A — Titular + cuerpo + CTA',
    },
    {
      title: 'Máster IA — Captación perfiles técnicos',
      objective: 'Captación de nuevos leads',
      programSelection: [{ type: 'program', id: 'master-ia' }],
      cta: 'Descubre el programa',
      context: 'Ingenieros y desarrolladores que han consultado contenidos de IA en la web. Sin presión de plazos.',
      variant: 'B — Pregunta de apertura',
    },
    {
      title: 'Grado Informática — Presentación septiembre',
      objective: 'Seguimiento de interés previo',
      programSelection: [{ type: 'program', id: 'grado-informatica' }],
      cta: '¿Te interesa conocer el plan de estudios?',
      context: 'Leads jóvenes que consultaron el grado en la última feria de orientación universitaria.',
      variant: 'C — Lista de puntos clave',
    },
  ],
  palancas: [
    {
      title: 'Email palancas MBA — Red alumni',
      objective: 'Reactivación de interés',
      programSelection: [{ type: 'program', id: 'master-mba' }],
      cta: 'Consulta aquí los detalles',
      context: 'Leads que dejaron datos hace más de 6 meses. Priorizar red de contactos y salidas reales.',
      palancaPrincipal: 'Red de alumni consolidada',
      palancasApoyo: ['Empleabilidad y salidas profesionales', 'Flexibilidad horaria y compatibilidad con trabajo'],
      variant: 'B — Triple palanca',
    },
    {
      title: 'Email palancas Máster Data — Empleabilidad',
      objective: 'Captación de nuevos leads',
      programSelection: [{ type: 'program', id: 'master-datascience' }],
      cta: '¿Quieres que revisemos si encaja contigo?',
      context: 'Perfil técnico con 2-4 años de experiencia buscando especialización. Destacar salidas en empresa.',
      palancaPrincipal: 'Empleabilidad y salidas profesionales',
      palancasApoyo: ['Prácticas garantizadas en empresa', 'Bolsa de empleo activa'],
      variant: 'A — Palanca única desarrollada',
    },
    {
      title: 'Email palancas Marketing — Flexibilidad online',
      objective: 'Reactivación de interés',
      programSelection: [{ type: 'vertical', id: 'business-marketing' }],
      cta: 'Solicita información sin compromiso',
      context: 'Profesionales con poco tiempo. El argumento central es que se puede compaginar con trabajo a jornada completa.',
      palancaPrincipal: 'Flexibilidad horaria y compatibilidad con trabajo',
      palancasApoyo: ['Formación 100% online', 'Metodología práctica y aplicada'],
      variant: 'C — Testimonio o prueba social',
    },
  ],
  descuentos: [
    {
      title: 'Beca MBA — Cierre junio',
      objective: 'Conversión a matrícula',
      programSelection: [{ type: 'program', id: 'master-mba' }],
      cta: 'Reserva tu plaza ahora',
      context: 'Leads cualificados que han preguntado por precio. Urgencia real: plazas limitadas.',
      offerType: 'Beca de excelencia académica',
      offerAmount: '30',
      offerDeadline: '2025-06-30',
      variant: 'A — Oferta directa',
    },
    {
      title: 'Descuento matrícula Máster IA — Alumni',
      objective: 'Cierre de matrícula',
      programSelection: [{ type: 'program', id: 'master-ia' }],
      cta: 'Aprovecha la oferta antes de que expire',
      context: 'Ex alumnos de grado que mostraron interés. El descuento es exclusivo para ellos.',
      offerType: 'Descuento para alumni',
      offerAmount: '20',
      offerDeadline: '2025-07-15',
      variant: 'B — Urgencia de plazo',
    },
    {
      title: 'Financiación sin intereses — Máster Marketing',
      objective: 'Conversión a matrícula',
      programSelection: [{ type: 'program', id: 'master-marketing' }],
      cta: 'Reserva tu plaza ahora',
      context: 'Leads que han mostrado interés pero tienen freno económico. La financiación elimina la barrera de precio.',
      offerType: 'Financiación sin intereses',
      offerAmount: '15',
      offerDeadline: '2025-08-01',
      variant: 'C — Comparativa de ahorro',
    },
  ],
  reminder: [
    {
      title: 'Recordatorio preinscripción MBA — 72h',
      objective: 'Seguimiento de interés previo',
      programSelection: [{ type: 'program', id: 'master-mba' }],
      cta: 'Reserva tu plaza ahora',
      context: 'Leads que iniciaron el proceso pero no lo finalizaron. Tono de recordatorio amable.',
      reminderAction: 'Fecha límite de preinscripción: 30 de junio a las 23:59h',
      variant: 'C — Reactivación personal',
    },
    {
      title: 'Aviso webinar Máster Data — 24h',
      objective: 'Seguimiento de interés previo',
      programSelection: [{ type: 'program', id: 'master-datascience' }],
      cta: 'Confirma tu asistencia',
      context: 'Inscritos al webinar informativo que todavía no han confirmado asistencia. Recordatorio a 24 horas del evento.',
      reminderAction: 'Webinar informativo mañana a las 18:00h — últimas plazas',
      variant: 'A — Aviso directo',
    },
    {
      title: 'Reactivación leads fríos — Fin de convocatoria',
      objective: 'Reactivación de interés',
      programSelection: [{ type: 'vertical', id: 'business-direction' }],
      cta: '¿Quieres que revisemos si encaja contigo?',
      context: 'Leads sin actividad desde hace más de 3 meses. Cierre de convocatoria como palanca de reactivación.',
      reminderAction: 'Cierre de la convocatoria actual: 15 de septiembre',
      variant: 'B — Secuencia de pasos',
    },
  ],
  newsletter: [
    {
      title: 'Newsletter tech — Tendencias IA junio 2025',
      objective: 'Nutrición de lead (lead nurturing)',
      programSelection: [{ type: 'vertical', id: 'tech-data' }],
      cta: 'Descubre el programa',
      context: 'Audiencia técnica con interés en IA. Evitar tecnicismos, priorizar casos de uso empresarial.',
      sector: 'Inteligencia Artificial y Automatización',
      editorialAngle: 'Tendencias del sector',
      variant: 'B — Resumen de tendencias',
    },
    {
      title: 'Newsletter RRHH — Mercado laboral y talento',
      objective: 'Nutrición de lead (lead nurturing)',
      programSelection: [{ type: 'vertical', id: 'business-people' }],
      cta: '¿Te interesa conocer el plan de estudios?',
      context: 'Directores y técnicos de personas interesados en tendencias de gestión del talento y cultura organizacional.',
      sector: 'Mercado Laboral y Empleo',
      editorialAngle: 'Perspectiva del mercado laboral',
      variant: 'A — Noticia principal + 2 breves',
    },
    {
      title: 'Newsletter Salud Digital — ESG y bienestar',
      objective: 'Nutrición de lead (lead nurturing)',
      programSelection: [{ type: 'faculty', id: 'health' }],
      cta: 'Solicita información sin compromiso',
      context: 'Profesionales de salud interesados en digitalización y sostenibilidad. Tono experto pero accesible.',
      sector: 'Salud Digital y Bienestar',
      editorialAngle: 'Innovación o tecnología emergente',
      variant: 'C — Noticia + opinión de la universidad',
    },
  ],
}

// ── DB program type (subset of Program domain type) ──────────────────────────

export interface DbProgram {
  id: string
  name: string
  school: string
  targetProfile?: string | null
}

// ── DB-backed program select (grouped by school) ──────────────────────────────

function DbProgramSelect({
  programs,
  value,
  onChange,
  disabled,
}: {
  programs: DbProgram[]
  value: string
  onChange: (id: string, name: string, targetProfile?: string | null) => void
  disabled?: boolean
}) {
  // Group by school preserving order
  const schoolOrder: string[] = []
  const bySchool = new Map<string, DbProgram[]>()
  for (const p of programs) {
    if (!bySchool.has(p.school)) {
      schoolOrder.push(p.school)
      bySchool.set(p.school, [])
    }
    bySchool.get(p.school)!.push(p)
  }

  function handleChange(selectedId: string | null) {
    if (!selectedId) return
    const found = programs.find((p) => p.id === selectedId)
    onChange(selectedId, found?.name ?? '', found?.targetProfile)
  }

  const selectedProgram = programs.find((program) => program.id === value)

  return (
    <Select value={value} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger className={selectTriggerCls}>
        {selectedProgram ? (
          <span className="flex-1 truncate text-left">{selectedProgram.name}</span>
        ) : (
          <SelectValue placeholder="Selecciona un programa o titulación…" />
        )}
      </SelectTrigger>
      <SelectContent className={selectContentCls}>
        {schoolOrder.map((school) => {
          const items = bySchool.get(school) ?? []
          return (
            <div key={school}>
              <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#7e7576]">
                {school}
              </p>
              {items.map((p) => (
                <SelectItem key={p.id} value={p.id} className={selectItemCls}>
                  {p.name}
                </SelectItem>
              ))}
            </div>
          )
        })}
      </SelectContent>
    </Select>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function BriefingForm({
  channel,
  initialEmailTemplate,
  programs = [],
}: {
  channel: Channel
  initialEmailTemplate?: EmailTemplate
  programs?: DbProgram[]
}) {
  const [state, formAction, isPending] = useActionState<BriefActionState | null, FormData>(
    createBriefAction,
    null,
  )
  const validationSummaryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!state?.errors?.length) return

    const focusTimeout = window.setTimeout(() => {
      validationSummaryRef.current?.focus({ preventScroll: true })
      validationSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)

    return () => window.clearTimeout(focusTimeout)
  }, [state])

  const isEmail = channel === 'email'
  const emailType = initialEmailTemplate ?? ''

  // Demo rotation counter
  const [demoIndex, setDemoIndex] = useState(0)

  // Basic fields
  const [title, setTitle] = useState('')
  const [objective, setObjective] = useState('')
  // DB program (when programs prop is provided)
  const [selectedProgramId, setSelectedProgramId] = useState('')
  const [selectedProgramName, setSelectedProgramName] = useState('')
  const [selectedProgramProfile, setSelectedProgramProfile] = useState<string | null>(null)
  // Legacy multi-select (fallback when no DB programs)
  const [programSelection, setProgramSelection] = useState<SelectionItem[]>([])
  const [cta, setCta] = useState('')
  const [ctaCustom, setCtaCustom] = useState('')
  const [context, setContext] = useState('')

  // Generation mode (standard / ab_test)
  const [generationMode, setGenerationMode] = useState<'standard' | 'ab_test'>('standard')

  // Variant (email A/B)
  const [variant, setVariant] = useState('')

  // WhatsApp quick reply buttons
  const [waButtons, setWaButtons] = useState<WaQuickReply[]>([])

  // Palancas fields
  const [palancaPrincipal, setPalancaPrincipal] = useState('')
  const [palancasApoyo, setPalancasApoyo] = useState<string[]>([])

  // Descuentos fields
  const [offerType, setOfferType] = useState('')
  const [offerAmount, setOfferAmount] = useState('')
  const [offerDeadline, setOfferDeadline] = useState('')

  // Reminder fields
  const [reminderAction, setReminderAction] = useState('')

  // Newsletter fields
  const [sector, setSector] = useState('')
  const [editorialAngle, setEditorialAngle] = useState('')

  // Derived values — prefer DB program when available
  const useDbPrograms = programs.length > 0
  const derivedAudience = useDbPrograms
    ? (selectedProgramProfile ?? (selectedProgramName ? `Interesados en ${selectedProgramName}` : ''))
    : deriveAudience(programSelection)
  const programsText = useDbPrograms ? selectedProgramName : selectionToText(programSelection)
  const isCustomCta = cta === CTA_CUSTOM_SENTINEL
  const finalCta = isCustomCta ? ctaCustom : cta

  // Build valueProposition from type-specific fields
  function buildValueProposition(): string {
    const parts: string[] = []
    if (isEmail) {
      if (emailType === EMAIL_TEMPLATE.palancas) {
        if (palancaPrincipal) parts.push(`Palanca principal: ${palancaPrincipal}.`)
        if (palancasApoyo.length > 0) parts.push(`Palancas de apoyo: ${palancasApoyo.join(', ')}.`)
      } else if (emailType === EMAIL_TEMPLATE.descuentos) {
        if (offerType) parts.push(`Tipo de oferta: ${offerType}.`)
        if (offerAmount) parts.push(`Importe o condición: ${offerAmount}%.`)
        if (offerDeadline) parts.push(`Fecha límite: ${offerDeadline}.`)
      } else if (emailType === EMAIL_TEMPLATE.newsletter) {
        if (sector) parts.push(`Sector: ${sector}.`)
        if (editorialAngle) parts.push(`Ángulo editorial: ${editorialAngle}.`)
      } else if (emailType === EMAIL_TEMPLATE.reminder) {
        if (reminderAction) parts.push(`Acción o fecha clave: ${reminderAction}.`)
      }
      if (variant) parts.push(`Formato de variante: ${variant}.`)
    } else {
      // WhatsApp
      if (waButtons.length > 0) {
        parts.push(`Botones de respuesta rápida: ${waButtons.join(' / ')}.`)
      }
    }
    return parts.join(' ')
  }

  function togglePalancaApoyo(p: string) {
    setPalancasApoyo((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    )
  }

  // ── Demo autofill ──────────────────────────────────────────────────────────
  function fillWithDemo() {
    const key = isEmail ? (emailType || 'standard') : 'whatsapp'
    const fixtures = DEMO_BY_TYPE[key] ?? DEMO_BY_TYPE['standard']
    if (!fixtures || fixtures.length === 0) return
    const demo = fixtures[demoIndex % fixtures.length]
    if (!demo) return
    setDemoIndex((i) => i + 1)
    setTitle(demo.title)
    setObjective(demo.objective)
    setProgramSelection(demo.programSelection)
    setContext(demo.context)
    if (demo.variant) setVariant(demo.variant)
    if (demo.palancaPrincipal) setPalancaPrincipal(demo.palancaPrincipal)
    if (demo.palancasApoyo) setPalancasApoyo(demo.palancasApoyo)
    if (demo.offerType) setOfferType(demo.offerType)
    if (demo.offerAmount) setOfferAmount(demo.offerAmount)
    if (demo.offerDeadline) setOfferDeadline(demo.offerDeadline)
    if (demo.reminderAction) setReminderAction(demo.reminderAction)
    if (demo.sector) setSector(demo.sector)
    if (demo.editorialAngle) setEditorialAngle(demo.editorialAngle)
    if (demo.waButtons) setWaButtons(demo.waButtons)
    const isPredefined = (PREDEFINED_CTAS as readonly string[]).includes(demo.cta)
    if (isPredefined) {
      setCta(demo.cta)
      setCtaCustom('')
    } else {
      setCta(CTA_CUSTOM_SENTINEL)
      setCtaCustom(demo.cta)
    }
  }

  const variants = emailType ? (EMAIL_VARIANTS[emailType] ?? []) : []
  const hasFieldError = (field: string) => state?.errors?.some((error) => error.field === field) ?? false
  const invalidSectionCls = 'rounded border border-[#ba1a1a] bg-[#fffafa] p-3'

  return (
    <form action={formAction} className="space-y-8">
      {/* Hidden fields */}
      <input type="hidden" name="channel" value={channel} />
      <input type="hidden" name="mode" value="produccion" />
      <input type="hidden" name="audience" value={derivedAudience} />
      <input type="hidden" name="valueProposition" value={buildValueProposition()} />
      {isEmail && <input type="hidden" name="emailTemplate" value={emailType} />}
      <input type="hidden" name="programOrTitulation" value={programsText} />
      {useDbPrograms && selectedProgramId && (
        <input type="hidden" name="programId" value={selectedProgramId} />
      )}
      <input type="hidden" name="cta" value={finalCta} />
      <input type="hidden" name="generationMode" value={generationMode} />

      <ValidationSummary state={state} summaryRef={validationSummaryRef} />

      {/* Demo autofill button */}
      <div className="flex items-center justify-between">
        {isEmail && emailType && (
          <span className="inline-flex items-center gap-1.5 text-xs text-[#4c4546] border border-[#cfc4c5] rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1b1c1c] inline-block" />
            {EMAIL_TEMPLATE_LABELS[emailType]}
          </span>
        )}
        {!isEmail && <span />}
        <button
          type="button"
          onClick={fillWithDemo}
          disabled={isPending}
          className="text-xs text-on-surface-variant/50 hover:text-on-surface-variant transition-colors underline underline-offset-2 decoration-dotted disabled:opacity-30"
        >
          Rellenar con ejemplo
        </button>
      </div>

      {/* ── Lo básico ─────────────────────────────────────────────────────── */}
      <div className="space-y-5">
        <SectionLabel>Lo básico</SectionLabel>

        {/* Título */}
        <div className="space-y-1.5">
          <FormLabel htmlFor="title">
            Título interno de campaña <span className="text-[#ba1a1a]">*</span>
          </FormLabel>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Reactivación MBA — Junio 2025"
            disabled={isPending}
            aria-invalid={hasFieldError('title')}
            aria-describedby={hasFieldError('title') ? 'title-error' : undefined}
            className={`${inputCls} ${hasFieldError('title') ? 'border-[#ba1a1a]' : ''}`}
          />
          <FieldError state={state} field="title" />
        </div>

        {/* Objetivo */}
        <div className="space-y-1.5">
          <FormLabel htmlFor="objective">Objetivo <span className="text-[#ba1a1a]">*</span></FormLabel>
          <Select value={objective} onValueChange={(v) => setObjective(v ?? '')} disabled={isPending}>
            <SelectTrigger
              id="objective"
              aria-invalid={hasFieldError('objective')}
              aria-describedby={hasFieldError('objective') ? 'objective-error' : undefined}
              className={`${selectTriggerCls} ${hasFieldError('objective') ? 'border-[#ba1a1a]' : ''}`}
            >
              <SelectValue placeholder="Selecciona un objetivo" />
            </SelectTrigger>
            <SelectContent className={selectContentCls}>
              {OBJECTIVES.map((o) => (
                <SelectItem key={o} value={o} className={selectItemCls}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="objective" value={objective} />
          <FieldError state={state} field="objective" />
        </div>

        {/* Programas */}
        <div className={`space-y-1.5 ${hasFieldError('audience') ? invalidSectionCls : ''}`}>
          <FormLabel>Programa / titulación</FormLabel>
          {useDbPrograms ? (
            <DbProgramSelect
              programs={programs}
              value={selectedProgramId}
              onChange={(id, name, profile) => {
                setSelectedProgramId(id)
                setSelectedProgramName(name)
                setSelectedProgramProfile(profile ?? null)
              }}
              disabled={isPending}
            />
          ) : (
            <>
              <p className="text-xs text-[#7e7576]">
                Puedes elegir uno o varios programas, una vertical completa o una facultad entera.
              </p>
              <ProgramSelector selection={programSelection} onChange={setProgramSelection} />
            </>
          )}
        </div>

        {/* Audiencia derivada */}
        {derivedAudience && (
          <div className="space-y-1.5">
            <FormLabel>
              Audiencia{' '}
              <span className="text-xs font-normal text-[#7e7576]">(derivada automáticamente)</span>
            </FormLabel>
            <div className="rounded border border-[#cfc4c5] bg-[#f5f3f3] px-3 py-2.5 text-xs text-[#4c4546] leading-relaxed">
              {derivedAudience}
            </div>
          </div>
        )}
        <FieldError state={state} field="audience" />
      </div>

      {/* ── Campos específicos por tipo ────────────────────────────────────── */}
      {isEmail && emailType && (
        <div className="space-y-5">
          <SectionLabel>
            {emailType === EMAIL_TEMPLATE.palancas && 'El argumento'}
            {emailType === EMAIL_TEMPLATE.descuentos && 'La oferta'}
            {emailType === EMAIL_TEMPLATE.reminder && 'El aviso'}
            {emailType === EMAIL_TEMPLATE.newsletter && 'El contenido'}
            {emailType === EMAIL_TEMPLATE.standard && 'El mensaje'}
          </SectionLabel>

          {/* PALANCAS */}
          {emailType === EMAIL_TEMPLATE.palancas && (
            <>
              <div className="space-y-1.5">
                <FormLabel htmlFor="palanca-principal">Palanca principal</FormLabel>
                <Select
                  value={palancaPrincipal}
                  onValueChange={(v) => setPalancaPrincipal(v ?? '')}
                  disabled={isPending}
                >
                  <SelectTrigger id="palanca-principal" className={selectTriggerCls}>
                    <SelectValue placeholder="Selecciona la palanca principal" />
                  </SelectTrigger>
                  <SelectContent className={selectContentCls}>
                    {PALANCAS.map((p) => (
                      <SelectItem key={p} value={p} className={selectItemCls}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <FormLabel optional>Palancas de apoyo</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {PALANCAS.filter((p) => p !== palancaPrincipal).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePalancaApoyo(p)}
                      disabled={isPending}
                      className={`text-xs rounded border px-2.5 py-1 transition-colors ${
                        palancasApoyo.includes(p)
                          ? 'bg-[#e9e8e7] border-[#1b1c1c] text-[#1b1c1c] font-medium'
                          : 'bg-white border-[#cfc4c5] text-[#4c4546] hover:border-[#7e7576]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* DESCUENTOS */}
          {emailType === EMAIL_TEMPLATE.descuentos && (
            <>
              <div className="space-y-1.5">
                <FormLabel htmlFor="offer-type">Tipo de oferta</FormLabel>
                <Select
                  value={offerType}
                  onValueChange={(v) => setOfferType(v ?? '')}
                  disabled={isPending}
                >
                  <SelectTrigger id="offer-type" className={selectTriggerCls}>
                    <SelectValue placeholder="Selecciona el tipo de oferta" />
                  </SelectTrigger>
                  <SelectContent className={selectContentCls}>
                    {OFFER_TYPES.map((o) => (
                      <SelectItem key={o} value={o} className={selectItemCls}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4 items-start">
                <div className="space-y-1.5">
                  <FormLabel htmlFor="offer-amount" optional>Descuento (%)</FormLabel>
                  <div className="relative">
                    <Input
                      id="offer-amount"
                      type="number"
                      min={1}
                      max={100}
                      value={offerAmount}
                      onChange={(e) => {
                        const v = Math.min(100, Math.max(1, parseInt(e.target.value) || 0))
                        setOfferAmount(v > 0 ? String(v) : '')
                      }}
                      placeholder="30"
                      disabled={isPending}
                      className={`${inputCls} pr-8`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#7e7576] pointer-events-none">%</span>
                  </div>
                  {offerAmount && (parseInt(offerAmount) < 1 || parseInt(offerAmount) > 100) && (
                    <p className="text-xs text-[#ba1a1a]">Introduce un valor entre 1 y 100.</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <FormLabel htmlFor="offer-deadline" optional>Fecha límite</FormLabel>
                  <Input
                    id="offer-deadline"
                    type="date"
                    value={offerDeadline}
                    onChange={(e) => setOfferDeadline(e.target.value)}
                    disabled={isPending}
                    className={inputCls}
                  />
                </div>
              </div>
            </>
          )}

          {/* REMINDER */}
          {emailType === EMAIL_TEMPLATE.reminder && (
            <div className="space-y-1.5">
              <FormLabel htmlFor="reminder-action">Acción o fecha clave</FormLabel>
              <Input
                id="reminder-action"
                value={reminderAction}
                onChange={(e) => setReminderAction(e.target.value)}
                placeholder="Ej. Fecha límite de preinscripción: 15 de julio"
                disabled={isPending}
                className={inputCls}
              />
            </div>
          )}

          {/* NEWSLETTER */}
          {emailType === EMAIL_TEMPLATE.newsletter && (
            <>
              <div className="space-y-1.5">
                <FormLabel htmlFor="sector">Sector / temática</FormLabel>
                <Select
                  value={sector}
                  onValueChange={(v) => setSector(v ?? '')}
                  disabled={isPending}
                >
                  <SelectTrigger id="sector" className={selectTriggerCls}>
                    <SelectValue placeholder="Selecciona el sector" />
                  </SelectTrigger>
                  <SelectContent className={selectContentCls}>
                    {NEWSLETTER_SECTORS.map((s) => (
                      <SelectItem key={s} value={s} className={selectItemCls}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <FormLabel htmlFor="editorial-angle">Ángulo editorial</FormLabel>
                <Select
                  value={editorialAngle}
                  onValueChange={(v) => setEditorialAngle(v ?? '')}
                  disabled={isPending}
                >
                  <SelectTrigger id="editorial-angle" className={selectTriggerCls}>
                    <SelectValue placeholder="Selecciona el ángulo" />
                  </SelectTrigger>
                  <SelectContent className={selectContentCls}>
                    {EDITORIAL_ANGLES.map((a) => (
                      <SelectItem key={a} value={a} className={selectItemCls}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <p className="text-xs text-[#7e7576] bg-[#f5f3f3] border border-[#cfc4c5] rounded px-3 py-2">
                La IA buscará noticias recientes del sector seleccionado para construir el contenido del newsletter.
              </p>
            </>
          )}
        </div>
      )}
      <FieldError state={state} field="emailTemplate" />
      {isEmail && <FieldError state={state} field="valueProposition" />}

      {/* ── Variante A/B (solo email) ──────────────────────────────────────── */}
      {isEmail && emailType && (
        <div className="space-y-5">
          <SectionLabel>Variante para A/B testing</SectionLabel>

          <div className="space-y-1.5">
            <FormLabel htmlFor="variant">Formato</FormLabel>
            <Select value={variant} onValueChange={(v) => setVariant(v ?? '')} disabled={isPending}>
              <SelectTrigger id="variant" className={`${selectTriggerCls} [&>span]:truncate [&>span]:max-w-[calc(100%-1.5rem)] [&>span]:block`}>
                <SelectValue placeholder="Selecciona un formato" />
              </SelectTrigger>
              <SelectContent className={selectContentCls}>
                {variants.map((v) => (
                  <SelectItem key={v} value={v} className={selectItemCls}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* ── Botones de respuesta rápida (solo WhatsApp) ────────────────────── */}
      {!isEmail && (
        <div className={`space-y-5 ${hasFieldError('valueProposition') ? invalidSectionCls : ''}`}>
          <SectionLabel>Botones de respuesta rápida</SectionLabel>

          <div className="space-y-2">
            <p className="text-xs text-[#7e7576]">
              Selecciona los botones que aparecerán en el mensaje. El equipo de CRM los configurará en la plataforma de envío.
            </p>
            {WA_QUICK_REPLY_OPTIONS.map((btn) => (
              <label
                key={btn}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={waButtons.includes(btn)}
                  onChange={() =>
                    setWaButtons((prev) =>
                      prev.includes(btn) ? prev.filter((b) => b !== btn) : [...prev, btn],
                    )
                  }
                  disabled={isPending}
                  className="w-4 h-4 rounded border-[#cfc4c5] accent-[#1b1c1c]"
                />
                <span className="text-sm text-[#1b1c1c] group-hover:text-[#4c4546] transition-colors">
                  {btn}
                </span>
              </label>
              ))}
          </div>
          <FieldError state={state} field="valueProposition" />

          {waButtons.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {waButtons.map((btn) => (
                <span
                  key={btn}
                  className="text-xs border border-[#1b1c1c] rounded-full px-3 py-1 text-[#1b1c1c] font-medium"
                >
                  {btn}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <div className={`space-y-5 ${hasFieldError('cta') ? invalidSectionCls : ''}`}>
        <SectionLabel>Llamada a la acción</SectionLabel>

        <div className="space-y-1.5">
          <FormLabel htmlFor="cta-select">CTA</FormLabel>
          <Select value={cta} onValueChange={(v) => setCta(v ?? '')} disabled={isPending}>
            <SelectTrigger
              id="cta-select"
              aria-invalid={hasFieldError('cta')}
              aria-describedby={hasFieldError('cta') ? 'cta-error' : undefined}
              className={`${selectTriggerCls} ${hasFieldError('cta') ? 'border-[#ba1a1a]' : ''}`}
            >
              <SelectValue placeholder="Selecciona una llamada a la acción" />
            </SelectTrigger>
            <SelectContent className={selectContentCls}>
              {PREDEFINED_CTAS.map((c) => (
                <SelectItem key={c} value={c} className={selectItemCls}>{c}</SelectItem>
              ))}
              <SelectItem
                value={CTA_CUSTOM_SENTINEL}
                className="text-[#4c4546] focus:bg-[#f5f3f3] italic"
              >
                Otro (personalizado)
              </SelectItem>
            </SelectContent>
          </Select>

          {isCustomCta && (
            <Input
              value={ctaCustom}
              onChange={(e) => setCtaCustom(e.target.value)}
              placeholder="Escribe tu CTA personalizada"
              disabled={isPending}
              aria-invalid={hasFieldError('cta')}
              aria-describedby={hasFieldError('cta') ? 'cta-error' : undefined}
              className={`mt-2 ${inputCls} ${hasFieldError('cta') ? 'border-[#ba1a1a]' : ''}`}
            />
          )}
          <FieldError state={state} field="cta" />
        </div>
      </div>

      {/* ── Criterio propio ────────────────────────────────────────────────── */}
      <div className="space-y-5">
        <SectionLabel>Criterio propio</SectionLabel>

        <div className="space-y-1.5">
          <FormLabel htmlFor="context" optional>Contexto o indicaciones adicionales</FormLabel>
          <Textarea
            id="context"
            name="constraints"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Ej. Esta comunicación va a personas que ya asistieron a un webinar en marzo. Quiero que el mensaje reconozca su interés previo y proponga un siguiente paso concreto."
            rows={3}
            disabled={isPending}
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      {/* ── Modo de generación ─────────────────────────────────────────────── */}
      <div className="space-y-5">
        <SectionLabel>Modo de generación</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Standard */}
          <button
            type="button"
            onClick={() => setGenerationMode('standard')}
            disabled={isPending}
            className={`text-left rounded border px-4 py-3 transition-colors ${
              generationMode === 'standard'
                ? 'border-[#1b1c1c] bg-[#f5f3f3]'
                : 'border-[#cfc4c5] bg-transparent hover:border-[#7e7576]'
            }`}
          >
            <p className={`text-sm font-semibold ${generationMode === 'standard' ? 'text-[#1b1c1c]' : 'text-[#4c4546]'}`}>
              Generación estándar
            </p>
            <p className="text-xs text-[#7e7576] mt-0.5">
              1 brief → 1 mensaje
            </p>
          </button>
          {/* A/B */}
          <button
            type="button"
            onClick={() => setGenerationMode('ab_test')}
            disabled={isPending}
            className={`text-left rounded border px-4 py-3 transition-colors ${
              generationMode === 'ab_test'
                ? 'border-[#1b1c1c] bg-[#f5f3f3]'
                : 'border-[#cfc4c5] bg-transparent hover:border-[#7e7576]'
            }`}
          >
            <p className={`text-sm font-semibold ${generationMode === 'ab_test' ? 'text-[#1b1c1c]' : 'text-[#4c4546]'}`}>
              Test A/B
            </p>
            <p className="text-xs text-[#7e7576] mt-0.5">
              1 brief → Variante A + Variante B
            </p>
          </button>
        </div>
        {generationMode === 'ab_test' && (
          <div className="bg-[#f5f3f3] border border-[#cfc4c5] rounded px-4 py-3 space-y-1">
            <p className="text-xs font-semibold text-[#1b1c1c]">Qué varía entre A y B</p>
            <p className="text-xs text-[#4c4546]">
              <span className="font-medium">Variante A</span> — foco en flexibilidad y progreso profesional.
            </p>
            <p className="text-xs text-[#4c4546]">
              <span className="font-medium">Variante B</span> — foco en empleabilidad y retorno de la inversión.
            </p>
            <p className="text-xs text-[#7e7576] pt-1">
              El resto del briefing (canal, programa, objetivo, CTA) es idéntico en ambas versiones.
            </p>
          </div>
        )}
      </div>

      {/* ── Submit ─────────────────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={isPending}
        className="rounded px-8 py-3 text-sm font-semibold bg-[#1b1c1c] text-white hover:bg-[#4c4546] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
      >
        {isPending
          ? (generationMode === 'ab_test' ? 'Generando variantes A y B…' : 'Generando…')
          : (generationMode === 'ab_test' ? 'Crear brief y generar A/B →' : 'Crear brief y generar →')}
      </button>
    </form>
  )
}
