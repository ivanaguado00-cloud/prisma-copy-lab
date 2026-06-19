'use client'

import { useState } from 'react'
import type { Brief } from '../../generated/prisma/client'
import { CrmFlow } from './CrmFlow'
import { REVIEW_STATUS } from '../../types/domain'

// ── Previsualizar ─────────────────────────────────────────────────────────────
// Siempre disponible cuando el email está aprobado, incluso tras envío a CRM.
// Abre el modal en modo sólo lectura (sin botón de envío).

interface PreviewProps {
  brief: Brief
  isEmailApproved: boolean
}

export function PreviewCrmButton({ brief, isEmailApproved }: PreviewProps) {
  const [showFlow, setShowFlow] = useState(false)

  if (brief.channel !== 'email') return null

  if (!isEmailApproved) {
    return (
      <span
        className="inline-flex items-center text-xs text-on-surface-variant/40 px-2.5 py-1"
        title="El email debe estar aprobado para previsualizarlo"
      >
        Previsualizar
      </span>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowFlow(true)}
        className="rounded px-3 py-1.5 text-xs font-medium border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-on-surface transition-all"
      >
        Previsualizar maquetación
      </button>

      {showFlow && (
        <CrmFlow brief={brief} onClose={() => setShowFlow(false)} canSend={false} />
      )}
    </>
  )
}

// ── Enviar a CRM ──────────────────────────────────────────────────────────────
// Sólo la cuenta PM puede pulsarlo. El resto ve el estado de revisión.

interface SendProps {
  brief: Brief
  isEmailApproved: boolean
  isPm: boolean
}

export function SendToCrmButton({ brief, isEmailApproved, isPm }: SendProps) {
  const [showFlow, setShowFlow] = useState(false)

  if (brief.channel !== 'email') return null

  // Ya enviado — todos ven el badge
  if (brief.crmStatus === 'sent_to_crm') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[#e9e8e7] text-[#1b1c1c] border border-[#cfc4c5]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1b1c1c]" />
        Enviado a CRM
      </span>
    )
  }

  // Cuenta PM — puede abrir el modal de envío
  if (isPm) {
    return (
      <>
        <button
          onClick={() => setShowFlow(true)}
          disabled={!isEmailApproved}
          title={!isEmailApproved ? 'El email debe estar aprobado antes de enviarlo a CRM' : undefined}
          className="rounded px-3 py-1.5 text-xs font-semibold text-white bg-[#1b1c1c] hover:bg-[#4c4546] active:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Enviar a CRM
        </button>

        {showFlow && (
          <CrmFlow brief={brief} onClose={() => setShowFlow(false)} canSend={true} />
        )}
      </>
    )
  }

  // Resto de cuentas — muestra estado de revisión PM
  const reviewStatus = brief.reviewStatus ?? REVIEW_STATUS.pending

  if (reviewStatus === REVIEW_STATUS.approved) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[#e9e8e7] text-[#1b1c1c] border border-[#cfc4c5]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1b1c1c]" />
        Validado por PM
      </span>
    )
  }

  if (reviewStatus === REVIEW_STATUS.rejected) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[#fff0f0] text-[#ba1a1a] border border-[#f2b8b8]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
        Rechazado por PM
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant/60 px-2.5 py-1 rounded-full border border-outline-variant/50">
      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/30" />
      Pendiente de revisión por PM
    </span>
  )
}
