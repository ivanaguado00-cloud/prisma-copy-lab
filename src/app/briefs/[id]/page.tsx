import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '../../../auth'
import { getBriefById } from '../../../dao/briefDao'
import { listVersionsByBrief } from '../../../dao/messageVersionDao'
import { listValidationRunsByMessage } from '../../../dao/validationRunDao'
import { generateMessageAction, refineMessageAction } from '../../actions/messageActions'
import { MessageVersionView } from '../../../components/messaging/MessageVersionView'
import { ValidationView } from '../../../components/validation/ValidationView'
import { VersionTree } from '../../../components/messaging/VersionTree'

// ── Labels ────────────────────────────────────────────────────────────────────

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
}

const MODE_LABELS: Record<string, string> = {
  produccion: 'Producción',
  exploracion: 'Exploración',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

function ChannelBadge({ channel }: { channel: string }) {
  const isWhatsApp = channel === 'whatsapp'
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${
        isWhatsApp
          ? 'bg-[#052e16] text-[#34d399] border-[#065f46]'
          : 'bg-[#1e1b4b] text-[#a5b4fc] border-[#3730a3]'
      }`}
    >
      {isWhatsApp ? '💬' : '✉'} {CHANNEL_LABELS[channel] ?? channel}
    </span>
  )
}

function ModeBadge({ mode }: { mode: string }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${
        mode === 'exploracion'
          ? 'bg-[#1e1b4b] text-[#a5b4fc] border-[#3730a3]'
          : 'bg-[#0f0f1a] text-[#94a3b8] border-[#1e1e3a]'
      }`}
    >
      {MODE_LABELS[mode] ?? mode}
    </span>
  )
}

