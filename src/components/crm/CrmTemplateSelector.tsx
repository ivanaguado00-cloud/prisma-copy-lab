'use client'

import { EMAIL_TEMPLATES, type EmailTemplate } from '../../lib/emailTemplates'

interface Props {
  onSelect: (template: EmailTemplate) => void
  onCancel: () => void
}

const LAYOUT_ICON: Record<string, string> = {
  informative: '📄',
  commercial: '🎯',
  reminder: '🔔',
  visual: '✨',
}

export function CrmTemplateSelector({ onSelect, onCancel }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5" style={{ borderBottom: '1px solid #444933' }}>
        <h2 className="text-base font-semibold text-[#e3e2e5]">Selecciona una plantilla</h2>
        <p className="text-sm text-[#c4c9ac]/60 mt-0.5">
          Elige la estructura visual que mejor encaje con el objetivo de esta campaña.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EMAIL_TEMPLATES.map((template) => (
            <button
              key={template.templateId}
              onClick={() => onSelect(template)}
              className="text-left rounded-lg p-5 transition-all group"
              style={{
                background: '#1b1c1e',
                border: '1px solid #444933',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#c3f400'
                e.currentTarget.style.background = '#1f2022'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#444933'
                e.currentTarget.style.background = '#1b1c1e'
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{LAYOUT_ICON[template.layout]}</span>
                <span className="text-sm font-semibold text-[#e3e2e5]">{template.name}</span>
              </div>
              <p className="text-xs text-[#c4c9ac] leading-relaxed mb-3">{template.description}</p>
              <p className="text-xs text-[#c4c9ac]/50 italic mb-4">{template.recommendedUse}</p>
              <span
                className="inline-block text-xs font-semibold px-3 py-1 rounded text-[#283500]"
                style={{ background: '#c3f400' }}
              >
                Usar plantilla
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-4" style={{ borderTop: '1px solid #444933' }}>
        <button
          onClick={onCancel}
          className="text-sm text-[#c4c9ac] hover:text-[#e3e2e5] transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
