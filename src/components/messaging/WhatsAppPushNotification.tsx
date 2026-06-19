const NOTIFICATION_CHAR_LIMIT = 80

interface Props {
  content: string
  contactName?: string
}

export function WhatsAppPushNotification({ content, contactName = 'Universidad Prisma' }: Props) {
  // First line is always the most visible in notifications; trim to limit
  const firstLine = content.split('\n')[0] ?? ''
  const visibleText = firstLine.slice(0, NOTIFICATION_CHAR_LIMIT)
  const isOverLimit = firstLine.length > NOTIFICATION_CHAR_LIMIT
  const charCount = firstLine.length

  return (
    <div className="space-y-2">
      {/* Notification card */}
      <div className="rounded-xl overflow-hidden border border-outline-variant bg-[#f2f2f7] px-4 py-3 flex items-start gap-3">
        {/* WhatsApp icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-lg mt-0.5"
          style={{ background: '#25d366' }}
        >
          💬
        </div>

        <div className="flex-1 min-w-0">
          {/* Notification header */}
          <div className="flex items-baseline justify-between gap-2 mb-0.5">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-[11px] font-semibold text-[#1c1c1e]">WhatsApp</span>
              <span className="text-[10px] text-[#3c3c43]/40">·</span>
              <span className="text-[10px] text-[#3c3c43]/60 truncate">{contactName}</span>
            </div>
            <span className="text-[10px] text-[#3c3c43]/40 shrink-0">ahora</span>
          </div>

          {/* Visible text (within notification window) */}
          <p className="text-[12px] text-[#1c1c1e] leading-snug">
            {visibleText}
            {isOverLimit && <span className="text-[#3c3c43]/40">…</span>}
          </p>
        </div>
      </div>

      {/* Character feedback */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] text-on-surface-variant/50">
          Ventana de notificación: primeros {NOTIFICATION_CHAR_LIMIT} caracteres de la primera línea
        </span>
        <span
          className={`text-[10px] font-medium tabular-nums ${
            charCount > NOTIFICATION_CHAR_LIMIT
              ? 'text-[#ba1a1a]'
              : charCount > NOTIFICATION_CHAR_LIMIT * 0.85
                ? 'text-[#7c5c0a]'
                : 'text-on-surface-variant/50'
          }`}
        >
          {charCount}/{NOTIFICATION_CHAR_LIMIT}
          {isOverLimit && ' — el gancho queda cortado'}
        </span>
      </div>

      {isOverLimit && (
        <p className="text-[10px] text-[#ba1a1a] px-1">
          La primera línea supera los {NOTIFICATION_CHAR_LIMIT} caracteres. El mensaje principal debería caber en este límite para no perder impacto en la notificación.
        </p>
      )}
    </div>
  )
}
