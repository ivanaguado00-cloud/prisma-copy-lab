'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { createBriefAction, type BriefActionState } from '../../app/actions/briefActions'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { CHANNEL, MODE, EMAIL_TEMPLATE, EMAIL_TEMPLATE_LABELS, type Channel } from '../../types/domain'
import { PROGRAM_GROUPS, PREDEFINED_CTAS, CTA_CUSTOM_SENTINEL } from '../../lib/briefingOptions'

function FieldError({ state, field }: { state: BriefActionState | null; field: string }) {
  const error = state?.errors?.find((e) => e.field === field)
  if (!error) return null
  return <p className="text-sm text-[#ba1a1a] mt-1">{error.message}</p>
}

function FormLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-[#1b1c1c] block">
      {children}
    </label>
  )
}

const inputCls =
  'bg-transparent border-[#cfc4c5] text-[#1b1c1c] placeholder:text-[#7e7576] focus-visible:ring-0 focus-visible:border-[#1b1c1c]'

const selectTriggerCls =
  'bg-transparent border-[#cfc4c5] text-[#1b1c1c] focus:ring-0 focus:border-[#1b1c1c]'

const selectContentCls = 'bg-[#ffffff] border-[#cfc4c5]'

const selectItemCls = 'text-[#1b1c1c] focus:bg-[#f5f3f3] focus:text-[#1b1c1c]'

// ── Demo fixtures ─────────────────────────────────────────────────────────────

interface DemoFixture {
  title: string
  programOrTitulation: string
  objective: string
  audience: string
  mode: string
  valueProposition: string
  cta: string
  emailTemplate?: string
  constraints: string
}

const DEMO_WHATSAPP: DemoFixture = {
  title: 'Campaña MBA — Captación Q3',
  programOrTitulation: 'MBA',
  objective:
    'Captar leads cualificados interesados en el MBA entre profesionales con experiencia que buscan dar un salto directivo',
  audience:
    'Profesionales de entre 28 y 42 años con al menos 3 años de experiencia laboral, que trabajan en empresa privada y valoran la flexibilidad para estudiar sin dejar de trabajar',
  mode: MODE.produccion,
  valueProposition:
    'Formación 100 % online compatible con la jornada laboral, con red de alumni consolidada y salidas directivas reales',
  cta: '¿Quieres que te comparta los detalles del programa?',
  constraints: 'Tono cercano pero profesional. No mencionar precios ni plazos de matrícula.',
}

