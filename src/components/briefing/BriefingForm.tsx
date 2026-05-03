'use client'

import { useActionState } from 'react'
import { createBriefAction, type BriefActionState } from '../../app/actions/briefActions'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
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
  return <p className="text-sm text-red-600 mt-1">{error.message}</p>
}

export function BriefingForm() {
  const [state, formAction, isPending] = useActionState<BriefActionState | null, FormData>(
    createBriefAction,
    null,
  )

  return (
    <form action={formAction} className="space-y-6">
      {/* title */}
      <div className="space-y-1">
        <Label htmlFor="title">
          Título <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="Nombre o título de campaña"
          disabled={isPending}
        />
        <FieldError state={state} field="title" />
      </div>

      {/* programOrTitulation */}
      <div className="space-y-1">
        <Label htmlFor="programOrTitulation">Titulación o programa</Label>
        <Input
          id="programOrTitulation"
          name="programOrTitulation"
          placeholder="Titulación o programa referenciado (opcional)"
          disabled={isPending}
        />
      </div>

      {/* objective */}
      <div className="space-y-1">
        <Label htmlFor="objective">
          Objetivo <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="objective"
          name="objective"
          placeholder="Objetivo único de la pieza"
          rows={3}
          disabled={isPending}
        />
        <FieldError state={state} field="objective" />
      </div>

      {/* audience */}
      <div className="space-y-1">
        <Label htmlFor="audience">
          Audiencia <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="audience"
          name="audience"
          placeholder="Descripción del público objetivo"
          rows={3}
          disabled={isPending}
        />
        <FieldError state={state} field="audience" />
      </div>

      {/* channel + mode row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="channel">
            Canal <span className="text-red-500">*</span>
          </Label>
          <Select name="channel" disabled={isPending}>
            <SelectTrigger id="channel">
              <SelectValue placeholder="Selecciona un canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CHANNEL.whatsapp}>WhatsApp</SelectItem>
              <SelectItem value={CHANNEL.email}>Email</SelectItem>
            </SelectContent>
          </Select>
          <FieldError state={state} field="channel" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="mode">
            Modo <span className="text-red-500">*</span>
          </Label>
          <Select name="mode" disabled={isPending}>
            <SelectTrigger id="mode">
              <SelectValue placeholder="Selecciona un modo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={MODE.produccion}>Producción</SelectItem>
              <SelectItem value={MODE.exploracion}>Exploración</SelectItem>
            </SelectContent>
          </Select>
          <FieldError state={state} field="mode" />
        </div>
      </div>

      {/* valueProposition */}
      <div className="space-y-1">
        <Label htmlFor="valueProposition">
          Propuesta de valor <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="valueProposition"
          name="valueProposition"
          placeholder="Palanca o propuesta de valor principal"
          rows={3}
          disabled={isPending}
        />
        <FieldError state={state} field="valueProposition" />
      </div>

      {/* cta */}
      <div className="space-y-1">
        <Label htmlFor="cta">
          CTA <span className="text-red-500">*</span>
        </Label>
        <Input
          id="cta"
          name="cta"
          placeholder="Llamada a la acción esperada"
          disabled={isPending}
        />
        <FieldError state={state} field="cta" />
      </div>

      {/* constraints */}
      <div className="space-y-1">
        <Label htmlFor="constraints">Restricciones</Label>
        <Textarea
          id="constraints"
          name="constraints"
          placeholder="Restricciones, tono específico, exclusiones (opcional)"
          rows={3}
          disabled={isPending}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? 'Guardando…' : 'Crear briefing'}
      </Button>
    </form>
  )
}
