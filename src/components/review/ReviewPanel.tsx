'use client'

import { useState } from 'react'
import { approveBriefAction, rejectBriefAction } from '../../app/actions/reviewActions'

interface Props {
  briefId: string
  currentStatus: string
  currentNote: string | null
}

export function ReviewPanel({ briefId, currentStatus, currentNote }: Props) {
  const [note, setNote] = useState(currentNote ?? '')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleApprove() {
    setIsPending(true)
    setError(null)
    const result = await approveBriefAction(briefId, note || undefined)
    setIsPending(false)
    if (!result.success) setError(result.error ?? 'Error desconocido.')
  }

  async function handleReject() {
    setIsPending(true)
    setError(null)
    const result = await rejectBriefAction(briefId, note || undefined)
    setIsPending(false)
    if (!result.success) setError(result.error ?? 'Error desconocido.')
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-lg">
      <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-brand-lime inline-block" />
        Revisión humana
      </h3>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="review-note" className="text-xs font-medium text-on-surface">
            Nota de revisión <span className="text-on-surface-variant font-normal">(opcional)</span>
          </label>
          <textarea
            id="review-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Observaciones, motivo de rechazo o indicaciones para el redactor…"
            rows={3}
            disabled={isPending}
            className="w-full text-xs rounded border border-outline-variant bg-surface-bright px-3 py-2 text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-brand-lime/30 focus:border-brand-lime placeholder:text-on-surface-variant/40 transition-all disabled:opacity-50"
          />
        </div>

        {error && (
          <p className="text-xs text-on-error-container bg-error-container/50 border border-error-container rounded px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={isPending || currentStatus === 'approved'}
            className="flex-1 rounded px-3 py-2 text-xs font-semibold bg-success-container text-on-success-container hover:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? '…' : currentStatus === 'approved' ? '✓ Aprobado' : 'Aprobar'}
          </button>
          <button
            onClick={handleReject}
            disabled={isPending || currentStatus === 'rejected'}
            className="flex-1 rounded px-3 py-2 text-xs font-semibold bg-error-container text-on-error-container hover:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? '…' : currentStatus === 'rejected' ? '✕ Rechazado' : 'Rechazar'}
          </button>
        </div>
      </div>
    </div>
  )
}
