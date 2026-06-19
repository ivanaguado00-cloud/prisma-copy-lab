import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '../../../../auth'
import { getBriefById } from '../../../../dao/briefDao'
import { getUserById } from '../../../../dao/userDao'
import { listVersionsByBrief } from '../../../../dao/messageVersionDao'
import { listValidationRunsByMessage } from '../../../../dao/validationRunDao'
import { generateMessageAction, refineMessageAction } from '../../../actions/messageActions'
import { WhatsAppPreviewTabs } from '../../../../components/messaging/WhatsAppPreviewTabs'
import { ReviewPanel } from '../../../../components/review/ReviewPanel'
import { SubmitForReviewButton } from '../../../../components/review/SubmitForReviewButton'
import {
  OVERALL_VERDICT,
  USER_ROLE,
  REVIEW_STATUS,
  EMAIL_TEMPLATE_LABELS,
  isAdmin,
  canReview,
  canSeeAllBriefs,
  canCreateBriefs,
} from '../../../../types/domain'
import type { ValidationRun, ValidationScore, MessageVersion } from '../../../../generated/prisma/client'

type ValidationRunWithScores = ValidationRun & { scores: ValidationScore[] }

// ── Constants ─────────────────────────────────────────────────────────────────

const QUALITY_THRESHOLD = 80

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

function formatBriefNumber(n: number): string {
  return `BR-${n.toString().padStart(3, '0')}`
}

