// Type inferred from listSuccessCases DAO return shape
type SuccessCase = {
  id: string
  briefId: string
  isSuccessCase: boolean
  successNote: string | null
  opensCount: number
  clicksCount: number
  enrollments: number
  programPrice: number | null
  programDiscount: number | null
  sentAt: Date | null
  updatedAt: Date
  brief: {
    title: string
    channel: string
    programOrTitulation: string | null
    cta: string
    audience: string
  }
}

interface Props {
  cases: SuccessCase[]
}

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
}

const ACCENT_COLORS = [
  'border-l-[#1b1c1c]',
  'border-l-[#b08c30]',
  'border-l-[#1a6639]',
]

function pct(part: number, whole: number): string {
  if (whole === 0) return '—'
  return `${Math.round((part / whole) * 100)}%`
}

export function LearningMemoryPanel({ cases }: Props) {
  if (cases.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-[#7e7576]">
        <p>No hay casos de éxito guardados todavía.</p>
        <p className="mt-1 text-xs">
          Selecciona una comunicación y pulsa &quot;Guardar como caso de éxito&quot; para empezar a construir la memoria de aprendizaje.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {cases.map((c, idx) => {
        const accentClass = ACCENT_COLORS[idx % ACCENT_COLORS.length]
        return (
          <div
            key={c.id}
            className={`border-l-2 pl-4 py-1 ${accentClass}`}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm font-medium text-[#1b1c1c]">{c.brief.title}</p>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-[#7e7576]">
                  {CHANNEL_LABELS[c.brief.channel] ?? c.brief.channel}
                </span>
                {c.sentAt && (
                  <span className="text-xs text-[#7e7576]">
                    ·{' '}
                    {new Intl.DateTimeFormat('es-ES', {
                      month: 'short',
                      year: 'numeric',
                    }).format(new Date(c.sentAt))}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-[#7e7576] mb-1.5">
              <span>Apertura: <strong className="text-[#4c4546]">{pct(c.opensCount, 0)}</strong></span>
              <span>Clics: <strong className="text-[#4c4546]">{c.clicksCount}</strong></span>
              <span>Matrículas: <strong className="text-[#4c4546]">{c.enrollments}</strong></span>
              <span>CTA: <em className="text-[#4c4546]">{c.brief.cta}</em></span>
            </div>

            {c.successNote && (
              <p className="text-xs text-[#4c4546] italic">{c.successNote}</p>
            )}
            {!c.successNote && (
              <p className="text-xs text-[#7e7576]">
                Audiencia: {c.brief.audience}
              </p>
            )}
          </div>
        )
      })}

      <p className="text-xs text-[#7e7576] pt-2 border-t border-[#e9e8e7]">
        Estos casos se incorporan como contexto de aprendizaje al generar nuevos mensajes en situaciones similares
        (mismo canal, titulación o tipo de audiencia).
      </p>
    </div>
  )
}
