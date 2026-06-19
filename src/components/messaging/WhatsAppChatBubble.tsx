interface Props {
  content: string
}

export function WhatsAppChatBubble({ content }: Props) {
  return (
    <div className="rounded-lg overflow-hidden border border-outline-variant">
      {/* WhatsApp topbar — color externo, no se tokeniza */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: '#075E54' }}>
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs text-white shrink-0">
          📱
        </div>
        <span className="text-xs font-medium text-white">WhatsApp</span>
      </div>

      {/* Chat area — fondo oscuro WhatsApp, no se tokeniza */}
      <div className="px-3 py-4 min-h-[80px]" style={{ background: '#111b21' }}>
        {/* Burbuja de mensaje — colores externos WhatsApp, no se tokenizan */}
        <div
          className="rounded-lg rounded-tl-none px-3 py-2 max-w-[80%] ml-0 inline-block"
          style={{ background: '#dcf8c6' }}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: '#111b21' }}>
            {content}
          </p>
          <p className="text-[10px] text-right mt-1" style={{ color: '#667781' }}>
            12:00 ✓✓
          </p>
        </div>
      </div>
    </div>
  )
}
