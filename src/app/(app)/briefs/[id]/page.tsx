import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '../../../../auth'
import { getBriefById } from '../../../../dao/briefDao'
import { listVersionsByBrief } from '../../../../dao/messageVersionDao'
import { listValidationRunsByMessage } from '../../../../dao/validationRunDao'
import { generateMessageAction, refineMessageAction } from '../../../actions/messageActions'
import { PrepareCrmButton } from '../../../../components/crm/PrepareCrmButton'
import { ReviewPanel } from '../../../../components/review/ReviewPanel'
import { OVERALL_VERDICT, USER_ROLE, REVIEW_STATUS, EMAIL_TEMPLATE_LABELS } from '../../../../types/domain'
import type { ValidationRun, ValidationScore, MessageVersion } from '../../../../generated/prisma/client'

type ValidationRunWithScores = ValidationRun & { scores: ValidationScore[] }

// ── Helpers ───────────────────────────────────────────────────────────────────

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
}

const MODE_LABELS: Record<string, string> = {
  produccion: 'Producción',
  exploracion: 'Exploración',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

function formatBriefNumber(briefNumber: number): string {
  return `BR-${briefNumber.toString().padStart(3, '0')}`
}

function computeScore(scores: ValidationScore[]): number | null {
  if (scores.length === 0) return null
  const weights: Record<string, number> = { bien: 100, mejorable: 65, critico: 20 }
  const total = scores.reduce((sum, s) => sum + (weights[s.status] ?? 50), 0)
  return Math.round(total / scores.length)
}

// ── Sub-components ────────────────────────────────────────────────────────────

function OverallVerdictBadge({ verdict }: { verdict: string }) {
  const meta: Record<string, { label: string; cls: string }> = {
    aprobada:             { label: 'Aprobada',     cls: 'bg-success-container text-on-success-container' },
    aprobada_con_ajustes: { label: 'Con ajustes',  cls: 'bg-warning-container text-on-warning-container' },
    no_aprobada:          { label: 'No aprobada',  cls: 'bg-error-container text-on-error-container' },
  }
  const m = meta[verdict] ?? { label: verdict, cls: 'bg-secondary-container text-on-secondary-container' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${m.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {m.label}
    </span>
  )
}

function ReviewStatusBadge({ status, note }: { status: string; note?: string | null }) {
  const meta: Record<string, { label: string; cls: string }> = {
    pending:  { label: 'Pendiente de revisión', cls: 'bg-secondary-container text-on-secondary-container' },
    approved: { label: 'Aprobado',              cls: 'bg-success-container text-on-success-container' },
    rejected: { label: 'Rechazado',             cls: 'bg-error-container text-on-error-container' },
  }
  const m = meta[status] ?? { label: status, cls: 'bg-secondary-container text-on-secondary-container' }
  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold w-fit ${m.cls}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {m.label}
      </span>
      {note && (
        <p className="text-xs text-on-surface-variant pl-1 max-w-xs leading-relaxed">{note}</p>
      )}
    </div>
  )
}

const STATUS_META: Record<string, { label: string; cls: string; critical?: boolean }> = {
  bien:      { label: 'Correcto',  cls: 'bg-secondary-fixed-dim text-on-surface' },
  mejorable: { label: 'Mejorable', cls: 'bg-warning-container text-on-warning-container' },
  critico:   { label: 'Revisar',   cls: 'bg-error-container text-on-error-container', critical: true },
}

function CriterionCard({ score, index }: { score: ValidationScore; index: number }) {
  const meta = STATUS_META[score.status] ?? { label: score.status, cls: 'bg-secondary-container text-on-secondary-container' }
  return (
    <div
      className={`bg-surface-container-lowest border border-outline-variant p-4 rounded-lg transition-colors ${
        meta.critical
          ? 'border-l-4 border-l-error-cp'
          : 'hover:border-on-surface'
      }`}
    >
      <div className="flex justify-between items-start mb-2 gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded flex items-center justify-center font-bold text-xs shrink-0 ${
              meta.critical ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-on-surface'
            }`}
          >
            {String(index + 1).padStart(2, '0')}
          </div>
          <h4 className="font-semibold text-sm text-on-surface leading-snug">{score.criterionName}</h4>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded shrink-0 ${meta.cls}`}>
          {meta.label}
        </span>
      </div>
      <p className="text-sm text-on-surface-variant pl-12 leading-relaxed">{score.comment}</p>
      {score.suggestedFix && (
        <p className="text-xs text-on-surface-variant/70 italic pl-12 mt-1 leading-relaxed">
          → {score.suggestedFix}
        </p>
      )}
    </div>
  )
}