function BriefField({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">{label}</p>
      <p className="text-sm text-[#e2e8f0] leading-relaxed whitespace-pre-wrap">{value}</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const brief = await getBriefById(id)
  return {
    title: brief ? `${brief.title} — PRISMA Copy Lab` : 'Briefing no encontrado',
  }
}

export default async function BriefDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const [brief, versions] = await Promise.all([
    getBriefById(id, session.user.id),
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

  const latestValidationRun = [...versions]
    .reverse()
    .map((v) => validationRunsByVersion[v.id])
    .find(Boolean) ?? null

  const generateWithId = generateMessageAction.bind(null, id)

  return (
    <div
      className="flex h-[calc(100vh-3.5rem)] overflow-hidden"
      style={{ background: '#0a0a0f' }}
    >

      {/* ─── LEFT PANEL: Brief metadata ───────────────────────── */}
      <aside
        className="w-72 shrink-0 overflow-y-auto flex flex-col"
        style={{ background: '#0f0f1a', borderRight: '1px solid #1e1e3a' }}
      >

        {/* Header */}
        <div className="px-5 pt-5 pb-4 space-y-3" style={{ borderBottom: '1px solid #1e1e3a' }}>
          <Link
            href="/briefs"
            className="inline-flex items-center gap-1 text-xs text-[#94a3b8] hover:text-[#a855f7] transition-colors"
          >
            ← Briefings
          </Link>
          <div>
            <h1 className="text-base font-semibold text-[#e2e8f0] leading-snug">{brief.title}</h1>
            <p className="text-xs text-[#94a3b8] mt-1">Creado el {formatDate(brief.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <ChannelBadge channel={brief.channel} />
            <ModeBadge mode={brief.mode} />
          </div>
        </div>

        {/* Fields */}
        <div className="flex-1 px-5 py-5 space-y-5">
          <BriefField label="Titulación o programa" value={brief.programOrTitulation} />
          <BriefField label="Objetivo" value={brief.objective} />
          <BriefField label="Audiencia" value={brief.audience} />
          <BriefField label="Propuesta de valor" value={brief.valueProposition} />
          <BriefField label="CTA" value={brief.cta} />
          <BriefField label="Restricciones" value={brief.constraints} />
        </div>

        {/* Footer */}
        <div className="px-5 py-4" style={{ borderTop: '1px solid #1e1e3a' }}>
          <a
            href={`/api/export/${brief.id}`}
            download
            className="flex items-center justify-center gap-2 text-sm text-[#94a3b8] hover:text-[#a855f7] border border-[#1e1e3a] hover:border-[#7c3aed]/40 rounded-xl px-3 py-2 hover:bg-[#1a1a2e] transition-all"
          >
            <span>↓</span> Exportar caso
          </a>
        </div>
      </aside>

      {/* ─── CENTER PANEL: Generated messages ─────────────────── */}
      <main
        className="flex-1 overflow-y-auto min-w-0"
        style={{ background: '#0a0a0f' }}
      >
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">

          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-semibold text-[#e2e8f0]">Mensajes generados</h2>
              {versions.length > 0 && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(124,58,237,0.2)', color: '#a855f7', border: '1px solid rgba(124,58,237,0.3)' }}
                >
                  {versions.length}
                </span>
              )}
            </div>
            <form action={generateWithId}>
              <button
                type="submit"
                className={
                  versions.length === 0
                    ? 'rounded-xl px-4 py-1.5 text-sm font-semibold text-white prisma-gradient-bg hover:opacity-90 transition-all shadow-md shadow-purple-900/30'
                    : 'rounded-xl px-4 py-1.5 text-sm font-medium text-[#a855f7] border border-[#7c3aed]/40 hover:bg-[#1e1e3a] hover:border-[#7c3aed] transition-all'
                }
              >
                {versions.length === 0 ? 'Generar mensaje' : '+ Nueva versión'}
              </button>
            </form>
          </div>

          {/* Version tree */}
          {versions.length > 1 && (
            <VersionTree versions={versions} validationByVersion={validationRunsByVersion} />
          )}

          {/* Empty state */}
          {versions.length === 0 && (
            <div
              className="rounded-2xl px-6 py-16 text-center space-y-2"
              style={{ background: '#0f0f1a', border: '1px dashed #1e1e3a' }}
            >
              <p className="text-sm font-medium text-[#e2e8f0]">Sin mensajes todavía</p>
              <p className="text-sm text-[#94a3b8]">
                Pulsa &quot;Generar mensaje&quot; para crear la primera versión.
              </p>
            </div>
          )}

          {/* Version cards */}
          {versions.map((version) => {
            const validationRun = validationRunsByVersion[version.id] ?? null
            const refineWithIds = refineMessageAction.bind(null, brief.id, version.id)

            return (
              <div key={version.id} className="space-y-2">
                <MessageVersionView
                  version={version}
                  channel={brief.channel}
                  verdictStatus={validationRun?.overallVerdict ?? null}
                />

                {/* Refine form */}
                <form action={refineWithIds} className="flex gap-2 items-end">
                  <textarea
                    name="userInstruction"
                    placeholder="Instrucción de ajuste: ej. «hazlo más directo», «reduce el tono promocional»…"
                    rows={2}
                    className="flex-1 text-sm rounded-xl border border-[#1e1e3a] bg-[#0f0f1a] px-3 py-2 text-[#e2e8f0] resize-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 focus:border-[#7c3aed] placeholder:text-[#94a3b8]/50 transition-all"
                  />
                  <button
                    type="submit"
                    className="rounded-xl px-4 py-2 text-sm font-medium text-[#a855f7] border border-[#7c3aed]/40 hover:bg-[#1e1e3a] hover:border-[#7c3aed] transition-all shrink-0"
                  >
                    Refinar
                  </button>
                </form>
              </div>
            )
          })}
        </div>
      </main>

      {/* ─── RIGHT PANEL: Validation ───────────────────────────── */}
      <aside
        className="w-80 shrink-0 overflow-y-auto flex flex-col"
        style={{ background: '#0f0f1a', borderLeft: '1px solid #1e1e3a' }}
      >
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #1e1e3a' }}>
          <h2 className="text-sm font-semibold text-[#e2e8f0]">Validación automática</h2>
          {latestValidationRun ? (
            <p className="text-xs text-[#94a3b8] mt-0.5">Versión más reciente validada</p>
          ) : (
            <p className="text-xs text-[#94a3b8] mt-0.5">
              {versions.length > 0 ? 'Aún sin validar' : 'Genera un mensaje para validarlo'}
            </p>
          )}
        </div>

        {latestValidationRun ? (
          <ValidationView run={latestValidationRun} panel />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 text-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}
            >
              ✓
            </div>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Los criterios de validación aparecerán aquí una vez generado y evaluado el primer mensaje.
            </p>
          </div>
        )}
      </aside>

    </div>
  )
}
