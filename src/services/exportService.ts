import { getBriefById } from '../dao/briefDao'
import { listVersionsByBrief } from '../dao/messageVersionDao'
import { listValidationRunsByMessage } from '../dao/validationRunDao'

// ── Formatting helpers ────────────────────────────────────────────────────────

const LINE_DOUBLE = '═'.repeat(64)
const LINE_SINGLE = '─'.repeat(64)

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

const VERDICT_LABELS: Record<string, string> = {
  aprobada: 'APROBADA',
  aprobada_con_ajustes: 'APROBADA CON AJUSTES',
  no_aprobada: 'NO APROBADA',
}

// ── Builder ───────────────────────────────────────────────────────────────────

export async function buildExportText(briefId: string): Promise<string> {
  const brief = await getBriefById(briefId)
  if (!brief) {
    throw new Error(`Briefing no encontrado: ${briefId}`)
  }

  const versions = await listVersionsByBrief(briefId)

  const validationRunsByVersion = await Promise.all(
    versions.map(async (v) => {
      const runs = await listValidationRunsByMessage(v.id)
      return { versionId: v.id, run: runs[0] ?? null }
    }),
  )
  const runMap = Object.fromEntries(
    validationRunsByVersion.map(({ versionId, run }) => [versionId, run]),
  )

  const sections: string[] = []

  // ── Header ────────────────────────────────────────────────────────────────
  sections.push([
    LINE_DOUBLE,
    'PRISMA Copy Lab — Exportación de caso',
    `Campaña: ${brief.title}`,
    `Exportado el: ${formatDate(new Date())}`,
    LINE_DOUBLE,
  ].join('\n'))

  // ── Brief details ─────────────────────────────────────────────────────────
  const briefLines = [
    'BRIEFING',
    LINE_SINGLE,
    `Titulación / Programa : ${brief.programOrTitulation ?? '—'}`,
    `Objetivo              : ${brief.objective}`,
    `Público               : ${brief.audience}`,
    `Canal                 : ${brief.channel}`,
    `Modo                  : ${brief.mode}`,
    `Propuesta de valor    : ${brief.valueProposition}`,
    `CTA                   : ${brief.cta}`,
    `Restricciones         : ${brief.constraints ?? '—'}`,
  ]
  sections.push(briefLines.join('\n'))

  // ── Versions ──────────────────────────────────────────────────────────────
  sections.push([LINE_DOUBLE, `VERSIONES (${versions.length})`, LINE_DOUBLE].join('\n'))

  if (versions.length === 0) {
    sections.push('Sin versiones generadas.')
  } else {
    for (const version of versions) {
      const versionLines: string[] = [
        LINE_SINGLE,
        `Versión ${version.versionNumber} · ${version.llmModel} · ${formatDate(version.createdAt)}`,
        LINE_SINGLE,
        version.content,
      ]

      if (version.userInstruction) {
        versionLines.push(`\nInstrucción aplicada: "${version.userInstruction}"`)
      }

      const run = runMap[version.id] ?? null

      if (!run) {
        versionLines.push('\nValidación: SIN VALIDAR')
      } else {
        const verdictLabel = VERDICT_LABELS[run.overallVerdict] ?? run.overallVerdict.toUpperCase()
        versionLines.push(`\nValidación: ${verdictLabel}`)
        versionLines.push(`Resumen: ${run.summary}`)

        if (run.scores && run.scores.length > 0) {
          versionLines.push('')
          for (const score of run.scores) {
            const statusTag = `[${score.status}]`
            versionLines.push(`  · ${score.criterionName.padEnd(40)} ${statusTag}`)
            versionLines.push(`    ${score.comment}`)
            if (score.suggestedFix) {
              versionLines.push(`    Sugerencia: ${score.suggestedFix}`)
            }
          }
        }

        if (run.suggestedRewrite) {
          versionLines.push(`\nReescritura sugerida:\n${run.suggestedRewrite}`)
        }
      }

      sections.push(versionLines.join('\n'))
    }
  }

  sections.push(LINE_DOUBLE)

  return sections.join('\n\n')
}
