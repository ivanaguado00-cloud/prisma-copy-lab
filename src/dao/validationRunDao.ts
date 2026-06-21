import { prisma } from '../lib/prisma'
import type { CreateValidationRunInput } from '../types/domain'

export interface ValidationStats {
  totalValidations: number
  verdicts: {
    aprobada: number
    aprobada_con_ajustes: number
    no_aprobada: number
  }
  totalBriefs: number
  totalVersions: number
  avgVersionsPerBrief: number
  mostUsedChannel: string | null
}

export interface RecentBriefSummary {
  id: string
  briefNumber: number
  title: string
  channel: string
  createdAt: Date
  latestVerdict: string | null
}

// ── Basic CRUD ────────────────────────────────────────────────────────────────

export async function createValidationRun(input: CreateValidationRunInput) {
  return prisma.validationRun.create({ data: input })
}

export async function getValidationRunById(id: string) {
  return prisma.validationRun.findUnique({
    where: { id },
    include: { scores: true },
  })
}

export async function listValidationRunsByMessage(messageVersionId: string) {
  return prisma.validationRun.findMany({
    where: { messageVersionId },
    orderBy: { createdAt: 'desc' },
    include: { scores: true },
  })
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function getValidationStats(userId?: string, channel?: string): Promise<ValidationStats> {
  const briefFilter = {
    ...(userId ? { userId } : {}),
    ...(channel ? { channel } : {}),
  }
  const versionFilter = {
    ...(userId ? { brief: { userId } } : {}),
    ...(channel ? { brief: { channel } } : {}),
  }
  const runFilter = {
    ...(userId ? { messageVersion: { brief: { userId } } } : {}),
    ...(channel ? { messageVersion: { brief: { channel } } } : {}),
  }

  const [
    totalValidations,
    countAprobada,
    countAprobadaConAjustes,
    countNoAprobada,
    totalBriefs,
    totalVersions,
    channelGroups,
  ] = await Promise.all([
    prisma.validationRun.count({ where: runFilter }),
    prisma.validationRun.count({ where: { ...runFilter, overallVerdict: 'aprobada' } }),
    prisma.validationRun.count({ where: { ...runFilter, overallVerdict: 'aprobada_con_ajustes' } }),
    prisma.validationRun.count({ where: { ...runFilter, overallVerdict: 'no_aprobada' } }),
    prisma.brief.count({ where: briefFilter }),
    prisma.messageVersion.count({ where: versionFilter }),
    prisma.brief.groupBy({
      by: ['channel'],
      where: briefFilter,
      _count: { channel: true },
      orderBy: { _count: { channel: 'desc' } },
    }),
  ])

  const mostUsedChannel = channelGroups[0]?.channel ?? null

  return {
    totalValidations,
    verdicts: {
      aprobada: countAprobada,
      aprobada_con_ajustes: countAprobadaConAjustes,
      no_aprobada: countNoAprobada,
    },
    totalBriefs,
    totalVersions,
    avgVersionsPerBrief: totalBriefs > 0 ? totalVersions / totalBriefs : 0,
    mostUsedChannel,
  }
}

// ── First-attempt approval rate ───────────────────────────────────────────────

export async function getFirstAttemptApprovalRate(userId?: string, channel?: string): Promise<number> {
  const briefConditions = {
    ...(userId ? { userId } : {}),
    ...(channel ? { channel } : {}),
  }
  const versionWhere = Object.keys(briefConditions).length > 0
    ? { versionNumber: 1, brief: briefConditions }
    : { versionNumber: 1 }

  const [totalWithValidation, approvedFirstAttempt] = await Promise.all([
    prisma.validationRun.count({ where: { messageVersion: versionWhere } }),
    prisma.validationRun.count({
      where: { messageVersion: versionWhere, overallVerdict: 'aprobada' },
    }),
  ])

  return totalWithValidation > 0
    ? Math.round((approvedFirstAttempt / totalWithValidation) * 100)
    : 0
}

// ── Recent briefs with latest verdict ────────────────────────────────────────

export async function getRecentBriefsSummary(
  userId: string | undefined,
  limit = 5,
  channel?: string,
): Promise<RecentBriefSummary[]> {
  const briefs = await prisma.brief.findMany({
    where: {
      ...(userId ? { userId } : {}),
      ...(channel ? { channel } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      versions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          validationRuns: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  })

  return briefs.map((brief) => {
    const latestRun = brief.versions[0]?.validationRuns[0] ?? null
    return {
      id: brief.id,
      briefNumber: brief.briefNumber,
      title: brief.title,
      channel: brief.channel,
      createdAt: brief.createdAt,
      latestVerdict: latestRun?.overallVerdict ?? null,
    }
  })
}

export async function listRecentValidationActivity(
  userId: string | undefined,
  verdict: string,
  limit = 5,
) {
  return prisma.validationRun.findMany({
    where: {
      overallVerdict: verdict,
      ...(userId ? { messageVersion: { brief: { userId } } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      overallVerdict: true,
      createdAt: true,
      messageVersion: {
        select: {
          versionNumber: true,
          brief: {
            select: {
              id: true,
              title: true,
              channel: true,
            },
          },
        },
      },
    },
  })
}