function VersionHistoryTimeline({
  versions,
  validationByVersion,
}: {
  versions: MessageVersion[]
  validationByVersion: Record<string, { overallVerdict: string } | null>
}) {
  const verdictLabel: Record<string, string> = {
    aprobada:             'Aprobada',
    aprobada_con_ajustes: 'Con ajustes',
    no_aprobada:          'No aprobada',
  }

  return (
    <div className="relative space-y-5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-outline-variant">
      {[...versions].reverse().map((v, idx) => {
        const run = validationByVersion[v.id]
        const isCurrent = idx === 0
        return (
          <div key={v.id} className="relative pl-8">
            <div
              className={`absolute left-[4px] top-1 w-4 h-4 rounded-full border-2 z-10 ${
                isCurrent
                  ? 'bg-secondary-fixed-dim border-on-surface'
                  : 'bg-surface-container-highest border-outline-variant'
              }`}
            />
            <p className={`text-xs font-bold ${isCurrent ? 'text-on-surface' : 'text-on-surface'}`}>
              {isCurrent ? `Versión actual (v${v.versionNumber})` : `Versión v${v.versionNumber}`}
            </p>
            {v.userInstruction ? (
              <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">&ldquo;{v.userInstruction}&rdquo;</p>
            ) : (
              <p className="text-xs text-on-surface-variant mt-0.5">Generación inicial</p>
            )}
            {run && (
              <p className="text-xs text-on-surface-variant/60 mt-0.5">
                {verdictLabel[run.overallVerdict] ?? run.overallVerdict}
              </p>
            )}
            <p className="text-[10px] text-on-tertiary-container uppercase mt-1">
              {formatDate(v.createdAt)}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function MessagePreviewCard({ version, channel }: { version: MessageVersion; channel: string }) {
  const isWA = channel === 'whatsapp'
  return (
    <div className="bg-on-surface text-white p-5 rounded-lg flex flex-col gap-4 overflow-hidden relative">
      <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </div>
      <h3 className="text-xs font-bold flex items-center gap-2 tracking-wider uppercase opacity-70">
        <span>{isWA ? '💬' : '✉️'}</span> Vista previa del mensaje
      </h3>
      <div className="bg-white text-on-surface p-4 rounded shadow-sm border-l-4 border-secondary-fixed-dim relative z-10">
        <p className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-6">{version.content}</p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return { title: 'Briefing - PRISMA Copy Lab' }
  const brief = await getBriefById(id, session.user.id)
  return { title: brief ? `${brief.title} — PRISMA Copy Lab` : 'Briefing - PRISMA Copy Lab' }
}

export default async function BriefDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isReviewer = session.user.role === USER_ROLE.reviewer

  const [brief, versions] = await Promise.all([
    // Revisores pueden ver cualquier brief; autores solo los suyos
    getBriefById(id, isReviewer ? undefined : session.user.id),
    listVersionsByBrief(id),
  ])
  if (!brief) notFound()

  const validationRunsByVersion = Object.fromEntries(
    await Promise.all(
      versions.map(async (v) => {
        const runs = await listValidationRunsByMessage(v.id)
        return [v.id, runs[0] ?? null] as const
      }),
    ),
  )

  const latestVersion = versions.at(-1) ?? null
  const latestValidationRun: ValidationRunWithScores | null = latestVersion
    ? (validationRunsByVersion[latestVersion.id] as ValidationRunWithScores | null)
    : null

  const orderedScores = latestValidationRun
    ? [...latestValidationRun.scores].sort((a, b) => a.criterionKey.localeCompare(b.criterionKey))
    : []

  const overallScore = computeScore(orderedScores)

  const isEmailApproved =
    brief.channel === 'email' &&
    latestValidationRun !== null &&
    (latestValidationRun.overallVerdict === OVERALL_VERDICT.aprobada ||
      latestValidationRun.overallVerdict === OVERALL_VERDICT.aprobada_con_ajustes)

  const generateWithId = generateMessageAction.bind(null, id)

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-8">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <section className="mb-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-on-surface-variant mb-4 text-xs">
          <Link href="/briefs" className="hover:text-on-surface transition-colors">
            Briefs
          </Link>
          <span>›</span>
          <span className="font-semibold">{formatBriefNumber(brief.briefNumber)}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1
              className="text-4xl font-bold text-on-surface leading-tight mb-2 tracking-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {brief.title}
            </h1>
            {brief.objective && (
              <p className="text-base text-on-surface-variant max-w-2xl leading-relaxed">
                {brief.objective}
              </p>
            )}
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            {latestValidationRun && (
              <OverallVerdictBadge verdict={latestValidationRun.overallVerdict} />
            )}
            <ReviewStatusBadge
              status={brief.reviewStatus ?? REVIEW_STATUS.pending}
              note={brief.reviewNote}
            />
            <div className="flex items-center gap-3 text-xs text-on-surface-variant">
              <span className="font-semibold">{CHANNEL_LABELS[brief.channel] ?? brief.channel}</span>
              <span>·</span>
              <span>{MODE_LABELS[brief.mode] ?? brief.mode}</span>
              <span>·</span>
              <span>{formatDate(brief.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-outline-variant">
          <form action={generateWithId}>
            <button
              type="submit"
              className="bg-on-surface text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-on-surface-variant transition-all flex items-center gap-2"
            >
              {versions.length === 0 ? 'Generar mensaje' : '+ Nueva versión'}
            </button>
          </form>
          <PrepareCrmButton brief={brief} isEmailApproved={isEmailApproved} />
          <a
            href={`/api/export/${brief.id}`}
            download
            className="px-4 py-2.5 text-sm border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-on-surface rounded transition-all"
          >
            ↓ Exportar
          </a>
        </div>
      </section>

      {/* ── No messages empty state ──────────────────────────────────────── */}
      {versions.length === 0 ? (
        <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl px-6 py-16 text-center">
          <p className="text-base font-semibold text-on-surface mb-2">Sin mensajes todavía</p>
          <p className="text-sm text-on-surface-variant">
            Pulsa &ldquo;Generar mensaje&rdquo; para crear la primera versión.
          </p>
        </div>
      ) : (
        /* ── Bento grid ───────────────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Left column (4/12) ──────────────────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Review panel — solo visible para revisores */}
            {isReviewer && (
              <ReviewPanel
                briefId={brief.id}
                currentStatus={brief.reviewStatus ?? REVIEW_STATUS.pending}
                currentNote={brief.reviewNote}
              />
            )}

            {/* Version History */}
            <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-5 flex items-center gap-2">
                Historial de versiones
              </h3>
              <VersionHistoryTimeline
                versions={versions}
                validationByVersion={validationRunsByVersion}
              />
            </div>

            {/* Message Preview */}
            {latestVersion && (
              <MessagePreviewCard version={latestVersion} channel={brief.channel} />
            )}

            {/* Refine form */}
            {latestVersion && (
              <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-lg">
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3">
                  Refinar mensaje
                </h3>
                <form
                  action={refineMessageAction.bind(null, brief.id, latestVersion.id)}
                  className="flex flex-col gap-3"
                >
                  <textarea
                    name="userInstruction"
                    placeholder='Ej. "hazlo más directo", "reduce el tono promocional"…'
                    rows={3}
                    className="w-full text-sm rounded border border-outline-variant bg-surface-bright px-3 py-2 text-on-surface resize-none focus:outline-none focus:border-on-surface placeholder:text-on-surface-variant/50 transition-all"
                  />
                  <button
                    type="submit"
                    className="self-end bg-on-surface text-white px-5 py-2 rounded text-sm font-semibold hover:bg-on-surface-variant transition-all"
                  >
                    Refinar
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* ── Right column (8/12) ─────────────────────────────────────── */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Score overview */}
            {latestValidationRun ? (
              <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-lg flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-3xl font-bold text-on-surface">
                    {overallScore !== null ? `${overallScore}/100` : '—'}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">Puntuación global de cumplimiento</p>
                  {latestValidationRun.summary && (
                    <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                      {latestValidationRun.summary}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <OverallVerdictBadge verdict={latestValidationRun.overallVerdict} />
                  <p className="text-xs text-on-surface-variant">Validación IA</p>
                  <p className="text-[10px] text-on-surface-variant/50">
                    {latestValidationRun.validatorModel} · v{latestValidationRun.criteriaVersion}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-lg">
                <p className="text-sm text-on-surface-variant">
                  Los resultados de validación aparecerán aquí una vez generado y evaluado el mensaje.
                </p>
              </div>
            )}

            {/* Suggested rewrite */}
            {latestValidationRun?.suggestedRewrite && (
              <div className="bg-warning-container border border-warning-container/60 p-4 rounded-lg">
                <p className="text-xs font-bold uppercase tracking-wider text-on-warning-container mb-2">
                  Reescritura sugerida
                </p>
                <p className="text-sm text-on-warning-container whitespace-pre-wrap leading-relaxed">
                  {latestValidationRun.suggestedRewrite}
                </p>
              </div>
            )}

            {/* Validation criteria */}
            {orderedScores.length > 0 && (
              <div className="flex flex-col gap-3">
                {orderedScores.map((score, idx) => (
                  <CriterionCard key={score.id} score={score} index={idx} />
                ))}
              </div>
            )}

            {/* Brief context cards */}
            {(brief.audience || brief.valueProposition || brief.cta) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                {brief.audience && (
                  <div className="p-4 border border-outline-variant rounded-lg hover:border-on-surface transition-colors">
                    <p className="text-xs font-bold text-on-surface mb-1">Audiencia</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{brief.audience}</p>
                  </div>
                )}
                {brief.valueProposition && (
                  <div className="p-4 border border-outline-variant rounded-lg hover:border-on-surface transition-colors">
                    <p className="text-xs font-bold text-on-surface mb-1">Propuesta de valor</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{brief.valueProposition}</p>
                  </div>
                )}
                {brief.cta && (
                  <div className="p-4 border border-outline-variant rounded-lg hover:border-on-surface transition-colors">
                    <p className="text-xs font-bold text-on-surface mb-1">CTA</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{brief.cta}</p>
                  </div>
                )}
              </div>
            )}

            {/* Email-specific context cards */}
            {brief.channel === 'email' && (brief.emailSubject || brief.emailPreheader || brief.emailTemplate) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                {brief.emailSubject && (
                  <div className="p-4 border border-outline-variant rounded-lg hover:border-on-surface transition-colors">
                    <p className="text-xs font-bold text-on-surface mb-1">Asunto</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{brief.emailSubject}</p>
                  </div>
                )}
                {brief.emailPreheader && (
                  <div className="p-4 border border-outline-variant rounded-lg hover:border-on-surface transition-colors">
                    <p className="text-xs font-bold text-on-surface mb-1">Preheader</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{brief.emailPreheader}</p>
                  </div>
                )}
                {brief.emailTemplate && (
                  <div className="p-4 border border-outline-variant rounded-lg hover:border-on-surface transition-colors">
                    <p className="text-xs font-bold text-on-surface mb-1">Plantilla</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {EMAIL_TEMPLATE_LABELS[brief.emailTemplate] ?? brief.emailTemplate}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
