import { prisma } from '../lib/prisma'
import type { CreateValidationRunInput } from '../types/domain'

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
