'use client'

import { useState, useTransition } from 'react'
import { toggleSuccessCaseAction } from '../../app/actions/analyticsActions'

interface Props {
  sendMetricsId: string
  initialValue: boolean
}

export function SuccessToggleClient({ sendMetricsId, initialValue }: Props) {
  const [isSuccessCase, setIsSuccessCase] = useState(initialValue)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    const prev = isSuccessCase
    setIsSuccessCase(!prev) // optimistic update
    startTransition(async () => {
      const result = await toggleSuccessCaseAction(sendMetricsId, prev)
      if (!result.ok) {
        setIsSuccessCase(prev) // rollback on error
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`shrink-0 inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded border transition-all ${
        isSuccessCase
          ? 'bg-[#e3f5ec] text-[#1a6639] border-[#b2dfcc] hover:bg-[#c8eada]'
          : 'bg-[#ffffff] text-[#4c4546] border-[#cfc4c5] hover:border-[#1b1c1c] hover:text-[#1b1c1c]'
      } disabled:opacity-50`}
    >
      <span>{isSuccessCase ? '★' : '☆'}</span>
      <span>{isSuccessCase ? 'Guardado como caso de éxito' : 'Guardar como caso de éxito'}</span>
    </button>
  )
}
