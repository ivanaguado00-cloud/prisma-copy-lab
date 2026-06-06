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
}

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

export async function getValidationStats(userId?: string): Promise<ValidationStats> {
  const briefFilter = userId ? { userId } : {}
  const versionFilter = userId ? { brief: { userId } } : {}
  const runFilter = userId ? { messageVersion: { brief: { userId } } } : {}

  const [
    totalValidations,
    countAprobada,
    countAprobadaConAjustes,
    countNoAprobada,
    totalBriefs,
    totalVersions,
  ] = await Promise.all([
    prisma.validationRun.count({ where: runFilter }),
    prisma.validationRun.count({ where: { ...runFilter, overallVerdict: 'aprobada' } }),
    prisma.validationRun.count({ where: { ...runFilter, overallVerdict: 'aprobada_con_ajustes' } }),
    prisma.validationRun.count({ where: { ...runFilter, overallVerdict: 'no_aprobada' } }),
    prisma.brief.count({ where: briefFilter }),
    prisma.messageVersion.count({ where: versionFilter }),
  ])

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
  }
}
