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

export function BriefingForm({ channel }: { channel: Channel }) {
  const [state, formAction, isPending] = useActionState<BriefActionState | null, FormData>(
    createBriefAction,
    null,
  )

  const [ctaSelection, setCtaSelection] = useState<string>('')
  const [ctaCustom, setCtaCustom] = useState<string>('')

  const isEmail = channel === CHANNEL.email
  const isCustomCta = ctaSelection === CTA_CUSTOM_SENTINEL
  const finalCta = isCustomCta ? ctaCustom : ctaSelection

  return (
    <form action={formAction} className="space-y-6">

      {/* canal — campo oculto, determinado por la ruta */}
      <input type="hidden" name="channel" value={channel} />

      {/* title */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="title">
          Título <span className="text-[#ffb4ab]">*</span>
        </FormLabel>
        <Input
          id="title"
          name="title"
          placeholder="Nombre o título de campaña"
          disabled={isPending}
          className={inputCls}
        />
        <FieldError state={state} field="title" />
      </div>

      {/* programOrTitulation */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="programOrTitulation">Titulación o programa</FormLabel>
        <Select name="programOrTitulation" disabled={isPending}>
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
        <Select name="mode" disabled={isPending}>
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
        <>
          {/* emailSubject */}
          <div className="space-y-1.5">
            <FormLabel htmlFor="emailSubject">
              Asunto <span className="text-[#ffb4ab]">*</span>
            </FormLabel>
            <Input
              id="emailSubject"
              name="emailSubject"
              placeholder="Subject line del email"
              disabled={isPending}
              className={inputCls}
            />
            <FieldError state={state} field="emailSubject" />
          </div>

          {/* emailPreheader */}
          <div className="space-y-1.5">
            <FormLabel htmlFor="emailPreheader">
              Preheader <span className="text-[#ffb4ab]">*</span>
            </FormLabel>
            <Input
              id="emailPreheader"
              name="emailPreheader"
              placeholder="Texto de vista previa (40–90 caracteres recomendados)"
              disabled={isPending}
              className={inputCls}
            />
            <FieldError state={state} field="emailPreheader" />
          </div>

          {/* emailTemplate */}
          <div className="space-y-1.5">
            <FormLabel htmlFor="emailTemplate">
              Plantilla <span className="text-[#ffb4ab]">*</span>
            </FormLabel>
            <Select name="emailTemplate" disabled={isPending}>
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
        </>
      )}

      {/* constraints */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="constraints">Restricciones</FormLabel>
        <Textarea
          id="constraints"
          name="constraints"
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
