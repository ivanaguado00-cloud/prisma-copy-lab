import type { ValidationRun, ValidationScore } from '../../generated/prisma/client'

type ValidationRunWithScores = ValidationRun & { scores: ValidationScore[] }

type Props = {
  run: ValidationRunWithScores
  /** Renders as a flush side-panel (no Card wrapper, compact) */
  panel?: boolean
}

// ── Verdict ───────────────────────────────────────────────────────────────────

const VERDICT_META: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  aprobada: {
    label: 'Aprobada',
    bg: '#052e16',
    text: '#10b981',
    border: '#065f46',
    dot: '#10b981',
  },
  aprobada_con_ajustes: {
    label: 'Aprobada con ajustes',
    bg: '#1c1400',
    text: '#f59e0b',
    border: '#92400e',
    dot: '#f59e0b',
  },
  no_aprobada: {
    label: 'No aprobada',
    bg: '#1c0000',
    text: '#ef4444',
    border: '#7f1d1d',
    dot: '#ef4444',
  },
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const meta = VERDICT_META[verdict] ?? {
    label: verdict,
    bg: '#1e1e3a',
    text: '#94a3b8',
    border: '#1e1e3a',
    dot: '#94a3b8',
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
      style={{ background: meta.bg, color: meta.text, borderColor: meta.border }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: meta.dot }}
      />
      {meta.label}
    </span>
  )
}

// ── Status ────────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; bar: string; text: string }> = {
  bien: { label: 'Bien', bar: '#10b981', text: '#10b981' },
  mejorable: { label: 'Mejorable', bar: '#f59e0b', text: '#f59e0b' },
  critico: { label: 'Crítico', bar: '#ef4444', text: '#ef4444' },
}

function ScoreBlock({ score }: { score: ValidationScore }) {
  const meta = STATUS_META[score.status] ?? { label: score.status, bar: '#94a3b8', text: '#94a3b8' }
  return (
    <div className="py-3 flex gap-3">
      <div
        className="w-1 rounded-full shrink-0 mt-0.5"
        style={{ background: meta.bar }}
      />
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#e2e8f0] leading-snug">
            {score.criterionName}
          </span>
          <span
            className="text-[11px] font-medium shrink-0"
            style={{ color: meta.text }}
          >
            {meta.label}
          </span>
        </div>
        <p className="text-xs text-[#94a3b8] leading-relaxed">{score.comment}</p>
        {score.suggestedFix && (
          <p className="text-[11px] text-[#94a3b8]/60 italic leading-relaxed">
            → {score.suggestedFix}
          </p>
        )}
      </div>
    </div>
  )
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// ── Shared content ────────────────────────────────────────────────────────────

function ValidationContent({ run }: { run: ValidationRunWithScores }) {
  const orderedScores = [...run.scores].sort((a, b) =>
    a.criterionKey.localeCompare(b.criterionKey),
  )

  return (
    <>
      {/* Summary */}
      <div className="px-5 py-4 space-y-2">
        <VerdictBadge verdict={run.overallVerdict} />
        <p className="text-xs text-[#e2e8f0] leading-relaxed">{run.summary}</p>
        <p className="text-[11px] text-[#94a3b8]/60">{formatDate(run.createdAt)}</p>
      </div>

      <div style={{ borderTop: '1px solid #1e1e3a' }} />

      {/* Criteria */}
      <div
        className="px-5"
        style={{ borderColor: '#1a1a2e' }}
      >
        {orderedScores.map((score) => (
          <div
            key={score.id}
            style={
              orderedScores.indexOf(score) < orderedScores.length - 1
                ? { borderBottom: '1px solid #1a1a2e' }
                : {}
            }
          >
            <ScoreBlock score={score} />
          </div>
        ))}
      </div>

      {/* Suggested rewrite */}
      {run.suggestedRewrite && (
        <div
          className="mx-5 mb-5 mt-2 rounded-xl p-4 space-y-1.5"
          style={{ background: '#1c1400', border: '1px solid #92400e' }}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#f59e0b' }}>
            Reescritura sugerida
          </p>
          <p className="text-xs whitespace-pre-wrap leading-relaxed" style={{ color: '#fde68a' }}>
            {run.suggestedRewrite}
          </p>
        </div>
      )}

      {/* Metadata */}
      <div
        className="px-5 py-3 flex flex-wrap gap-3 text-[11px] text-[#94a3b8]/50"
        style={{ borderTop: '1px solid #1e1e3a' }}
      >
        <span>{run.validatorModel}</span>
        <span>Criterios v{run.criteriaVersion}</span>
        <span>Prompt v{run.validatorPromptVersion}</span>
      </div>
    </>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ValidationView({ run, panel = false }: Props) {
  if (panel) {
    return (
      <div className="flex flex-col overflow-y-auto">
        <ValidationContent run={run} />
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#0f0f1a', border: '1px solid #1e1e3a' }}
    >
      {/* Card header */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #1e1e3a' }}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm text-[#94a3b8] font-medium">Validación automática</span>
          <VerdictBadge verdict={run.overallVerdict} />
        </div>
        <p className="text-xs text-[#94a3b8]/60 mt-1">{formatDate(run.createdAt)}</p>
      </div>

      <div className="px-5 py-4 space-y-4">
        <p className="text-sm text-[#e2e8f0]">{run.summary}</p>

        <div>
          {[...run.scores]
            .sort((a, b) => a.criterionKey.localeCompare(b.criterionKey))
            .map((score, idx, arr) => (
              <div
                key={score.id}
                style={idx < arr.length - 1 ? { borderBottom: '1px solid #1a1a2e' } : {}}
              >
                <ScoreBlock score={score} />
              </div>
            ))}
        </div>

        {run.suggestedRewrite && (
          <div
            className="rounded-xl p-4 space-y-1.5"
            style={{ background: '#1c1400', border: '1px solid #92400e' }}
          >
            <p
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: '#f59e0b' }}
            >
              Reescritura sugerida
            </p>
            <p
              className="text-sm whitespace-pre-wrap leading-relaxed"
              style={{ color: '#fde68a' }}
            >
              {run.suggestedRewrite}
            </p>
          </div>
        )}

        <div
          className="flex flex-wrap gap-3 text-xs text-[#94a3b8]/50 pt-2"
          style={{ borderTop: '1px solid #1e1e3a' }}
        >
          <span>Modelo: {run.validatorModel}</span>
          <span>Criterios: {run.criteriaVersion}</span>
          <span>Prompt: {run.validatorPromptVersion}</span>
        </div>
      </div>
    </div>
  )
}
