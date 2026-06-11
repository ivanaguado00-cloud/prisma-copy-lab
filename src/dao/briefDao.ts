import { prisma } from '../lib/prisma'
import type { CreateBriefInput } from '../types/domain'

export interface UpdateBriefCrmInput {
  crmStatus: string
  selectedTemplateId: string
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

export async function listBriefs(userId: string) {
  return prisma.brief.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateBriefCrm(id: string, data: UpdateBriefCrmInput) {
  return prisma.brief.update({
    where: { id },
    data,
  })
}
