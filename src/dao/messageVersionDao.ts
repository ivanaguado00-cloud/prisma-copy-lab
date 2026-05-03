import { prisma } from '../lib/prisma'
import type { CreateMessageVersionInput } from '../types/domain'

export async function createMessageVersion(input: CreateMessageVersionInput) {
  return prisma.messageVersion.create({ data: input })
}

export async function getMessageVersionById(id: string) {
  return prisma.messageVersion.findUnique({ where: { id } })
}

export async function listVersionsByBrief(briefId: string) {
  return prisma.messageVersion.findMany({
    where: { briefId },
    orderBy: { versionNumber: 'asc' },
  })
}
