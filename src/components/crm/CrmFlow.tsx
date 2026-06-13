'use client'

import { useState } from 'react'
import type { Brief } from '../../generated/prisma/client'
import type { EmailTemplate } from '../../lib/emailTemplates'
import { previewCrmEmailAction, sendToCrmAction } from '../../app/actions/crmActions'
import { CrmTemplateSelector } from './CrmTemplateSelector'
import { CrmEmailPreview } from './CrmEmailPreview'

type FlowStep =
  | { type: 'selecting' }
  | { type: 'loading_preview' }
  | { type: 'previewing'; template: EmailTemplate; html: string; plainText: string; internalSubject: string; recipientEmail: string }
  | { type: 'sent'; mock: boolean }
  | { type: 'error'; message: string }

interface Props {
  brief: Brief
  onClose: () => void
}

export function CrmFlow({ brief, onClose }: Props) {
  const [step, setStep] = useState<FlowStep>({ type: 'selecting' })

  async function handleTemplateSelect(template: EmailTemplate) {
    setStep({ type: 'loading_preview' })

    const result = await previewCrmEmailAction(brief.id, template.templateId)

    if (!result.success || !result.html) {
      setStep({ type: 'error', message: result.error ?? 'No se pudo generar la previsualización.' })
      return
    }

    setStep({
      type: 'previewing',
      template,
      html: result.html,
      plainText: result.plainText ?? '',
      internalSubject: result.internalSubject ?? '',
      recipientEmail: result.recipientEmail ?? '',
    })
  }

  async function handleApproveAndSend(crmNotes: string) {
    if (step.type !== 'previewing') return

    const result = await sendToCrmAction(brief.id, step.template.templateId, crmNotes || undefined)

    if (!result.success) {
      setStep({ type: 'error', message: result.error ?? 'No se pudo enviar la propuesta a CRM.' })
      return
    }

    setStep({ type: 'sent', mock: result.mock ?? false })
  }

  function handleBackToSelector() {
    setStep({ type: 'selecting' })
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface-bright border-t border-outline-variant">
      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-3 shrink-0 bg-surface-container-low border-b border-outline-variant">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-lime/10 text-brand-lime border border-brand-lime/20">
            Preparar para CRM
          </span>
          <span className="text-sm text-on-surface-variant">{brief.title}</span>
        </div>
        <button
          onClick={onClose}
          className="text-sm text-on-surface-variant hover:text-on-surface transition-colors px-3 py-1 rounded hover:bg-surface-container-high"
        >
          ✕ Cerrar
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {step.type === 'selecting' && (
          <CrmTemplateSelector onSelect={handleTemplateSelect} onCancel={onClose} />
        )}

        {step.type === 'loading_preview' && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-8 h-8 rounded-full animate-spin border-2 border-outline-variant border-t-brand-lime" />
            <p className="text-sm text-on-surface-variant">Preparando previsualización…</p>
          </div>
        )}

        {step.type === 'previewing' && (
          <CrmEmailPreview
            brief={brief}
            template={step.template}
            previewHtml={step.html}
            plainText={step.plainText}
            internalSubject={step.internalSubject}
            recipientEmail={step.recipientEmail}
            onApprove={handleApproveAndSend}
            onBack={handleBackToSelector}
            onCancel={onClose}
          />
        )}

        {step.type === 'sent' && (
          <div className="flex flex-col items-center justify-center h-full gap-5 px-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-brand-lime/10 border border-brand-lime/30">
              ✓
            </div>
            <div className="text-center space-y-2">
              <p className="text-base font-semibold text-on-surface">Propuesta enviada correctamente</p>
              {step.mock ? (
                <p className="text-sm text-on-surface-variant">
                  Modo mock activo — el email se ha registrado en consola.
                  <br />
                  Configura <code className="text-brand-lime">SMTP_HOST</code> para envío real.
                </p>
              ) : (
                <p className="text-sm text-on-surface-variant">
                  El email ha sido enviado al equipo de CRM. El estado del brief se ha actualizado.
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded px-6 py-2 text-sm font-semibold text-on-brand-lime prisma-gradient-bg hover:opacity-90 transition-all"
            >
              Cerrar
            </button>
          </div>
        )}

        {step.type === 'error' && (
          <div className="flex flex-col items-center justify-center h-full gap-5 px-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-error-container/50 border border-error-container">
              ✕
            </div>
            <div className="text-center space-y-2">
              <p className="text-base font-semibold text-on-surface">Error</p>
              <p className="text-sm text-on-error-container">{step.message}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBackToSelector}
                className="rounded px-4 py-2 text-sm font-medium text-brand-lime border border-brand-lime/40 hover:bg-surface-container-high transition-all"
              >
                Volver a plantillas
              </button>
              <button
                onClick={onClose}
                className="text-sm text-on-surface-variant hover:text-on-surface transition-colors px-4 py-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
