import type { SendMetricsWithBrief } from '../../dao/sendMetricsDao'
import { SuccessToggleClient } from './SuccessToggleClient'

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
}

interface Props {
  send: SendMetricsWithBrief
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function SendMetricMessageView({ send }: Props) {
  const channel   = CHANNEL_LABELS[send.brief.channel] ?? send.brief.channel
  const sentDate  = send.sentAt ?? send.brief.crmSentAt
  const hasContent = !!send.brief.latestMessageContent

  return (
    <div>
      {/* Header metadata */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded border bg-[#e9e8e7] text-[#1b1c1c] border-[#cfc4c5]">
          {channel}
        </span>
        {sentDate && (
          <span className="text-xs text-[#7e7576]">{formatDate(sentDate)}</span>
        )}
        {send.brief.programOrTitulation && (
          <span className="text-xs text-[#4c4546] font-medium">
            {send.brief.programOrTitulation}
          </span>
        )}
        {send.brief.versionNumber && (
          <span className="text-xs text-[#7e7576]">v{send.brief.versionNumber}</span>
        )}
        {send.brief.latestEmailSubject && (
          <span className="text-xs text-[#4c4546]">
            Asunto: <em>{send.brief.latestEmailSubject}</em>
          </span>
        )}
      </div>

      {/* Audience + CTA chips */}
      <div className="flex flex-wrap gap-2 mb-3 text-xs text-[#7e7576]">
        <span>
          <span className="text-[#4c4546] font-medium">Audiencia:</span> {send.brief.audience}
        </span>
        <span>·</span>
        <span>
          <span className="text-[#4c4546] font-medium">CTA:</span> {send.brief.cta}
        </span>
      </div>

      {/* UTM params if present */}
      {(send.utmCampaign || send.utmSource) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {send.utmCampaign && <UtmChip k="utm_campaign" v={send.utmCampaign} />}
          {send.utmSource   && <UtmChip k="utm_source"   v={send.utmSource} />}
          {send.utmMedium   && <UtmChip k="utm_medium"   v={send.utmMedium} />}
          {send.utmContent  && <UtmChip k="utm_content"  v={send.utmContent} />}
        </div>
      )}

      {/* Message body */}
      {hasContent ? (
        <pre className="text-sm font-sans leading-relaxed text-[#1b1c1c] whitespace-pre-wrap border-l-2 border-[#cfc4c5] pl-4 py-1 max-h-64 overflow-y-auto">
          {send.brief.latestMessageContent}
        </pre>
      ) : (
        <p className="text-sm text-[#7e7576] italic">
          No hay texto de mensaje disponible para este briefing.
        </p>
      )}

      {/* Success toggle */}
      <div className="mt-4 pt-4 border-t border-[#e9e8e7] flex items-center justify-between gap-4">
        <p className="text-xs text-[#7e7576]">
          {send.isSuccessCase
            ? 'Este mensaje forma parte de la memoria de aprendizaje.'
            : 'Guarda este mensaje como caso de éxito para reforzar generaciones futuras similares.'}
        </p>
        <SuccessToggleClient
          sendMetricsId={send.id}
          initialValue={send.isSuccessCase}
        />
      </div>
    </div>
  )
}

function UtmChip({ k, v }: { k: string; v: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-[#f5f3f3] border border-[#cfc4c5] rounded px-2 py-0.5">
      <span className="text-[#7e7576]">{k}</span>
      <span className="font-mono font-medium text-[#1b1c1c]">{v}</span>
    </span>
  )
}
