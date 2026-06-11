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

  // Solo aplica a briefs de canal email
  if (brief.channel !== 'email') return null

  // Ya enviado
  if (brief.crmStatus === 'sent_to_crm') {
    return (
      <span
        className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full"
        style={{ background: 'rgba(195,244,0,0.12)', color: '#c3f400', border: '1px solid rgba(195,244,0,0.22)' }}
      >
        ✓ Enviado a CRM
      </span>
    )
  }

  if (!isEmailApproved) {
    return (
      <span
        className="inline-flex items-center text-xs text-[#c4c9ac]/50 px-2.5 py-1"
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
        className="rounded px-3 py-1.5 text-xs font-semibold text-[#283500] prisma-gradient-bg hover:opacity-90 active:opacity-80 transition-all shadow-sm shadow-[#abd600]/20"
      >
        Preparar para CRM
      </button>

      {showFlow && (
        <CrmFlow brief={brief} onClose={() => setShowFlow(false)} />
      )}
    </>
  )
}
