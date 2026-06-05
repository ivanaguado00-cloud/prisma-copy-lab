import type { MessageVersion } from '../../generated/prisma/client'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

type Props = {
  version: MessageVersion
}

export function MessageVersionView({ version }: Props) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-700">
          Versión {version.versionNumber}
        </span>
        <span className="text-xs text-zinc-400">{formatDate(version.createdAt)}</span>
      </div>

      <p className="text-sm text-zinc-900 whitespace-pre-wrap leading-relaxed">
        {version.content}
      </p>

      {version.userInstruction && (
        <div className="text-xs text-zinc-500 bg-zinc-50 border border-zinc-100 rounded px-3 py-2">
          <span className="font-medium text-zinc-600">Instrucción aplicada:</span>{' '}
          &ldquo;{version.userInstruction}&rdquo;
        </div>
      )}

      <div className="flex gap-4 text-xs text-zinc-400 pt-1 border-t border-zinc-100">
        <span>Modelo: {version.llmModel}</span>
        <span>Prompt: {version.generationPromptVersion}</span>
      </div>
    </div>
  )
}
