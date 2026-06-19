import { prisma } from '../lib/prisma'
import type { CreateProgramInput, UpdateProgramInput } from '../types/domain'

export async function createProgram(input: CreateProgramInput) {
  return prisma.program.create({
    data: {
      ...input,
      enrollmentsTotal: input.enrollmentsTotal ?? 0,
      revenueTotal: input.revenueTotal ?? 0,
    },
  })
}

export async function getProgramById(id: string) {
  return prisma.program.findUnique({ where: { id } })
}

export async function listPrograms() {
  return prisma.program.findMany({ orderBy: { name: 'asc' } })
}

export async function listActivePrograms() {
  const programs = await prisma.program.findMany({
    orderBy: [{ school: 'asc' }, { name: 'asc' }],
  })

  return programs.filter((program) => (program as { isActive?: boolean }).isActive !== false)
}

export async function listProgramsBySchool() {
  const programs = await prisma.program.findMany({ orderBy: [{ school: 'asc' }, { name: 'asc' }] })
  const grouped = new Map<string, typeof programs>()
  for (const p of programs) {
    const existing = grouped.get(p.school) ?? []
    existing.push(p)
    grouped.set(p.school, existing)
  }
  return grouped
}

export async function updateProgram(id: string, input: UpdateProgramInput) {
  return prisma.program.update({ where: { id }, data: input })
}

export async function deleteProgramById(id: string) {
  return prisma.program.delete({ where: { id } })
}

export async function getProgramByName(name: string) {
  return prisma.program.findFirst({ where: { name } })
}

export async function getActiveProgramById(id: string) {
  const program = await prisma.program.findUnique({ where: { id } })
  if ((program as { isActive?: boolean } | null)?.isActive === false) return null
  return program
}

export async function countProgramsWithActiveDiscount(referenceDate = new Date()) {
  return prisma.program.count({
    where: {
      activeDiscount: { gt: 0 },
      OR: [
        { discountValidFrom: null },
        { discountValidFrom: { lte: referenceDate } },
      ],
      AND: [
        {
          OR: [
            { discountValidTo: null },
            { discountValidTo: { gte: referenceDate } },
          ],
        },
      ],
    },
  })
}

export async function getBestConvertingProgram() {
  return prisma.program.findFirst({
    where: { conversionRate: { not: null } },
    orderBy: { conversionRate: 'desc' },
    select: {
      name: true,
      conversionRate: true,
    },
  })
}
