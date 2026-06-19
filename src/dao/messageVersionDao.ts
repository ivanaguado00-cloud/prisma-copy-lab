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

export async function countMessageVersions(userId?: string) {
  return prisma.messageVersion.count({
    where: {
      ...(userId ? { brief: { userId } } : {}),
    },
  })
}

export async function listRecentMessageVersions(userId: string | undefined, limit = 30) {
  return prisma.messageVersion.findMany({
    where: {
      ...(userId ? { brief: { userId } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      versionNumber: true,
      createdAt: true,
      brief: {
        select: {
          id: true,
          title: true,
          channel: true,
        },
      },
    },
  })
}