const DEMO_EMAIL: DemoFixture = {
  title: 'Email captación Máster IA — Campaña newsletter',
  programOrTitulation: 'Máster en Inteligencia Artificial Aplicada',
  objective:
    'Presentar el Máster en IA como la opción de referencia para perfiles técnicos que quieren liderar proyectos de IA en empresa',
  audience:
    'Ingenieros y desarrolladores de 25 a 38 años con perfil técnico, interesados en IA y machine learning, que buscan especialización sin pausar su carrera',
  mode: MODE.produccion,
  valueProposition:
    'Programa diseñado con empresas líderes del sector tech; prácticas garantizadas y bolsa de empleo activa',
  cta: 'Solicita información',
  emailTemplate: EMAIL_TEMPLATE.newsletter,
  constraints: 'Evitar tecnicismos excesivos. Priorizar empleabilidad y casos de uso reales.',
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BriefingForm({ channel }: { channel: Channel }) {
  const [state, formAction, isPending] = useActionState<BriefActionState | null, FormData>(
    createBriefAction,
    null,
  )

  // Controlled state for all fields (enables autofill)
  const [title, setTitle] = useState('')
  const [programOrTitulation, setProgramOrTitulation] = useState('')
  const [objective, setObjective] = useState('')
  const [audience, setAudience] = useState('')
  const [mode, setMode] = useState('')
  const [valueProposition, setValueProposition] = useState('')
  const [emailTemplate, setEmailTemplate] = useState('')
  const [constraints, setConstraints] = useState('')
  const [ctaSelection, setCtaSelection] = useState('')
  const [ctaCustom, setCtaCustom] = useState('')

  const isEmail = channel === CHANNEL.email
  const isCustomCta = ctaSelection === CTA_CUSTOM_SENTINEL
  const finalCta = isCustomCta ? ctaCustom : ctaSelection

  function fillWithDemo() {
    const demo = isEmail ? DEMO_EMAIL : DEMO_WHATSAPP
    setTitle(demo.title)
    setProgramOrTitulation(demo.programOrTitulation)
    setObjective(demo.objective)
    setAudience(demo.audience)
    setMode(demo.mode)
    setValueProposition(demo.valueProposition)
    setConstraints(demo.constraints)
    setEmailTemplate(demo.emailTemplate ?? '')
    // CTA: pick the predefined option if it exists
    const isPredefined = (PREDEFINED_CTAS as readonly string[]).includes(demo.cta)
    if (isPredefined) {
      setCtaSelection(demo.cta)
      setCtaCustom('')
    } else {
      setCtaSelection(CTA_CUSTOM_SENTINEL)
      setCtaCustom(demo.cta)
    }
  }

  return (
    <form action={formAction} className="space-y-6">

      {/* canal — campo oculto, determinado por la ruta */}
      <input type="hidden" name="channel" value={channel} />

      {/* Botón de demo — discreto, solo para pruebas internas */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={fillWithDemo}
          disabled={isPending}
          className="text-xs text-on-surface-variant/50 hover:text-on-surface-variant transition-colors underline underline-offset-2 decoration-dotted disabled:opacity-30"
        >
          Rellenar con ejemplo
        </button>
      </div>

      {/* title */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="title">
          Título <span className="text-[#ffb4ab]">*</span>
        </FormLabel>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nombre o título de campaña"
          disabled={isPending}
          className={inputCls}
        />
        <FieldError state={state} field="title" />
      </div>

      {/* programOrTitulation */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="programOrTitulation">Titulación o programa</FormLabel>
        <Select
          name="programOrTitulation"
          value={programOrTitulation}
          onValueChange={(v) => setProgramOrTitulation(v ?? '')}
          disabled={isPending}
        >
          <SelectTrigger id="programOrTitulation" className={selectTriggerCls}>
            <SelectValue placeholder="Selecciona un programa (opcional)" />
          </SelectTrigger>
          <SelectContent className={`${selectContentCls} max-h-72 overflow-y-auto`}>
            {PROGRAM_GROUPS.map((group) => (
              <SelectGroup key={group.school}>
                <SelectLabel className="text-[#4c4546] text-xs px-2 py-1.5">{group.school}</SelectLabel>
                {group.programs.map((program) => (
                  <SelectItem key={program} value={program} className={`${selectItemCls} pl-4`}>
                    {program}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* objective */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="objective">
          Objetivo <span className="text-[#ffb4ab]">*</span>
        </FormLabel>
        <Textarea
          id="objective"
          name="objective"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="Objetivo único de la pieza"
          rows={3}
          disabled={isPending}
          className={`${inputCls} resize-none`}
        />
        <FieldError state={state} field="objective" />
      </div>

      {/* audience */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="audience">
          Audiencia <span className="text-[#ffb4ab]">*</span>
        </FormLabel>
        <Textarea
          id="audience"
          name="audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="Descripción del público objetivo"
          rows={3}
          disabled={isPending}
          className={`${inputCls} resize-none`}
        />
        <FieldError state={state} field="audience" />
      </div>

      {/* mode */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="mode">
          Modo <span className="text-[#ffb4ab]">*</span>
        </FormLabel>
        <Select
          name="mode"
          value={mode}
          onValueChange={(v) => setMode(v ?? '')}
          disabled={isPending}
        >
          <SelectTrigger id="mode" className={selectTriggerCls}>
            <SelectValue placeholder="Selecciona un modo" />
          </SelectTrigger>
          <SelectContent className={selectContentCls}>
            <SelectItem value={MODE.produccion} className={selectItemCls}>Producción</SelectItem>
            <SelectItem value={MODE.exploracion} className={selectItemCls}>Exploración</SelectItem>
          </SelectContent>
        </Select>
        <FieldError state={state} field="mode" />
      </div>

      {/* valueProposition */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="valueProposition">
          Propuesta de valor <span className="text-[#ffb4ab]">*</span>
        </FormLabel>
        <Textarea
          id="valueProposition"
          name="valueProposition"
          value={valueProposition}
          onChange={(e) => setValueProposition(e.target.value)}
          placeholder="Palanca o propuesta de valor principal"
          rows={3}
          disabled={isPending}
          className={`${inputCls} resize-none`}
        />
        <FieldError state={state} field="valueProposition" />
      </div>

      {/* cta */}
      <input type="hidden" name="cta" value={finalCta} />
      <div className="space-y-1.5">
        <FormLabel htmlFor="cta-select">
          CTA <span className="text-[#ffb4ab]">*</span>
        </FormLabel>
        <Select
          value={ctaSelection}
          onValueChange={(v) => setCtaSelection(v ?? '')}
          disabled={isPending}
        >
          <SelectTrigger id="cta-select" className={selectTriggerCls}>
            <SelectValue placeholder="Selecciona una llamada a la acción" />
          </SelectTrigger>
          <SelectContent className={selectContentCls}>
            {PREDEFINED_CTAS.map((cta) => (
              <SelectItem key={cta} value={cta} className={selectItemCls}>
                {cta}
              </SelectItem>
            ))}
            <SelectItem value={CTA_CUSTOM_SENTINEL} className="text-[#4c4546] focus:bg-[#f5f3f3] italic">
              Otro (personalizado)
            </SelectItem>
          </SelectContent>
        </Select>

        {isCustomCta && (
          <Input
            id="cta-custom"
            value={ctaCustom}
            onChange={(e) => setCtaCustom(e.target.value)}
            placeholder="Escribe tu CTA personalizada"
            disabled={isPending}
            required
            className={inputCls}
          />
        )}

        <FieldError state={state} field="cta" />
      </div>

      {/* ── Campos específicos de email ─────────────────────────────────────── */}
      {isEmail && (
        <div className="space-y-1.5">
          <FormLabel htmlFor="emailTemplate">
            Plantilla <span className="text-[#ffb4ab]">*</span>
          </FormLabel>
          <Select
            name="emailTemplate"
            value={emailTemplate}
            onValueChange={(v) => setEmailTemplate(v ?? '')}
            disabled={isPending}
          >
            <SelectTrigger id="emailTemplate" className={selectTriggerCls}>
              <SelectValue placeholder="Selecciona una plantilla" />
            </SelectTrigger>
            <SelectContent className={selectContentCls}>
              {Object.values(EMAIL_TEMPLATE).map((tpl) => (
                <SelectItem key={tpl} value={tpl} className={selectItemCls}>
                  {EMAIL_TEMPLATE_LABELS[tpl]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError state={state} field="emailTemplate" />
        </div>
      )}

      {/* constraints */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="constraints">Restricciones</FormLabel>
        <Textarea
          id="constraints"
          name="constraints"
          value={constraints}
          onChange={(e) => setConstraints(e.target.value)}
          placeholder="Restricciones, tono específico, exclusiones (opcional)"
          rows={3}
          disabled={isPending}
          className={`${inputCls} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded px-8 py-3 text-sm font-semibold prisma-gradient-bg text-on-brand-lime hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
      >
        {isPending ? 'Guardando…' : 'Crear briefing'}
      </button>
    </form>
  )
}
