import { prisma } from '../lib/prisma'
import type { CreateBriefInput } from '../types/domain'

export interface UpdateBriefCrmInput {
  crmStatus: string
  crmSentAt: Date
  crmSentBy: string
  crmEmailHtml: string
  crmEmailPlainText: string
  crmInternalSubject: string
  crmNotes: string | null
}

export async function createBrief(input: CreateBriefInput) {
  return prisma.$transaction(async (tx) => {
    const latestBrief = await tx.brief.findFirst({
      where: { userId: input.userId },
      orderBy: { briefNumber: 'desc' },
      select: { briefNumber: true },
    })

    return tx.brief.create({
      data: {
        ...input,
        briefNumber: (latestBrief?.briefNumber ?? 0) + 1,
      },
    })
  })
}

export async function getBriefById(id: string, userId?: string) {
  return prisma.brief.findFirst({
    where: { id, ...(userId ? { userId } : {}) },
  })
}

export async function listBriefs(userId: string | undefined, channel?: string) {
  return prisma.brief.findMany({
    where: { ...(userId ? { userId } : {}), ...(channel ? { channel } : {}) },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getHomeBriefReviewSummary(userId?: string) {
  const briefFilter = { ...(userId ? { userId } : {}) }
  const [
    totalBriefs,
    pendingPmReview,
    pendingAuthorCorrection,
    approvedBriefs,
  ] = await Promise.all([
    prisma.brief.count({ where: briefFilter }),
    prisma.brief.count({ where: { ...briefFilter, reviewStatus: 'submitted' } }),
    prisma.brief.count({ where: { ...briefFilter, reviewStatus: 'rejected' } }),
    prisma.brief.count({ where: { ...briefFilter, reviewStatus: 'approved' } }),
  ])

  return {
    totalBriefs,
    pendingPmReview,
    pendingAuthorCorrection,
    approvedBriefs,
  }
}

export async function listRecentBriefActivity(userId: string | undefined, limit = 5) {
  return prisma.brief.findMany({
    where: { ...(userId ? { userId } : {}) },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      briefNumber: true,
      title: true,
      channel: true,
      reviewStatus: true,
      createdAt: true,
    },
  })
}

export interface UpdateBriefReviewInput {
  reviewStatus: string
  reviewedBy: string | null
  reviewedAt: Date | null
  reviewNote: string | null
}

export async function updateBriefReview(id: string, data: UpdateBriefReviewInput) {
  return prisma.brief.update({
    where: { id },
    data,
  })
}

export async function updateBriefCrm(id: string, data: UpdateBriefCrmInput) {
  return prisma.brief.update({
    where: { id },
    data,
  })
}

export interface RoleWorkloadStats {
  redactor: {
    briefingsCreados: number
    mensajesGenerados: number
    refinamientos: number     // versiones v2+ (nuevas versiones tras iteración)
    pendientesCorreccion: number  // briefs actualmente rechazados
  }
  pm: {
    briefingsRevisados: number   // han pasado por manos del PM (submitted + aprobados + rechazados)
    aprobados: number
    aprobadosConAjustes: number
    rechazados: number
  }
}

/**
 * Devuelve métricas de carga de trabajo por rol.
 * "refinamientos" = versiones de mensaje con versionNumber > 1.
 * "pendientesCorreccion" = briefs con reviewStatus = 'rejected'.
 */
export async function getRoleWorkloadStats(userId?: string, channel?: string): Promise<RoleWorkloadStats> {
  const briefFilter = {
    ...(userId ? { userId } : {}),
    ...(channel ? { channel } : {}),
  }
  const versionFilter = {
    ...(userId ? { brief: { userId } } : {}),
    ...(channel ? { brief: { channel } } : {}),
  }

  const [
    briefingsCreados,
    mensajesGenerados,
    refinamientos,
    pendientesCorreccion,
    aprobados,
    aprobadosConAjustes,
    rechazados,
    submitted,
  ] = await Promise.all([
    prisma.brief.count({ where: briefFilter }),
    prisma.messageVersion.count({ where: versionFilter }),
    prisma.messageVersion.count({ where: { ...versionFilter, versionNumber: { gt: 1 } } }),
    prisma.brief.count({ where: { ...briefFilter, reviewStatus: 'rejected' } }),
    prisma.brief.count({ where: { ...briefFilter, reviewStatus: 'approved' } }),
    // "Aprobado con ajustes" se deriva de aprobados cuya última validación fue aprobada_con_ajustes
    // Reutilizamos la misma lógica que getBriefStatusStats — aquí aproximamos desde los datos de validación
    prisma.brief.count({
      where: {
        ...briefFilter,
        reviewStatus: 'approved',
        versions: {
          some: {
            versionNumber: 1,
            validationRuns: { some: { overallVerdict: 'aprobada_con_ajustes' } },
          },
        },
      },
    }),
    prisma.brief.count({ where: { ...briefFilter, reviewStatus: 'rejected' } }),
    prisma.brief.count({ where: { ...briefFilter, reviewStatus: 'submitted' } }),
  ])

  const briefingsRevisados = submitted + aprobados + aprobadosConAjustes + rechazados

  return {
    redactor: { briefingsCreados, mensajesGenerados, refinamientos, pendientesCorreccion },
    pm: { briefingsRevisados, aprobados, aprobadosConAjustes, rechazados },
  }
}

export interface BriefStatusStats {
  borrador: number
  en_revision: number
  aprobado: number
  aprobado_con_ajustes: number
  rechazado: number
  total: number
}

/**
 * Cuenta los briefings por estado actual. Cada brief cuenta una sola vez.
 * Los briefs aprobados se subdividen en "Aprobado" y "Aprobado con ajustes"
 * según el veredicto de la última validación interna.
 */
export async function getBriefStatusStats(userId?: string, channel?: string): Promise<BriefStatusStats> {
  const briefFilter = {
    ...(userId ? { userId } : {}),
    ...(channel ? { channel } : {}),
  }

  // Contar estados directos
  const [borrador, en_revision, rechazado, approvedBriefs] = await Promise.all([
    prisma.brief.count({ where: { ...briefFilter, reviewStatus: 'pending' } }),
    prisma.brief.count({ where: { ...briefFilter, reviewStatus: 'submitted' } }),
    prisma.brief.count({ where: { ...briefFilter, reviewStatus: 'rejected' } }),
    // Briefs aprobados con su última validación para distinguir "con ajustes"
    prisma.brief.findMany({
      where: { ...briefFilter, reviewStatus: 'approved' },
      select: {
        id: true,
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            validationRuns: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { overallVerdict: true },
            },
          },
        },
      },
    }),
  ])

  let aprobado = 0
  let aprobado_con_ajustes = 0
  for (const brief of approvedBriefs) {
    const verdict = brief.versions[0]?.validationRuns[0]?.overallVerdict ?? null
    if (verdict === 'aprobada_con_ajustes') {
      aprobado_con_ajustes++
    } else {
      aprobado++
    }
  }

  const total = borrador + en_revision + aprobado + aprobado_con_ajustes + rechazado
  return { borrador, en_revision, aprobado, aprobado_con_ajustes, rechazado, total }
}

export interface GenerationModeStats {
  standard: number
  ab_test: number
  total: number
}

export async function getGenerationModeStats(userId?: string, channel?: string): Promise<GenerationModeStats> {
  const briefFilter = {
    ...(userId ? { userId } : {}),
    ...(channel ? { channel } : {}),
  }
  const [standard, ab_test] = await Promise.all([
    prisma.brief.count({ where: { ...briefFilter, generationMode: 'standard' } }),
    prisma.brief.count({ where: { ...briefFilter, generationMode: 'ab_test' } }),
  ])
  return { standard, ab_test, total: standard + ab_test }
}
