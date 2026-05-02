import { prisma } from '../lib/prisma'
import type { CreateValidationScoreInput } from '../types/domain'

export async function createValidationScores(scores: CreateValidationScoreInput[]) {
  return prisma.validationScore.createMany({ data: scores })
}

export async function getScoresByValidationRunId(validationRunId: string) {
  return prisma.validationScore.findMany({
    where: { validationRunId },
    orderBy: { criterionKey: 'asc' },
  })
}
