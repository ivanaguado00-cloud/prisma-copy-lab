'use client'

import { useState } from 'react'
import type { Brief } from '../../generated/prisma/client'
import type { EmailTemplate } from '../../lib/emailTemplates'

interface Props {
  brief: Brief
  template: EmailTemplate
  previewHtml: string
  plainText: string
  internalSubject: string
  recipientEmail: string
  onApprove: (crmNotes: string) => Promise<void>
  onBack: () => void
  onCancel: () => void
}

function BriefInfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#c4c9ac]/50">{label}</p>
      <p className="text-xs text-[#c4c9ac] leading-relaxed">{value}</p>
    </div>
  )
}

export function CrmEmailPreview({
  brief,
  template,
  previewHtml,
  plainText,
  internalSubject,
  recipientEmail,
  onApprove,
  onBack,
  onCancel,
}: Props) {
  const [crmNotes, setCrmNotes] = useState('')
  const [isSending, setIsSending] = useState(false)

  async function handleApprove() {
    setIsSending(true)
    try {
      await onApprove(crmNotes)
    } finally {
      setIsSending(false)
    }
  }

  function handleCopyHtml() {
    navigator.clipboard.writeText(previewHtml).catch(() => {})
  }

  function handleCopyText() {
    navigator.clipboard.writeText(plainText).catch(() => {})
  }

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Email preview panel ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #444933' }}>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="text-xs text-[#c4c9ac] hover:text-[#e3e2e5] transition-colors"
            >
              ← Plantillas
            </button>
            <span className="text-[#444933]">/</span>
            <span className="text-xs text-[#e3e2e5] font-medium">{template.name}</span>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="mb-4 space-y-1">
            <p className="text-[11px] text-[#c4c9ac]/50 uppercase tracking-wider font-semibold">Asunto interno</p>
            <p className="text-sm text-[#e3e2e5] font-medium">{internalSubject}</p>
          </div>
          <div className="mb-5 space-y-1">
            <p className="text-[11px] text-[#c4c9ac]/50 uppercase tracking-wider font-semibold">Destinatario CRM</p>
            <p className="text-xs text-[#c4c9ac]">{recipientEmail}</p>
          </div>

          {/* Rendered HTML preview */}
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: '1px solid #444933' }}
          >
            <iframe
              srcDoc={previewHtml}
              title="Vista previa del email"
              className="w-full"
              style={{ height: '520px', background: '#fff' }}
              sandbox="allow-same-origin"
            />
          </div>

          <div className="flex gap-3 mt-3">
            <button
              onClick={handleCopyHtml}
              className="text-xs text-[#c4c9ac] hover:text-[#c3f400] transition-colors"
            >
              Copiar HTML
            </button>
            <span className="text-[#444933]">·</span>
            <button
              onClick={handleCopyText}
              className="text-xs text-[#c4c9ac] hover:text-[#c3f400] transition-colors"
            >
              Copiar texto plano
            </button>
          </div>
        </div>
      </div>

      {/* ── Brief info + actions panel ─────────────────────────── */}
      <aside className="w-72 shrink-0 overflow-y-auto flex flex-col" style={{ borderLeft: '1px solid #444933', background: '#1b1c1e' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #444933' }}>
          <p className="text-xs font-semibold text-[#e3e2e5]">Datos del brief</p>
        </div>

        <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto">
          <BriefInfoRow label="Programa" value={brief.programOrTitulation} />
          <BriefInfoRow label="Objetivo" value={brief.objective} />
          <BriefInfoRow label="Público objetivo" value={brief.audience} />
          <BriefInfoRow label="CTA" value={brief.cta} />
          <BriefInfoRow label="Propuesta de valor" value={brief.valueProposition} />
          <BriefInfoRow label="Restricciones" value={brief.constraints} />
        </div>

        <div className="px-5 py-4 space-y-3" style={{ borderTop: '1px solid #444933' }}>
          <div className="space-y-1.5">
            <label htmlFor="crm-notes" className="text-xs font-medium text-[#e3e2e5]">
              Notas para CRM
            </label>
            <textarea
              id="crm-notes"
              value={crmNotes}
              onChange={(e) => setCrmNotes(e.target.value)}
              placeholder="Instrucciones adicionales para el equipo de CRM (opcional)"
              rows={3}
              className="w-full text-xs rounded border border-[#444933] bg-[#0d0e10] px-3 py-2 text-[#e3e2e5] resize-none focus:outline-none focus:ring-2 focus:ring-[#c3f400]/30 focus:border-[#c3f400] placeholder:text-[#c4c9ac]/40 transition-all"
            />
          </div>

          <button
            onClick={handleApprove}
            disabled={isSending}
            className="w-full rounded px-4 py-2.5 text-sm font-semibold text-[#283500] prisma-gradient-bg hover:opacity-90 active:opacity-80 transition-all shadow-md shadow-[#abd600]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Enviando a CRM…' : 'Aprobar y enviar a CRM'}
          </button>

          <button
            onClick={onCancel}
            disabled={isSending}
            className="w-full text-xs text-[#c4c9ac] hover:text-[#e3e2e5] transition-colors py-1"
          >
            Cancelar
          </button>
        </div>
      </aside>
    </div>
  )
}
