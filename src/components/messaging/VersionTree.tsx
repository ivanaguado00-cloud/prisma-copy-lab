import type { MessageVersion } from '../../generated/prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { buildVersionTree } from '../../lib/versionTreeUtils'
import type { VersionNode } from '../../lib/versionTreeUtils'

export { buildVersionTree } from '../../lib/versionTreeUtils'
export type { VersionNode } from '../../lib/versionTreeUtils'

// ── Verdict badge ─────────────────────────────────────────────────────────────

const VERDICT_STYLES: Record<string, { label: string; className: string }> = {
  aprobada: { label: 'Aprobada', className: 'bg-green-100 text-green-700' },
  aprobada_con_ajustes: { label: 'Con ajustes', className: 'bg-amber-100 text-amber-700' },
  no_aprobada: { label: 'No aprobada', className: 'bg-red-100 text-red-700' },
}

function VerdictBadge({ verdict }: { verdict: string | null | undefined }) {
  const style = verdict ? (VERDICT_STYLES[verdict] ?? null) : null
  if (!style) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">
        Sin validar
      </span>
    )
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.className}`}>
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
        <span className="text-sm font-medium text-zinc-700 shrink-0">
          v{version.versionNumber}
        </span>
        <VerdictBadge verdict={run?.overallVerdict} />
        {version.userInstruction && (
          <span className="text-xs text-zinc-400 truncate min-w-0">
            &ldquo;{version.userInstruction}&rdquo;
          </span>
        )}
      </div>
      {children.length > 0 && (
        <div className="ml-3 border-l border-zinc-200 pl-3">
          {children.map((child) => (
            <VersionTreeNode
              key={child.version.id}
              node={child}
              validationByVersion={validationByVersion}
            />
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Árbol de versiones</CardTitle>
      </CardHeader>
      <CardContent>
        {roots.map((root) => (
          <VersionTreeNode
            key={root.version.id}
            node={root}
            validationByVersion={validationByVersion}
          />
        ))}
      </CardContent>
    </Card>
  )
}
