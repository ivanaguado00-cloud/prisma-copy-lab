import { prisma } from '../lib/prisma'
import type { CreateBriefInput } from '../types/domain'

export async function createBrief(input: CreateBriefInput) {
  return prisma.brief.create({ data: input })
}

export async function getBriefById(id: string) {
  return prisma.brief.findUnique({ where: { id } })
}

export async function listBriefs() {
  return prisma.brief.findMany({ orderBy: { createdAt: 'desc' } })
}
