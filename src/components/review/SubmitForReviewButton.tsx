'use client'

import { useState } from 'react'
import { submitBriefForReviewAction } from '../../app/actions/reviewActions'
import { REVIEW_STATUS } from '../../types/domain'

interface Props {
  briefId: string
  reviewStatus: string
  isOwner: boolean
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  [REVIEW_STATUS.submitted]: {
    label: 'En revisión por PM',
    className: 'bg-[#e9e8e7] text-[#1b1c1c] border border-[#cfc4c5]',
  },
  [REVIEW_STATUS.approved]: {
    label: 'Aprobado por PM',
    className: 'bg-success-container text-on-success-container border border-success-container',
  },
  [REVIEW_STATUS.rejected]: {
    label: 'Rechazado — puedes reenviar',
    className: 'bg-error-container/30 text-on-error-container border border-error-container/50',
  },
}

export function SubmitForReviewButton({ briefId, reviewStatus, isOwner }: Props) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Si no es el autor, no mostramos nada
  if (!isOwner) return null

  // Brief aprobado — solo badge informativo
  if (reviewStatus === REVIEW_STATUS.approved) {
    const info = STATUS_LABELS[REVIEW_STATUS.approved]!
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${info.className}`}>
        ✓ {info.label}
      </span>
    )
  }

  // Brief en revisión — solo badge
  if (reviewStatus === REVIEW_STATUS.submitted) {
    const info = STATUS_LABELS[REVIEW_STATUS.submitted]!
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${info.className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#1b1c1c]" />
        {info.label}
      </span>
    )
  }

  async function handleSubmit() {
    setIsPending(true)
    setError(null)
    const result = await submitBriefForReviewAction(briefId)
    setIsPending(false)
    if (!result.success) setError(result.error ?? 'Error desconocido.')
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {reviewStatus === REVIEW_STATUS.rejected && (
        <span className="text-xs text-on-error-container bg-error-container/30 border border-error-container/50 px-2.5 py-1 rounded-full font-medium">
          Rechazado — revisa y reenvía
        </span>
      )}
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="rounded px-4 py-2 text-xs font-semibold bg-[#1b1c1c] text-white hover:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? 'Enviando…' : reviewStatus === REVIEW_STATUS.rejected ? 'Reenviar a revisión' : 'Enviar a revisión'}
      </button>
      {error && <p className="text-xs text-on-error-container">{error}</p>}
    </div>
  )
}
