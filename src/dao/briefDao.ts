import { prisma } from '../lib/prisma'
import type { CreateBriefInput } from '../types/domain'

export async function createBrief(input: CreateBriefInput) {
  return prisma.brief.create({ data: input })
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
