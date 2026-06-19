'use client'

import { useState } from 'react'
import { WhatsAppPushNotification } from './WhatsAppPushNotification'
import { WhatsAppChatBubble } from './WhatsAppChatBubble'

type Tab = 'push' | 'chat'

interface Props {
  content: string
  contactName?: string
}

export function WhatsAppPreviewTabs({ content, contactName }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('push')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setActiveTab('push')}
          className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
            activeTab === 'push'
              ? 'bg-[#1b1c1c] text-white border-[#1b1c1c]'
              : 'text-on-surface-variant border-outline-variant hover:border-[#4c4546] hover:text-on-surface'
          }`}
        >
          Notificación push
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
            activeTab === 'chat'
              ? 'bg-[#1b1c1c] text-white border-[#1b1c1c]'
              : 'text-on-surface-variant border-outline-variant hover:border-[#4c4546] hover:text-on-surface'
          }`}
        >
          Burbuja de chat
        </button>
      </div>

      {/* Active view */}
      {activeTab === 'push' ? (
        <WhatsAppPushNotification content={content} contactName={contactName} />
      ) : (
        <WhatsAppChatBubble content={content} />
      )}
    </div>
  )
}
