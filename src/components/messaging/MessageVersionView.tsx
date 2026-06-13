import type { MessageVersion } from '../../generated/prisma/client'
import { WhatsAppPreviewTabs } from './WhatsAppPreviewTabs'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

const VERDICT_BADGE: Record<string, { label: string; cls: string }> = {
  aprobada:             { label: 'Aprobada',    cls: 'bg-success-container text-on-success-container' },
  aprobada_con_ajustes: { label: 'Con ajustes', cls: 'bg-warning-container text-on-warning-container' },
  no_aprobada:          { label: 'No aprobada', cls: 'bg-error-container text-on-error-container' },
}

type Props = {
  version: MessageVersion
  channel?: string
  verdictStatus?: string | null
  briefTitle?: string
}

export function MessageVersionView({ version, channel, verdictStatus, briefTitle }: Props) {
  const isWhatsApp = channel === 'whatsapp'
  const verdict = verdictStatus ? VERDICT_BADGE[verdictStatus] : null

  return (
    <div className="rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant">

      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-surface-container-high">
        <div className="flex items-center gap-2.5">
          <span className="text-sm">{isWhatsApp ? '💬' : '✉️'}</span>
          <span className="text-sm font-semibold text-on-surface">
            Versión {version.versionNumber}
          </span>
          {verdict && (
            <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${verdict.cls}`}>
              {verdict.label}
            </span>
          )}
        </div>
        <span className="text-xs text-on-surface-variant/60">{formatDate(version.createdAt)}</span>
      </div>

      {/* Message body */}
      <div className="px-4 py-4">
        {isWhatsApp ? (
          <WhatsAppPreviewTabs content={version.content} contactName={briefTitle} />
        ) : (
          <div className="rounded-lg overflow-hidden border border-outline-variant">
            <div className="px-4 py-2.5 bg-surface-container-high border-b border-outline-variant">
              <p className="text-xs text-on-surface-variant">
                <span className="font-medium text-on-surface">Asunto:</span>{' '}
                {firstLine(version.content)}
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed">
                {version.content}
              </p>
            </div>
          </div>
        )}

        {version.userInstruction && (
          <div className="mt-3 text-xs rounded px-3 py-2 bg-surface-container-high border border-outline-variant">
            <span className="font-medium text-brand-lime">Instrucción aplicada:</span>{' '}
            <span className="text-on-surface-variant">&ldquo;{version.userInstruction}&rdquo;</span>
          </div>
        )}

        {version.userInstruction && verdictStatus === 'no_aprobada' && (
          <div className="mt-2 text-xs rounded px-3 py-2 bg-error-container/50 border border-error-container text-on-error-container">
            Ajuste aplicado, pero la versión no supera algunos criterios de validación de Universidad Prisma. Consulta el panel derecho para ver los detalles.
          </div>
        )}

        {version.userInstruction && verdictStatus === 'aprobada_con_ajustes' && (
          <div className="mt-2 text-xs rounded px-3 py-2 bg-warning-container border border-warning-container/60 text-on-warning-container">
            Ajuste aplicado. La versión tiene puntos mejorables según los criterios de Universidad Prisma.
          </div>
        )}
      </div>

      {/* Footer metadata */}
      <div className="px-4 py-2 flex gap-4 text-[11px] text-on-surface-variant/40 bg-surface-container-high border-t border-outline-variant">
        <span>Modelo: {version.llmModel}</span>
        <span>Prompt v{version.generationPromptVersion}</span>
      </div>
    </div>
  )
}

function firstLine(content: string): string {
  return content.split('\n')[0]?.slice(0, 80) ?? ''
}
