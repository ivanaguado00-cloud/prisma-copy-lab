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
    <div className="rounded-2xl overflow-hidden bg-[#0f0f1a]" style={{ border: '1px solid #1e1e3a' }}>

      {/* Card header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          borderBottom: '1px solid #1e1e3a',
          background: isWhatsApp ? 'rgba(5,46,22,0.4)' : 'rgba(30,27,75,0.4)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm">{isWhatsApp ? '💬' : '✉️'}</span>
          <span className="text-sm font-semibold text-slate-100">
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
        <span className="text-xs text-slate-500">{formatDate(version.createdAt)}</span>
      </div>

      {/* Message body */}
      <div className="px-4 py-4">
        {isWhatsApp ? (
          <div
            className="rounded-xl rounded-tl-sm px-4 py-3 max-w-sm ml-0"
            style={{ background: 'rgba(5,46,22,0.5)', border: '1px solid rgba(6,95,70,0.4)' }}
          >
            <p className="text-sm text-[#d1fae5] whitespace-pre-wrap leading-relaxed">
              {version.content}
            </p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1e1e3a' }}>
            <div className="px-4 py-2.5 bg-[#1a1a2e]" style={{ borderBottom: '1px solid #1e1e3a' }}>
              <p className="text-xs text-slate-400">
                <span className="font-medium text-slate-200">Asunto:</span>{' '}
                {firstLine(version.content)}
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                {version.content}
              </p>
            </div>
          </div>
        )}

        {version.userInstruction && (
          <div className="mt-3 text-xs rounded-xl px-3 py-2 bg-[#1a1a2e]" style={{ border: '1px solid #1e1e3a' }}>
            <span className="font-medium text-violet-400">Instrucción aplicada:</span>{' '}
            <span className="text-slate-400">&ldquo;{version.userInstruction}&rdquo;</span>
          </div>
        )}
      </div>

      {/* Footer metadata */}
      <div
        className="px-4 py-2 flex gap-4 text-[11px] text-slate-600 bg-[#0a0a0f]"
        style={{ borderTop: '1px solid #1e1e3a' }}
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
