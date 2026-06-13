interface Props {
  content: string
  contactName?: string
}

export function WhatsAppPushNotification({ content, contactName = 'Universidad Prisma' }: Props) {
  return (
    <div className="rounded-lg overflow-hidden border border-outline-variant bg-surface-container-low px-4 py-5 flex items-start gap-3">
      {/* WhatsApp app icon — color externo, no se tokeniza */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-lg"
        style={{ background: '#25d366' }}
      >
        💬
      </div>

      <div className="flex-1 min-w-0">
        {/* Notification header */}
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-xs font-semibold text-on-surface truncate">WhatsApp</span>
            <span className="text-[10px] text-on-surface-variant/40">·</span>
            <span className="text-[10px] text-on-surface-variant/60 truncate">{contactName}</span>
          </div>
          <span className="text-[10px] text-on-surface-variant/40 shrink-0">ahora</span>
        </div>

        {/* Message preview — truncated like a real push notification */}
        <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
          {content}
        </p>
      </div>
    </div>
  )
}
