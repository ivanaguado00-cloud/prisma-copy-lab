'use client'

import { useState } from 'react'
import type { Brief } from '../../generated/prisma/client'
import { CrmFlow } from './CrmFlow'

interface Props {
  brief: Brief
  isEmailApproved: boolean
}

export function PrepareCrmButton({ brief, isEmailApproved }: Props) {
  const [showFlow, setShowFlow] = useState(false)

  if (brief.channel !== 'email') return null

  if (brief.crmStatus === 'sent_to_crm') {
    return (
      <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-brand-lime/10 text-on-brand-lime border border-brand-lime/20">
        ✓ Enviado a CRM
      </span>
    )
  }

  if (!isEmailApproved) {
    return (
      <span
        className="inline-flex items-center text-xs text-on-surface-variant/50 px-2.5 py-1"
        title="El email debe estar aprobado para prepararlo para CRM"
      >
        Preparar para CRM (requiere aprobación)
      </span>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowFlow(true)}
        className="rounded px-3 py-1.5 text-xs font-semibold text-on-brand-lime prisma-gradient-bg hover:opacity-90 active:opacity-80 transition-all shadow-sm shadow-brand-lime-dim/20"
      >
        Preparar para CRM
      </button>

      {showFlow && (
        <CrmFlow brief={brief} onClose={() => setShowFlow(false)} />
      )}
    </>
  )
}