function computeScore(scores: ValidationScore[]): number | null {
  if (scores.length === 0) return null
  const weights: Record<string, number> = { bien: 100, mejorable: 65, critico: 20 }
  const total = scores.reduce((sum, s) => sum + (weights[s.status] ?? 50), 0)
  return Math.round(total / scores.length)
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ReviewStatusBadge({ status, note }: { status: string; note?: string | null }) {
  const meta: Record<string, { label: string; cls: string }> = {
    pending:   { label: 'Borrador',             cls: 'bg-secondary-container text-on-secondary-container' },
    submitted: { label: 'En revisión por PM',   cls: 'bg-[#e9e8e7] text-[#1b1c1c]' },
    approved:  { label: 'Aprobado',             cls: 'bg-success-container text-on-success-container' },
    rejected:  { label: 'Rechazado',            cls: 'bg-error-container text-on-error-container' },
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

// ── Brief summary ─────────────────────────────────────────────────────────────

function BriefSummaryCard({ brief }: { brief: Awaited<ReturnType<typeof getBriefById>> }) {
  if (!brief) return null

  const rows: { label: string; value: string }[] = []
  if (brief.channel === 'email' && brief.emailTemplate) {
    rows.push({ label: 'Tipo de email', value: EMAIL_TEMPLATE_LABELS[brief.emailTemplate] ?? brief.emailTemplate })
  }
  if (brief.programOrTitulation) rows.push({ label: 'Programa / Titulación', value: brief.programOrTitulation })
  if (brief.objective)           rows.push({ label: 'Objetivo', value: brief.objective })
  if (brief.audience)            rows.push({ label: 'Audiencia', value: brief.audience })
  if (brief.valueProposition)    rows.push({ label: 'Parámetros del mensaje', value: brief.valueProposition })
  if (brief.cta)                 rows.push({ label: 'CTA', value: brief.cta })
  if (brief.constraints)         rows.push({ label: 'Criterio propio', value: brief.constraints })

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-outline-variant flex items-center justify-between gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">Cómo se completó el brief</h3>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <span className="font-medium">{CHANNEL_LABELS[brief.channel] ?? brief.channel}</span>
          <span className="opacity-40">·</span>
          <span>{MODE_LABELS[brief.mode] ?? brief.mode}</span>
          <span className="opacity-40">·</span>
          <span>{formatDate(brief.createdAt)}</span>
        </div>
      </div>
      <div className="divide-y divide-outline-variant">
        {rows.map(({ label, value }) => (
          <div key={label} className="px-5 py-3 grid grid-cols-[140px_1fr] gap-4 items-start">
            <span className="text-xs font-medium text-on-surface-variant shrink-0 pt-0.5">{label}</span>
            <span className="text-xs text-on-surface leading-relaxed">{value}</span>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="px-5 py-4 text-xs text-on-surface-variant">Sin datos de brief.</p>
        )}
      </div>
    </div>
  )
}

// ── Message content ───────────────────────────────────────────────────────────

function EmailMessageCard({ version }: { version: MessageVersion }) {
  const subject   = version.emailSubject ?? ''
  const preheader = version.emailPreheader ?? ''
  const body      = version.content ?? ''

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-outline-variant">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">El mensaje</h3>
      </div>

      {subject && (
        <div className="px-5 py-3 border-b border-outline-variant grid grid-cols-[90px_1fr] gap-4 items-start">
          <span className="text-xs font-medium text-on-surface-variant pt-0.5 shrink-0">Asunto</span>
          <span className="text-sm font-semibold text-on-surface leading-snug">{subject}</span>
        </div>
      )}

      {preheader && (
        <div className="px-5 py-3 border-b border-outline-variant grid grid-cols-[90px_1fr] gap-4 items-start">
          <span className="text-xs font-medium text-on-surface-variant pt-0.5 shrink-0">Preheader</span>
          <span className="text-xs text-on-surface-variant leading-relaxed italic">{preheader}</span>
        </div>
      )}

      {body && (
        <div className="px-5 py-4">
          <p className="text-xs font-medium text-on-surface-variant mb-2">Cuerpo del mensaje</p>
          <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed">{body}</p>
        </div>
      )}
    </div>
  )
}

function BelowThresholdCard({
  score,
  suggestedRewrite,
}: {
  score: number
  suggestedRewrite?: string | null
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-outline-variant">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">El mensaje</h3>
      </div>
      <div className="px-5 py-5 flex flex-col gap-4">
        <div className="flex items-start gap-3 bg-error-container/30 border border-error-container rounded-lg px-4 py-3">
          <span className="text-base shrink-0">⚠️</span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-on-surface">
              Esta versión no supera el umbral de calidad
            </p>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Puntuación obtenida: <strong>{score}/100</strong> (mínimo requerido: {QUALITY_THRESHOLD}/100). El contenido no se muestra hasta que la versión cumpla los criterios. Usa el panel de refinamiento para generar una versión mejorada basada en los criterios del análisis.
            </p>
          </div>
        </div>

        {suggestedRewrite && (
          <div className="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Reescritura sugerida por la IA
            </p>
            <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed">
              {suggestedRewrite}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Version history (left sidebar) ───────────────────────────────────────────

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
                  ? 'bg-[#1b1c1c] border-[#1b1c1c]'
                  : 'bg-surface-container-highest border-outline-variant'
              }`}
            />
            <p className="text-xs font-bold text-on-surface">
              {isCurrent ? `Versión actual (v${v.versionNumber})` : `v${v.versionNumber}`}
            </p>
            {v.userInstruction ? (
              <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">
                &ldquo;{v.userInstruction}&rdquo;
              </p>
            ) : (
              <p className="text-xs text-on-surface-variant mt-0.5">Generación inicial</p>
            )}
            {run && (
              <p className="text-xs text-on-surface-variant/60 mt-0.5">
                {verdictLabel[run.overallVerdict] ?? run.overallVerdict}
              </p>
            )}
            <p className="text-[10px] text-on-surface-variant/40 uppercase mt-1">
              {formatDate(v.createdAt)}
            </p>
          </div>
        )
      })}
    </div>
  )
}

// ── Quality analysis ──────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; cls: string; critical?: boolean }> = {
  bien:      { label: 'Correcto',  cls: 'bg-success-container text-on-success-container' },
  mejorable: { label: 'Mejorable', cls: 'bg-warning-container text-on-warning-container' },
  critico:   { label: 'Revisar',   cls: 'bg-error-container text-on-error-container', critical: true },
}

function CriterionRow({ score, index }: { score: ValidationScore; index: number }) {
  const meta = STATUS_META[score.status] ?? { label: score.status, cls: 'bg-secondary-container text-on-secondary-container' }
  return (
    <div className={`px-5 py-3 border-b border-outline-variant last:border-0 ${meta.critical ? 'border-l-2 border-l-error-cp' : ''}`}>
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-bold text-on-surface-variant/50 shrink-0 w-5 text-right">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-xs font-semibold text-on-surface leading-snug truncate">{score.criterionName}</span>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${meta.cls}`}>
          {meta.label}
        </span>
      </div>
      <p className="text-xs text-on-surface-variant pl-7 leading-relaxed">{score.comment}</p>
      {score.suggestedFix && (
        <p className="text-[11px] text-on-surface-variant/60 italic pl-7 mt-1 leading-relaxed">
          → {score.suggestedFix}
        </p>
      )}
    </div>
  )
}

// ── Brief history timeline ────────────────────────────────────────────────────

function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

interface HistoryEvent {
  id: string
  type: 'created' | 'version' | 'submitted' | 'approved' | 'approved_adjusted' | 'rejected' | 'crm'
  date: Date
  label: string
  detail?: string | null
  actor?: string | null
}

const EVENT_META: Record<HistoryEvent['type'], { dotCls: string; labelCls: string }> = {
  created:           { dotCls: 'bg-[#1b1c1c]',                                        labelCls: 'text-[#1b1c1c]' },
  version:           { dotCls: 'bg-[#7e7576] border-2 border-[#cfc4c5]',              labelCls: 'text-[#4c4546]' },
  submitted:         { dotCls: 'bg-[#cfc4c5]',                                         labelCls: 'text-[#7e7576]' },
  approved:          { dotCls: 'bg-[#1a7a4a]',                                         labelCls: 'text-[#1a7a4a]' },
  approved_adjusted: { dotCls: 'bg-[#b08c30]',                                         labelCls: 'text-[#7c5c0a]' },
  rejected:          { dotCls: 'bg-[#93000a]',                                         labelCls: 'text-[#93000a]' },
  crm:               { dotCls: 'bg-[#1b1c1c] border-2 border-[#1b1c1c]',              labelCls: 'text-[#1b1c1c]' },
}

function BriefHistoryTimeline({ events }: { events: HistoryEvent[] }) {
  if (events.length === 0) return null

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-outline-variant">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">Histórico del briefing</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Trazabilidad completa del proceso</p>
      </div>

      <div className="px-5 py-5">
        <div className="relative space-y-5 before:absolute before:left-[6px] before:top-2 before:bottom-2 before:w-px before:bg-outline-variant">
          {events.map((ev) => {
            const meta = EVENT_META[ev.type]
            return (
              <div key={ev.id} className="relative pl-7">
                <span
                  className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full z-10 ${meta.dotCls}`}
                />
                <div className="flex flex-col gap-0.5">
                  <span className={`text-xs font-semibold ${meta.labelCls}`}>{ev.label}</span>
                  {ev.detail && (
                    <span className="text-xs text-on-surface-variant leading-relaxed">
                      {ev.detail}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    {ev.actor && (
                      <span className="text-[11px] text-on-surface-variant font-medium">{ev.actor}</span>
                    )}
                    <span className="text-[10px] text-on-surface-variant/50">{formatDateTime(ev.date)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── A/B comparison view ───────────────────────────────────────────────────────

function ABVariantCard({
  variant,
  version,
  validationRun,
  channel,
  isReviewer,
}: {
  variant: 'A' | 'B'
  version: MessageVersion
  validationRun: ValidationRunWithScores | null
  channel: string
  isReviewer: boolean
}) {
  const scores = validationRun
    ? [...validationRun.scores].sort((a, b) => a.criterionKey.localeCompare(b.criterionKey))
    : []
  const overallScore = computeScore(scores)
  const showContent = isReviewer || overallScore === null || overallScore >= QUALITY_THRESHOLD

  const verdictColors: Record<string, { bg: string; text: string }> = {
    aprobada:             { bg: 'bg-success-container', text: 'text-on-success-container' },
    aprobada_con_ajustes: { bg: 'bg-warning-container', text: 'text-[#7c5c0a]' },
    no_aprobada:          { bg: 'bg-error-container',   text: 'text-on-error-container' },
  }
  const verdictLabel: Record<string, string> = {
    aprobada:             'Aprobada',
    aprobada_con_ajustes: 'Con ajustes',
    no_aprobada:          'No aprobada',
  }
  const vc = validationRun ? verdictColors[validationRun.overallVerdict] : null

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-outline-variant flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#1b1c1c] text-white text-xs font-bold shrink-0">
            {variant}
          </span>
          <p className="text-xs font-semibold text-on-surface">
            {variant === 'A' ? 'Flexibilidad y progreso' : 'Empleabilidad y retorno'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {overallScore !== null && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${overallScore >= QUALITY_THRESHOLD ? 'bg-success-container text-on-success-container' : 'bg-error-container text-on-error-container'}`}>
              {overallScore}/100
            </span>
          )}
          {vc && validationRun && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${vc.bg} ${vc.text}`}>
              {verdictLabel[validationRun.overallVerdict]}
            </span>
          )}
        </div>
      </div>

      {/* Message content */}
      {showContent ? (
        channel === 'email' ? (
          <div className="px-5 py-4 space-y-3">
            {version.emailSubject && (
              <div>
                <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Asunto</p>
                <p className="text-sm font-semibold text-on-surface leading-snug">{version.emailSubject}</p>
              </div>
            )}
            {version.emailPreheader && (
              <div>
                <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Preheader</p>
                <p className="text-xs text-on-surface-variant italic leading-relaxed">{version.emailPreheader}</p>
              </div>
            )}
            {version.content && (
              <div>
                <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Cuerpo</p>
                <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed">{version.content}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="px-5 py-4">
            <WhatsAppPreviewTabs content={version.content} />
          </div>
        )
      ) : (
        <div className="px-5 py-4">
          <p className="text-xs text-on-surface-variant">
            Puntuación {overallScore}/100 — por debajo del umbral de calidad ({QUALITY_THRESHOLD}).
          </p>
        </div>
      )}

      {/* Validation summary */}
      {validationRun?.summary && (
        <div className="px-5 py-3 border-t border-outline-variant bg-surface-container-low">
          <p className="text-xs text-on-surface-variant leading-relaxed">{validationRun.summary}</p>
        </div>
      )}

      {/* Criteria */}
      {scores.length > 0 && (
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer px-5 py-2.5 border-t border-outline-variant list-none select-none hover:bg-surface-container-low transition-colors">
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Criterios</p>
            <span className="text-[10px] text-on-surface-variant group-open:rotate-180 transition-transform inline-block">▾</span>
          </summary>
          <div className="divide-y divide-outline-variant">
            {scores.map((score, idx) => (
              <CriterionRow key={score.id} score={score} index={idx} />
            ))}
          </div>
        </details>
      )}
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

  const role        = session.user.role
  const admin       = isAdmin(role)
  const isReviewer  = canReview(role)
  const seeAll      = canSeeAllBriefs(role)
  const canGenerate = canCreateBriefs(role)

  const [brief, versions] = await Promise.all([
    getBriefById(id, seeAll ? undefined : session.user.id),
    listVersionsByBrief(id),
  ])
  if (!brief) notFound()

  // Fetch user names for timeline (fire in parallel, graceful null on miss)
  const [creatorUser, reviewerUser, crmUser] = await Promise.all([
    brief.userId    ? getUserById(brief.userId)    : null,
    brief.reviewedBy ? getUserById(brief.reviewedBy) : null,
    brief.crmSentBy  ? getUserById(brief.crmSentBy)  : null,
  ])

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

  // Message is hidden for non-reviewers if below threshold
  const showMessageContent =
    isReviewer ||
    overallScore === null ||
    overallScore >= QUALITY_THRESHOLD

  // ── Build history timeline ──────────────────────────────────────────────────
  const historyEvents: HistoryEvent[] = []

  // 1. Creación
  historyEvents.push({
    id: 'created',
    type: 'created',
    date: brief.createdAt,
    label: 'Briefing creado',
    detail: `Canal: ${CHANNEL_LABELS[brief.channel] ?? brief.channel}`,
    actor: creatorUser?.name ?? creatorUser?.email ?? null,
  })

  // 2. Versiones generadas (ordenadas por fecha)
  const sortedVersions = [...versions].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  for (const v of sortedVersions) {
    historyEvents.push({
      id: `version-${v.id}`,
      type: 'version',
      date: v.createdAt,
      label: v.versionNumber === 1 ? 'v1 — Primera versión generada' : `v${v.versionNumber} — Nueva versión generada`,
      detail: v.userInstruction ? `"${v.userInstruction}"` : null,
      actor: null,
    })
  }

  // 3. Revisión del PM (solo si ya ocurrió)
  if (brief.reviewedAt && brief.reviewedBy) {
    const reviewType =
      brief.reviewStatus === 'approved' && validationRunsByVersion[versions.at(-1)?.id ?? '']?.overallVerdict === 'aprobada_con_ajustes'
        ? 'approved_adjusted'
        : brief.reviewStatus === 'approved'
        ? 'approved'
        : 'rejected'

    historyEvents.push({
      id: 'review',
      type: reviewType,
      date: brief.reviewedAt,
      label:
        reviewType === 'approved'          ? 'Aprobado por el PM'           :
        reviewType === 'approved_adjusted' ? 'Aprobado con ajustes por el PM' :
                                             'Rechazado por el PM',
      detail: brief.reviewNote ?? null,
      actor: reviewerUser?.name ?? reviewerUser?.email ?? null,
    })
  } else if (brief.reviewStatus === 'submitted') {
    // Enviado a revisión pero el PM todavía no ha actuado
    historyEvents.push({
      id: 'submitted',
      type: 'submitted',
      date: brief.updatedAt,
      label: 'Enviado a revisión',
      detail: 'Pendiente de validación por el PM',
      actor: creatorUser?.name ?? creatorUser?.email ?? null,
    })
  }

  // 4. CRM
  if (brief.crmSentAt) {
    historyEvents.push({
      id: 'crm',
      type: 'crm',
      date: brief.crmSentAt,
      label: 'Enviado a CRM',
      detail: brief.crmInternalSubject ?? null,
      actor: crmUser?.name ?? crmUser?.email ?? null,
    })
  }

  // Sort chronologically
  historyEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const isEmailApproved =
    brief.channel === 'email' &&
    latestValidationRun !== null &&
    (latestValidationRun.overallVerdict === OVERALL_VERDICT.aprobada ||
      latestValidationRun.overallVerdict === OVERALL_VERDICT.aprobada_con_ajustes)

  const isOwner = brief.userId === session.user.id || admin
  const generateWithId = generateMessageAction.bind(null, id)

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-8">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <section className="mb-8">
        <div className="flex items-center gap-2 text-on-surface-variant mb-4 text-xs">
          <Link href="/briefs" className="hover:text-on-surface transition-colors">Briefs</Link>
          <span>›</span>
          <span className="font-semibold">{formatBriefNumber(brief.briefNumber)}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1
                className="text-4xl font-bold text-on-surface leading-tight tracking-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {brief.title}
              </h1>
              {brief.generationMode === 'ab_test' && (
                <span className="inline-flex items-center text-xs font-bold border-2 border-[#1b1c1c] text-[#1b1c1c] rounded-full px-2.5 py-0.5 shrink-0">
                  A/B
                </span>
              )}
            </div>
            {brief.objective && (
              <p className="text-base text-on-surface-variant max-w-2xl leading-relaxed">
                {brief.objective}
              </p>
            )}
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <ReviewStatusBadge
              status={brief.reviewStatus ?? REVIEW_STATUS.pending}
              note={brief.reviewNote}
            />
          </div>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-outline-variant">
          <div className="flex flex-wrap items-center gap-3">
            {canGenerate && isOwner && (
              <form action={generateWithId}>
                <button
                  type="submit"
                  className="bg-[#1b1c1c] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#4c4546] transition-all"
                >
                  {versions.length === 0 ? 'Generar mensaje' : '+ Nueva versión'}
                </button>
              </form>
            )}
            {brief.crmStatus === 'sent_to_crm' && (
              <>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[#ddf4ff] text-[#0550ae] border border-[#54aeff]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0550ae]" />
                  Enviado
                </span>
                <Link
                  href={`/analisis?briefIds=${brief.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border border-outline-variant text-on-surface-variant hover:border-on-surface hover:text-on-surface transition-colors"
                >
                  Ver en Análisis →
                </Link>
              </>
            )}
            <a
              href={`/api/export/${brief.id}`}
              download
              className="px-4 py-2.5 text-sm border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-on-surface rounded transition-all"
            >
              ↓ Exportar
            </a>
          </div>

          {/* Enviar a revisión — solo el autor/admin ve esto */}
          {canGenerate && versions.length > 0 && (
            <SubmitForReviewButton
              briefId={brief.id}
              reviewStatus={brief.reviewStatus ?? REVIEW_STATUS.pending}
              isOwner={isOwner}
            />
          )}
        </div>
      </section>

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {versions.length === 0 ? (
        <div className="flex flex-col gap-5">
          <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl px-6 py-16 text-center">
            <p className="text-base font-semibold text-on-surface mb-2">Sin mensajes todavía</p>
            <p className="text-sm text-on-surface-variant">
              Pulsa &ldquo;Generar mensaje&rdquo; para crear la primera versión.
            </p>
          </div>
          <BriefHistoryTimeline events={historyEvents} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Left column (4/12) — historial + refinar ─────────────────── */}
          <div className="lg:col-span-4 flex flex-col gap-5">

            {/* Review panel — solo revisores */}
            {isReviewer && (
              <ReviewPanel
                briefId={brief.id}
                currentStatus={brief.reviewStatus ?? REVIEW_STATUS.pending}
                currentNote={brief.reviewNote}
              />
            )}

            {/* Version history */}
            <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-5">
                Historial de versiones
              </h3>
              <VersionHistoryTimeline
                versions={versions}
                validationByVersion={validationRunsByVersion}
              />
            </div>

            {/* Refine form — immediately below history */}
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
                    className="w-full text-sm rounded border border-[#cfc4c5] bg-transparent px-3 py-2 text-on-surface resize-none focus:outline-none focus:border-[#1b1c1c] placeholder:text-on-surface-variant/50 transition-all"
                  />
                  <button
                    type="submit"
                    className="self-end bg-[#1b1c1c] text-white px-5 py-2 rounded text-sm font-semibold hover:bg-[#4c4546] transition-all"
                  >
                    Refinar
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* ── Right column (8/12) ─────────────────────────────────────── */}
          <div className="lg:col-span-8 flex flex-col gap-5">

            {/* 1. Brief summary */}
            <BriefSummaryCard brief={brief} />

            {/* 2. El mensaje — A/B o estándar */}
            {brief.generationMode === 'ab_test' && versions.length >= 2 ? (
              /* A/B comparison */
              <>
                <div className="flex items-center gap-2 px-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold border border-[#1b1c1c] text-[#1b1c1c] rounded-full px-2.5 py-0.5">
                    A/B
                  </span>
                  <p className="text-xs text-on-surface-variant">Dos variantes generadas con el mismo briefing</p>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <ABVariantCard
                    variant="A"
                    version={versions[0]!}
                    validationRun={validationRunsByVersion[versions[0]!.id] as ValidationRunWithScores | null}
                    channel={brief.channel}
                    isReviewer={isReviewer}
                  />
                  <ABVariantCard
                    variant="B"
                    version={versions[1]!}
                    validationRun={validationRunsByVersion[versions[1]!.id] as ValidationRunWithScores | null}
                    channel={brief.channel}
                    isReviewer={isReviewer}
                  />
                </div>
              </>
            ) : latestVersion ? (
              /* Standard single message */
              <>
                {brief.channel === 'whatsapp' ? (
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-4">
                      El mensaje
                    </h3>
                    <WhatsAppPreviewTabs content={latestVersion.content} contactName={brief.title} />
                  </div>
                ) : showMessageContent ? (
                  <EmailMessageCard version={latestVersion} />
                ) : (
                  <BelowThresholdCard
                    score={overallScore!}
                    suggestedRewrite={latestValidationRun?.suggestedRewrite}
                  />
                )}
              </>
            ) : null}

            {/* 3. Análisis de calidad (secondary) */}
            {latestValidationRun && (
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer bg-surface-container-lowest border border-outline-variant rounded-lg px-5 py-4 list-none select-none hover:border-on-surface transition-colors">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                      Análisis de calidad
                    </h3>
                    {overallScore !== null && (
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          overallScore >= QUALITY_THRESHOLD
                            ? 'bg-success-container text-on-success-container'
                            : 'bg-error-container text-on-error-container'
                        }`}
                      >
                        {overallScore}/100
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-on-surface-variant group-open:rotate-180 transition-transform inline-block">
                    ▾
                  </span>
                </summary>

                <div className="bg-surface-container-lowest border border-t-0 border-outline-variant rounded-b-lg overflow-hidden mt-[-1px]">
                  {/* Summary line */}
                  {latestValidationRun.summary && (
                    <div className="px-5 py-3 border-b border-outline-variant">
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {latestValidationRun.summary}
                      </p>
                    </div>
                  )}

                  {/* Criteria rows */}
                  {orderedScores.map((score, idx) => (
                    <CriterionRow key={score.id} score={score} index={idx} />
                  ))}

                  {/* Footer meta */}
                  <div className="px-5 py-2.5 bg-surface-container-low border-t border-outline-variant flex gap-4 text-[10px] text-on-surface-variant/40">
                    <span>{latestValidationRun.validatorModel}</span>
                    <span>Criterios v{latestValidationRun.criteriaVersion}</span>
                    <span>Prompt v{latestValidationRun.validatorPromptVersion}</span>
                  </div>
                </div>
              </details>
            )}

            {/* 4. Histórico del briefing */}
            <BriefHistoryTimeline events={historyEvents} />

          </div>
        </div>
      )}
    </div>
  )
}
