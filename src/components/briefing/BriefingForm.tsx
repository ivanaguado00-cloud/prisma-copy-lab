'use client'

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
import { CHANNEL, MODE } from '../../types/domain'

function FieldError({ state, field }: { state: BriefActionState | null; field: string }) {
  const error = state?.errors?.find((e) => e.field === field)
  if (!error) return null
  return <p className="text-sm text-[#f87171] mt-1">{error.message}</p>
}

function FormLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-slate-200 block">
      {children}
    </label>
  )
}

const inputCls =
  'bg-[#0a0a0f] border-[#1e1e3a] text-slate-200 placeholder:text-slate-600 focus-visible:ring-[#7c3aed]/40 focus-visible:border-[#7c3aed]'

export function BriefingForm() {
  const [state, formAction, isPending] = useActionState<BriefActionState | null, FormData>(
    createBriefAction,
    null,
  )

  return (
    <form action={formAction} className="space-y-6">

      {/* title */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="title">
          Título <span className="text-[#f87171]">*</span>
        </FormLabel>
        <Input id="title" name="title" placeholder="Nombre o título de campaña" disabled={isPending} className={inputCls} />
        <FieldError state={state} field="title" />
      </div>

      {/* programOrTitulation */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="programOrTitulation">Titulación o programa</FormLabel>
        <Input id="programOrTitulation" name="programOrTitulation" placeholder="Titulación o programa referenciado (opcional)" disabled={isPending} className={inputCls} />
      </div>

      {/* objective */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="objective">
          Objetivo <span className="text-[#f87171]">*</span>
        </FormLabel>
        <Textarea id="objective" name="objective" placeholder="Objetivo único de la pieza" rows={3} disabled={isPending} className={`${inputCls} resize-none`} />
        <FieldError state={state} field="objective" />
      </div>

      {/* audience */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="audience">
          Audiencia <span className="text-[#f87171]">*</span>
        </FormLabel>
        <Textarea id="audience" name="audience" placeholder="Descripción del público objetivo" rows={3} disabled={isPending} className={`${inputCls} resize-none`} />
        <FieldError state={state} field="audience" />
      </div>

      {/* channel + mode row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <FormLabel htmlFor="channel">
            Canal <span className="text-[#f87171]">*</span>
          </FormLabel>
          <Select name="channel" disabled={isPending}>
            <SelectTrigger id="channel" className="bg-[#0a0a0f] border-[#1e1e3a] text-slate-200 focus:ring-[#7c3aed]/40">
              <SelectValue placeholder="Selecciona un canal" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f0f1a] border-[#1e1e3a]">
              <SelectItem value={CHANNEL.whatsapp} className="text-slate-200 focus:bg-[#1e1e3a] focus:text-white">WhatsApp</SelectItem>
              <SelectItem value={CHANNEL.email} className="text-slate-200 focus:bg-[#1e1e3a] focus:text-white">Email</SelectItem>
            </SelectContent>
          </Select>
          <FieldError state={state} field="channel" />
        </div>

        <div className="space-y-1.5">
          <FormLabel htmlFor="mode">
            Modo <span className="text-[#f87171]">*</span>
          </FormLabel>
          <Select name="mode" disabled={isPending}>
            <SelectTrigger id="mode" className="bg-[#0a0a0f] border-[#1e1e3a] text-slate-200 focus:ring-[#7c3aed]/40">
              <SelectValue placeholder="Selecciona un modo" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f0f1a] border-[#1e1e3a]">
              <SelectItem value={MODE.produccion} className="text-slate-200 focus:bg-[#1e1e3a] focus:text-white">Producción</SelectItem>
              <SelectItem value={MODE.exploracion} className="text-slate-200 focus:bg-[#1e1e3a] focus:text-white">Exploración</SelectItem>
            </SelectContent>
          </Select>
          <FieldError state={state} field="mode" />
        </div>
      </div>

      {/* valueProposition */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="valueProposition">
          Propuesta de valor <span className="text-[#f87171]">*</span>
        </FormLabel>
        <Textarea id="valueProposition" name="valueProposition" placeholder="Palanca o propuesta de valor principal" rows={3} disabled={isPending} className={`${inputCls} resize-none`} />
        <FieldError state={state} field="valueProposition" />
      </div>

      {/* cta */}
      <div className="space-y-1.5">
        <FormLabel htmlFor="cta">
          CTA <span className="text-[#f87171]">*</span>
        </FormLabel>
        <Input id="cta" name="cta" placeholder="Llamada a la acción esperada" disabled={isPending} className={inputCls} />
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
        className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white prisma-gradient-bg hover:opacity-90 active:opacity-80 transition-all shadow-lg shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
      >
        {isPending ? 'Guardando…' : 'Crear briefing'}
      </button>
    </form>
  )
}
