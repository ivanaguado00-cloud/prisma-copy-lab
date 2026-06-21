'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import type { DiscountActionState } from '../../app/actions/programActions'

interface Props {
  action: (prev: DiscountActionState, formData: FormData) => Promise<DiscountActionState>
  currentDiscount: number | null | undefined
  currentValidFrom: Date | null | undefined
}

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return ''
  return new Date(date).toISOString().slice(0, 10)
}

export function DiscountForm({ action, currentDiscount, currentValidFrom }: Props) {
  const [state, formAction, isPending] = useActionState<DiscountActionState, FormData>(
    action,
    {},
  )

  return (
    <form action={formAction} className="space-y-5 bg-white border border-[#cfc4c5] rounded-lg p-6">
      {state?.errors?._form && (
        <p className="text-sm text-[#ba1a1a] bg-[#ffdad6] border border-[#ffb4ab] px-4 py-2.5 rounded">
          {state.errors._form}
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="activeDiscount" className="text-sm font-medium text-[#1b1c1c] block">
          Descuento activo (%)
        </label>
        <input
          id="activeDiscount"
          name="activeDiscount"
          type="number"
          min="0"
          max="100"
          step="0.1"
          defaultValue={currentDiscount ?? ''}
          placeholder="Ej: 15"
          className="w-full border border-[#cfc4c5] rounded px-3 py-2 text-sm text-[#1b1c1c] bg-transparent placeholder:text-[#7e7576] focus:outline-none focus:border-[#1b1c1c]"
        />
        <p className="text-xs text-[#7e7576]">
          Porcentaje sobre el precio oficial. Déjalo vacío para eliminar el descuento.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="discountValidFrom" className="text-sm font-medium text-[#1b1c1c] block">
          Vigencia desde
        </label>
        <input
          id="discountValidFrom"
          name="discountValidFrom"
          type="date"
          defaultValue={toDateInputValue(currentValidFrom)}
          className="w-full border border-[#cfc4c5] rounded px-3 py-2 text-sm text-[#1b1c1c] bg-transparent focus:outline-none focus:border-[#1b1c1c]"
        />
        <p className="text-xs text-[#7e7576]">Fecha desde la que el descuento está vigente.</p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded px-5 py-2 text-sm font-semibold bg-[#1b1c1c] text-white hover:bg-[#4c4546] transition-colors disabled:opacity-50"
        >
          {isPending ? 'Guardando…' : 'Guardar descuento'}
        </button>
        <Link
          href=".."
          className="rounded px-4 py-2 text-sm font-medium text-[#4c4546] border border-[#cfc4c5] hover:border-[#1b1c1c] hover:text-[#1b1c1c] transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
