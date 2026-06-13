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
import { CHANNEL, MODE } from '../../types/domain'
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

export function BriefingForm({ defaultChannel }: { defaultChannel?: string }) {
  const [state, formAction, isPending] = useActionState<BriefActionState | null, FormData>(
    createBriefAction,
    null,
  )

  const [ctaSelection, setCtaSelection] = useState<string>('')
  const [ctaCustom, setCtaCustom] = useState<string>('')

  const isCustomCta = ctaSelection === CTA_CUSTOM_SENTINEL
  const finalCta = isCustomCta ? ctaCustom : ctaSelection

  return (
    <form action={formAction} className="space-y-6">

      {/* title */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="title">
          Título <span className="text-[#ffb4ab]">*</span>
        </FormLabel>
        <Input id="title" name="title" placeholder="Nombre o título de campaña" disabled={isPending} className={inputCls} />
        <FieldError state={state} field="title" />
      </div>

      {/* programOrTitulation */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="programOrTitulation">Titulación o programa</FormLabel>
        <Select name="programOrTitulation" disabled={isPending}>
          <SelectTrigger id="programOrTitulation" className="bg-transparent border-[#cfc4c5] text-[#1b1c1c] focus:ring-0 focus:border-[#1b1c1c]">
            <SelectValue placeholder="Selecciona un programa (opcional)" />
          </SelectTrigger>
          <SelectContent className="bg-[#ffffff] border-[#cfc4c5] max-h-72 overflow-y-auto">
            {PROGRAM_GROUPS.map((group) => (
              <SelectGroup key={group.school}>
                <SelectLabel className="text-[#4c4546] text-xs px-2 py-1.5">{group.school}</SelectLabel>
                {group.programs.map((program) => (
                  <SelectItem
                    key={program}
                    value={program}
                    className="text-[#1b1c1c] focus:bg-[#f5f3f3] focus:text-[#1b1c1c] pl-4"
                  >
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
        <Textarea id="objective" name="objective" placeholder="Objetivo único de la pieza" rows={3} disabled={isPending} className={`${inputCls} resize-none`} />
        <FieldError state={state} field="objective" />
      </div>

      {/* audience */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="audience">
          Audiencia <span className="text-[#ffb4ab]">*</span>
        </FormLabel>
        <Textarea id="audience" name="audience" placeholder="Descripción del público objetivo" rows={3} disabled={isPending} className={`${inputCls} resize-none`} />
        <FieldError state={state} field="audience" />
      </div>

      {/* channel + mode row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <FormLabel htmlFor="channel">
            Canal <span className="text-[#ffb4ab]">*</span>
          </FormLabel>
          <Select name="channel" defaultValue={defaultChannel} disabled={isPending}>
            <SelectTrigger id="channel" className="bg-transparent border-[#cfc4c5] text-[#1b1c1c] focus:ring-0 focus:border-[#1b1c1c]">
              <SelectValue placeholder="Selecciona un canal" />
            </SelectTrigger>
            <SelectContent className="bg-[#ffffff] border-[#cfc4c5]">
              <SelectItem value={CHANNEL.whatsapp} className="text-[#1b1c1c] focus:bg-[#f5f3f3]">WhatsApp</SelectItem>
              <SelectItem value={CHANNEL.email} className="text-[#1b1c1c] focus:bg-[#f5f3f3]">Email</SelectItem>
            </SelectContent>
          </Select>
          <FieldError state={state} field="channel" />
        </div>

        <div className="space-y-1.5">
          <FormLabel htmlFor="mode">
            Modo <span className="text-[#ffb4ab]">*</span>
          </FormLabel>
          <Select name="mode" disabled={isPending}>
            <SelectTrigger id="mode" className="bg-transparent border-[#cfc4c5] text-[#1b1c1c] focus:ring-0 focus:border-[#1b1c1c]">
              <SelectValue placeholder="Selecciona un modo" />
            </SelectTrigger>
            <SelectContent className="bg-[#ffffff] border-[#cfc4c5]">
              <SelectItem value={MODE.produccion} className="text-[#1b1c1c] focus:bg-[#f5f3f3]">Producción</SelectItem>
              <SelectItem value={MODE.exploracion} className="text-[#1b1c1c] focus:bg-[#f5f3f3]">Exploración</SelectItem>
            </SelectContent>
          </Select>
          <FieldError state={state} field="mode" />
        </div>
      </div>

      {/* valueProposition */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="valueProposition">
          Propuesta de valor <span className="text-[#ffb4ab]">*</span>
        </FormLabel>
        <Textarea id="valueProposition" name="valueProposition" placeholder="Palanca o propuesta de valor principal" rows={3} disabled={isPending} className={`${inputCls} resize-none`} />
        <FieldError state={state} field="valueProposition" />
      </div>

      {/* cta — hidden field carries the final value; select + optional custom input drive the state */}
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
          <SelectTrigger id="cta-select" className="bg-transparent border-[#cfc4c5] text-[#1b1c1c] focus:ring-0 focus:border-[#1b1c1c]">
            <SelectValue placeholder="Selecciona una llamada a la acción" />
          </SelectTrigger>
          <SelectContent className="bg-[#ffffff] border-[#cfc4c5]">
            {PREDEFINED_CTAS.map((cta) => (
              <SelectItem key={cta} value={cta} className="text-[#1b1c1c] focus:bg-[#f5f3f3]">
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

      {/* constraints */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="constraints">Restricciones</FormLabel>
        <Textarea id="constraints" name="constraints" placeholder="Restricciones, tono específico, exclusiones (opcional)" rows={3} disabled={isPending} className={`${inputCls} resize-none`} />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded px-8 py-3 text-sm font-semibold bg-[#1b1c1c] text-white hover:bg-[#4c4546] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
      >
        {isPending ? 'Guardando…' : 'Crear briefing'}
      </button>
    </form>
  )
}
