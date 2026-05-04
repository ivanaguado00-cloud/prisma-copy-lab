import type { ValidationRun, ValidationScore } from '../../generated/prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'

type ValidationRunWithScores = ValidationRun & { scores: ValidationScore[] }

type Props = {
  run: ValidationRunWithScores
}

const VERDICT_LABELS: Record<string, string> = {
  aprobada: 'Aprobada',
  aprobada_con_ajustes: 'Aprobada con ajustes',
  no_aprobada: 'No aprobada',
}

const VERDICT_STYLES: Record<string, string> = {
  aprobada: 'bg-green-100 text-green-800 border-green-200',
  aprobada_con_ajustes: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  no_aprobada: 'bg-red-100 text-red-800 border-red-200',
}

const STATUS_LABELS: Record<string, string> = {
  bien: 'Bien',
  mejorable: 'Mejorable',
  critico: 'Crítico',
}

const STATUS_STYLES: Record<string, string> = {
  bien: 'bg-green-50 text-green-700 border-green-200',
  mejorable: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  critico: 'bg-red-50 text-red-700 border-red-200',
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const style = VERDICT_STYLES[verdict] ?? 'bg-zinc-100 text-zinc-700 border-zinc-200'
  const label = VERDICT_LABELS[verdict] ?? verdict
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${style}`}>
      {label}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? 'bg-zinc-50 text-zinc-700 border-zinc-200'
  const label = STATUS_LABELS[status] ?? status
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  )
}

function ScoreBlock({ score }: { score: ValidationScore }) {
  return (
    <div className="py-3 space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-zinc-800">{score.criterionName}</span>
        <StatusBadge status={score.status} />
      </div>
      <p className="text-sm text-zinc-600">{score.comment}</p>
      {score.suggestedFix && (
        <p className="text-xs text-zinc-500 italic">
          Sugerencia: {score.suggestedFix}
        </p>
      )}
    </div>
  )
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function ValidationView({ run }: Props) {
  const orderedScores = [...run.scores].sort((a, b) =>
    a.criterionKey.localeCompare(b.criterionKey),
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm text-zinc-600 font-medium">
            Validación automática
          </CardTitle>
          <VerdictBadge verdict={run.overallVerdict} />
        </div>
        <p className="text-xs text-zinc-400 mt-1">{formatDate(run.createdAt)}</p>
      </CardHeader>

      <Separator />

      <CardContent className="pt-3">
        <p className="text-sm text-zinc-700 mb-4">{run.summary}</p>

        <div className="divide-y divide-zinc-100">
          {orderedScores.map((score) => (
            <ScoreBlock key={score.id} score={score} />
          ))}
        </div>

        {run.suggestedRewrite && (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 space-y-1">
            <p className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">
              Reescritura sugerida
            </p>
            <p className="text-sm text-yellow-900 whitespace-pre-wrap">
              {run.suggestedRewrite}
            </p>
          </div>
        )}

        <div className="mt-3 flex gap-3 text-xs text-zinc-400 border-t border-zinc-100 pt-2">
          <span>Modelo: {run.validatorModel}</span>
          <span>Criterios: {run.criteriaVersion}</span>
          <span>Prompt: {run.validatorPromptVersion}</span>
        </div>
      </CardContent>
    </Card>
  )
}
