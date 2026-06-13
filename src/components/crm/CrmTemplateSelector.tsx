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
      <div className="px-6 py-5 border-b border-outline-variant">
        <h2 className="text-base font-semibold text-on-surface">Selecciona una plantilla</h2>
        <p className="text-sm text-on-surface-variant/60 mt-0.5">
          Elige la estructura visual que mejor encaje con el objetivo de esta campaña.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EMAIL_TEMPLATES.map((template) => (
            <button
              key={template.templateId}
              onClick={() => onSelect(template)}
              className="text-left rounded-lg p-5 transition-all bg-surface-container-low border border-outline-variant hover:border-brand-lime hover:bg-surface-container-high"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{LAYOUT_ICON[template.layout]}</span>
                <span className="text-sm font-semibold text-on-surface">{template.name}</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-3">{template.description}</p>
              <p className="text-xs text-on-surface-variant/50 italic mb-4">{template.recommendedUse}</p>
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded bg-brand-lime text-on-brand-lime">
                Usar plantilla
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-outline-variant">
        <button
          onClick={onCancel}
          className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
