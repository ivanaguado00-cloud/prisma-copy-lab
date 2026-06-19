'use client'

import { useActionState } from 'react'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import type { ProgramActionState } from '../../app/actions/programActions'
import type { Program } from '../../types/domain'

// ── Style constants ───────────────────────────────────────────────────────────

const inputCls =
  'bg-transparent border-[#cfc4c5] text-[#1b1c1c] placeholder:text-[#7e7576] focus-visible:ring-0 focus-visible:border-[#1b1c1c]'

const textareaCls =
  'bg-transparent border-[#cfc4c5] text-[#1b1c1c] placeholder:text-[#7e7576] focus-visible:ring-0 focus-visible:border-[#1b1c1c] min-h-[90px]'

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldLabel({
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

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-sm text-[#ba1a1a] mt-1">{message}</p>
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-[#7e7576] mb-4 mt-2 pt-4 border-t border-[#e9e8e7] first:border-0 first:mt-0 first:pt-0">
      {children}
    </h3>
  )
}

function Field({
  label,
  htmlFor,
  optional,
  error,
  children,
}: {
  label: string
  htmlFor: string
  optional?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={htmlFor} optional={optional}>{label}</FieldLabel>
      {children}
      <FieldError message={error} />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

type Action = (prev: ProgramActionState, formData: FormData) => Promise<ProgramActionState>

interface Props {
  action: Action
  program?: Program
  submitLabel?: string
}

export function ProgramForm({ action, program, submitLabel = 'Guardar título' }: Props) {
  const [state, formAction, pending] = useActionState<ProgramActionState, FormData>(action, {})

  const def = (field: keyof Program): string => {
    if (!program) return ''
    const value = program[field]
    if (value == null) return ''
    if (value instanceof Date) return value.toISOString().split('T')[0]!
    return String(value)
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.errors?._form && (
        <p className="text-sm text-[#ba1a1a] bg-[#fff0ee] border border-[#ba1a1a]/20 rounded px-4 py-2">
          {state.errors._form}
        </p>
      )}

      {/* ── Información comercial ── */}
      <div className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg px-5 py-5 space-y-4">
        <SectionHeading>Información comercial</SectionHeading>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre del título" htmlFor="name" error={state.errors?.name}>
            <Input
              id="name"
              name="name"
              defaultValue={def('name')}
              placeholder="Máster en Marketing Digital"
              className={inputCls}
            />
          </Field>
          <Field label="Escuela o vertical" htmlFor="school" error={state.errors?.school}>
            <Input
              id="school"
              name="school"
              defaultValue={def('school')}
              placeholder="Escuela de Negocio"
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Precio oficial (€)" htmlFor="officialPrice" optional>
            <Input
              id="officialPrice"
              name="officialPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={def('officialPrice')}
              placeholder="7000"
              className={inputCls}
            />
          </Field>
          <Field label="Precio promocional (€)" htmlFor="currentPromoPrice" optional>
            <Input
              id="currentPromoPrice"
              name="currentPromoPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={def('currentPromoPrice')}
              placeholder="5600"
              className={inputCls}
            />
          </Field>
          <Field label="Descuento activo (%)" htmlFor="activeDiscount" optional>
            <Input
              id="activeDiscount"
              name="activeDiscount"
              type="number"
              step="0.1"
              min="0"
              max="100"
              defaultValue={def('activeDiscount')}
              placeholder="20"
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Descuento válido desde" htmlFor="discountValidFrom" optional>
            <Input
              id="discountValidFrom"
              name="discountValidFrom"
              type="date"
              defaultValue={def('discountValidFrom')}
              className={inputCls}
            />
          </Field>
          <Field label="Descuento válido hasta" htmlFor="discountValidTo" optional>
            <Input
              id="discountValidTo"
              name="discountValidTo"
              type="date"
              defaultValue={def('discountValidTo')}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Matrículas conseguidas" htmlFor="enrollmentsTotal" optional>
            <Input
              id="enrollmentsTotal"
              name="enrollmentsTotal"
              type="number"
              min="0"
              defaultValue={def('enrollmentsTotal')}
              placeholder="0"
              className={inputCls}
            />
          </Field>
          <Field label="Ingresos generados (€)" htmlFor="revenueTotal" optional>
            <Input
              id="revenueTotal"
              name="revenueTotal"
              type="number"
              step="0.01"
              min="0"
              defaultValue={def('revenueTotal')}
              placeholder="0"
              className={inputCls}
            />
          </Field>
          <Field label="Tasa de conversión (%)" htmlFor="conversionRate" optional>
            <Input
              id="conversionRate"
              name="conversionRate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              defaultValue={def('conversionRate')}
              placeholder="2.5"
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Canal que mejor funciona" htmlFor="bestChannel" optional>
            <Input
              id="bestChannel"
              name="bestChannel"
              defaultValue={def('bestChannel')}
              placeholder="Email"
              className={inputCls}
            />
          </Field>
          <Field label="Última campaña enviada" htmlFor="lastCampaign" optional>
            <Input
              id="lastCampaign"
              name="lastCampaign"
              defaultValue={def('lastCampaign')}
              placeholder="Campaña junio 2026"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Comunicaciones asociadas" htmlFor="associatedCampaigns" optional>
          <Textarea
            id="associatedCampaigns"
            name="associatedCampaigns"
            defaultValue={def('associatedCampaigns')}
            placeholder="Lista de campañas o briefs vinculados..."
            className={textareaCls}
          />
        </Field>
      </div>

      {/* ── Información académica ── */}
      <div className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg px-5 py-5 space-y-4">
        <SectionHeading>Información académica</SectionHeading>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Duración" htmlFor="duration" optional>
            <Input
              id="duration"
              name="duration"
              defaultValue={def('duration')}
              placeholder="12 meses"
              className={inputCls}
            />
          </Field>
          <Field label="Créditos ECTS" htmlFor="credits" optional>
            <Input
              id="credits"
              name="credits"
              type="number"
              min="0"
              defaultValue={def('credits')}
              placeholder="60"
              className={inputCls}
            />
          </Field>
          <Field label="Modalidad" htmlFor="modality" optional>
            <Input
              id="modality"
              name="modality"
              defaultValue={def('modality')}
              placeholder="Online, Presencial, Híbrida"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Inicio de convocatoria" htmlFor="convocationStart" optional>
          <Input
            id="convocationStart"
            name="convocationStart"
            defaultValue={def('convocationStart')}
            placeholder="Octubre 2026"
            className={inputCls}
          />
        </Field>

        <Field label="Asignaturas o módulos" htmlFor="subjectsOrModules" optional>
          <Textarea
            id="subjectsOrModules"
            name="subjectsOrModules"
            defaultValue={def('subjectsOrModules')}
            placeholder="Módulo 1: Fundamentos del marketing digital..."
            className={textareaCls}
          />
        </Field>

        <Field label="Enfoques principales del programa" htmlFor="mainFocuses" optional>
          <Textarea
            id="mainFocuses"
            name="mainFocuses"
            defaultValue={def('mainFocuses')}
            placeholder="IA aplicada, automatización, datos..."
            className={textareaCls}
          />
        </Field>

        <Field label="Salidas profesionales" htmlFor="careerOutcomes" optional>
          <Textarea
            id="careerOutcomes"
            name="careerOutcomes"
            defaultValue={def('careerOutcomes')}
            placeholder="Director de Marketing, CMO, Consultor..."
            className={textareaCls}
          />
        </Field>

        <Field label="Perfil recomendado" htmlFor="targetProfile" optional>
          <Textarea
            id="targetProfile"
            name="targetProfile"
            defaultValue={def('targetProfile')}
            placeholder="Profesional con experiencia en comunicación..."
            className={textareaCls}
          />
        </Field>

        <Field label="Propuesta de valor" htmlFor="valueProposition" optional>
          <Textarea
            id="valueProposition"
            name="valueProposition"
            defaultValue={def('valueProposition')}
            placeholder="La única formación que combina..."
            className={textareaCls}
          />
        </Field>

        <Field label="Argumentos comerciales principales" htmlFor="mainCommercialArgs" optional>
          <Textarea
            id="mainCommercialArgs"
            name="mainCommercialArgs"
            defaultValue={def('mainCommercialArgs')}
            placeholder="Claustro 100% profesional en activo, empleabilidad del 92%..."
            className={textareaCls}
          />
        </Field>

        <Field label="Claims validados" htmlFor="validatedClaims" optional>
          <Textarea
            id="validatedClaims"
            name="validatedClaims"
            defaultValue={def('validatedClaims')}
            placeholder="Claims que han pasado la validación y pueden usarse en comunicaciones..."
            className={textareaCls}
          />
        </Field>

        <Field label="Restricciones o información sensible" htmlFor="restrictions" optional>
          <Textarea
            id="restrictions"
            name="restrictions"
            defaultValue={def('restrictions')}
            placeholder="No mencionar competidores, evitar garantías de empleo..."
            className={textareaCls}
          />
        </Field>
      </div>

      {/* ── Información para IA ── */}
      <div className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg px-5 py-5 space-y-4">
        <SectionHeading>Información para IA</SectionHeading>

        <Field label="Mensajes que mejor han funcionado" htmlFor="bestMessages" optional>
          <Textarea
            id="bestMessages"
            name="bestMessages"
            defaultValue={def('bestMessages')}
            placeholder="Los mensajes con enfoque de urgencia han generado un 40% más de clics..."
            className={textareaCls}
          />
        </Field>

        <Field label="CTAs con mejor rendimiento" htmlFor="bestCtas" optional>
          <Textarea
            id="bestCtas"
            name="bestCtas"
            defaultValue={def('bestCtas')}
            placeholder="'Reserva tu plaza' convierte mejor que 'Más información'..."
            className={textareaCls}
          />
        </Field>

        <Field label="Enfoques ganadores" htmlFor="winningApproaches" optional>
          <Textarea
            id="winningApproaches"
            name="winningApproaches"
            defaultValue={def('winningApproaches')}
            placeholder="El enfoque de transformación profesional supera al de contenido técnico..."
            className={textareaCls}
          />
        </Field>

        <Field label="Casos de éxito asociados" htmlFor="successCasesAi" optional>
          <Textarea
            id="successCasesAi"
            name="successCasesAi"
            defaultValue={def('successCasesAi')}
            placeholder="Brief BR-012 generó 3 matrículas en 48h con enfoque de descuento urgente..."
            className={textareaCls}
          />
        </Field>

        <Field label="Recomendaciones para futuros briefings" htmlFor="futureRecommendations" optional>
          <Textarea
            id="futureRecommendations"
            name="futureRecommendations"
            defaultValue={def('futureRecommendations')}
            placeholder="Priorizar el canal email en convocatorias de octubre..."
            className={textareaCls}
          />
        </Field>

        <Field label="Observaciones del equipo" htmlFor="teamObservations" optional>
          <Textarea
            id="teamObservations"
            name="teamObservations"
            defaultValue={def('teamObservations')}
            placeholder="El equipo de ventas reporta que el precio es el principal freno..."
            className={textareaCls}
          />
        </Field>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
