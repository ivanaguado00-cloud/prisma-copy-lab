import type { MessageVersion } from '../../generated/prisma/client'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

const VERDICT_BADGE: Record<string, { label: string; bg: string; text: string; border: string }> = {
  aprobada:             { label: 'Aprobada',    bg: '#052e16', text: '#10b981', border: '#065f46' },
  aprobada_con_ajustes: { label: 'Con ajustes', bg: '#1c1400', text: '#f59e0b', border: '#92400e' },
  no_aprobada:          { label: 'No aprobada', bg: '#1c0000', text: '#ef4444', border: '#7f1d1d' },
}

type Props = {
  version: MessageVersion
  channel?: string
  verdictStatus?: string | null
}

export function MessageVersionView({ version, channel, verdictStatus }: Props) {
  const isWhatsApp = channel === 'whatsapp'
  const verdict = verdictStatus ? VERDICT_BADGE[verdictStatus] : null

  return (
    <div className="rounded-lg overflow-hidden bg-[#1b1c1e]" style={{ border: '1px solid #444933' }}>

      {/* Card header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          borderBottom: '1px solid #444933',
          background: isWhatsApp ? 'rgba(37,150,119,0.10)' : 'rgba(99,130,201,0.08)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm">{isWhatsApp ? '💬' : '✉️'}</span>
          <span className="text-sm font-semibold text-[#e3e2e5]">
            Versión {version.versionNumber}
          </span>
          {verdict && (
            <span
              className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border"
              style={{ background: verdict.bg, color: verdict.text, borderColor: verdict.border }}
            >
              {verdict.label}
            </span>
          )}
        </div>
        <span className="text-xs text-[#c4c9ac]/60">{formatDate(version.createdAt)}</span>
      </div>

      {/* Message body */}
      <div className="px-4 py-4">
        {isWhatsApp ? (
          <div
            className="rounded-lg rounded-tl-sm px-4 py-3 max-w-sm ml-0"
            style={{ background: 'rgba(37,150,119,0.12)', border: '1px solid rgba(37,150,119,0.25)' }}
          >
            <p className="text-sm text-[#d1fae5] whitespace-pre-wrap leading-relaxed">
              {version.content}
            </p>
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #444933' }}>
            <div className="px-4 py-2.5 bg-[#1f2022]" style={{ borderBottom: '1px solid #444933' }}>
              <p className="text-xs text-[#c4c9ac]">
                <span className="font-medium text-[#e3e2e5]">Asunto:</span>{' '}
                {firstLine(version.content)}
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-[#e3e2e5] whitespace-pre-wrap leading-relaxed">
                {version.content}
              </p>
            </div>
          </div>
        )}

        {version.userInstruction && (
          <div className="mt-3 text-xs rounded px-3 py-2 bg-[#1f2022]" style={{ border: '1px solid #444933' }}>
            <span className="font-medium text-[#c3f400]">Instrucción aplicada:</span>{' '}
            <span className="text-[#c4c9ac]">&ldquo;{version.userInstruction}&rdquo;</span>
          </div>
        )}

        {version.userInstruction && verdictStatus === 'no_aprobada' && (
          <div className="mt-2 text-xs rounded px-3 py-2" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
            Ajuste aplicado, pero la versión no supera algunos criterios de validación de Universidad Prisma. Consulta el panel derecho para ver los detalles.
          </div>
        )}

        {version.userInstruction && verdictStatus === 'aprobada_con_ajustes' && (
          <div className="mt-2 text-xs rounded px-3 py-2" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#fcd34d' }}>
            Ajuste aplicado. La versión tiene puntos mejorables según los criterios de Universidad Prisma.
          </div>
        )}
      </div>

      {/* Footer metadata */}
      <div
        className="px-4 py-2 flex gap-4 text-[11px] text-[#c4c9ac]/40 bg-[#0d0e10]"
        style={{ borderTop: '1px solid #444933' }}
      >
        <span>Modelo: {version.llmModel}</span>
        <span>Prompt v{version.generationPromptVersion}</span>
      </div>
    </div>
  )
}

function firstLine(content: string): string {
  return content.split('\n')[0]?.slice(0, 80) ?? ''
}
