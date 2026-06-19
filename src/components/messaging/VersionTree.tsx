import type { MessageVersion } from '../../generated/prisma/client'
import { buildVersionTree } from '../../lib/versionTreeUtils'
import type { VersionNode } from '../../lib/versionTreeUtils'

export { buildVersionTree } from '../../lib/versionTreeUtils'
export type { VersionNode } from '../../lib/versionTreeUtils'

// ── Verdict badge ─────────────────────────────────────────────────────────────

const VERDICT_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  aprobada:             { label: 'Aprobada',    bg: '#052e16', text: '#10b981', border: '#065f46' },
  aprobada_con_ajustes: { label: 'Con ajustes', bg: '#1c1400', text: '#f59e0b', border: '#92400e' },
  no_aprobada:          { label: 'No aprobada', bg: '#1c0000', text: '#ef4444', border: '#7f1d1d' },
}

function VerdictBadge({ verdict }: { verdict: string | null | undefined }) {
  if (!verdict) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-[#1f2022] text-[#c4c9ac] border border-[#444933]">
        Sin validar
      </span>
    )
  }
  const style = VERDICT_STYLES[verdict]
  if (!style) return null
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full border font-medium"
      style={{ background: style.bg, color: style.text, borderColor: style.border }}
    >
      {style.label}
    </span>
  )
}

// ── Tree node (recursive) ─────────────────────────────────────────────────────

type ValidationSummary = { overallVerdict: string } | null

function VersionTreeNode({
  node,
  validationByVersion,
}: {
  node: VersionNode
  validationByVersion: Record<string, ValidationSummary>
}) {
  const { version, children } = node
  const run = validationByVersion[version.id] ?? null

  return (
    <div>
      <div className="flex items-center gap-2 py-1.5 min-w-0">
        <span className="text-sm font-medium text-[#e3e2e5] shrink-0">
          v{version.versionNumber}
        </span>
        <VerdictBadge verdict={run?.overallVerdict} />
        {version.userInstruction && (
          <span className="text-xs text-[#c4c9ac] truncate min-w-0">
            &ldquo;{version.userInstruction}&rdquo;
          </span>
        )}
      </div>
      {children.length > 0 && (
        <div className="ml-3 pl-3" style={{ borderLeft: '1px solid #444933' }}>
          {children.map((child) => (
            <VersionTreeNode key={child.version.id} node={child} validationByVersion={validationByVersion} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

type Props = {
  versions: MessageVersion[]
  validationByVersion: Record<string, ValidationSummary>
}

export function VersionTree({ versions, validationByVersion }: Props) {
  const roots = buildVersionTree(versions)
  if (roots.length === 0) return null

  return (
    <div className="rounded-lg p-4 bg-[#1b1c1e]" style={{ border: '1px solid #444933' }}>
      <p className="text-xs font-semibold text-[#c4c9ac] uppercase tracking-wider mb-3">
        Árbol de versiones
      </p>
      {roots.map((root) => (
        <VersionTreeNode key={root.version.id} node={root} validationByVersion={validationByVersion} />
      ))}
    </div>
  )
}
