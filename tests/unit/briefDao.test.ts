import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}))

import { createBrief } from '../../src/dao/briefDao'
import { prisma } from '../../src/lib/prisma'
import type { CreateBriefInput } from '../../src/types/domain'

const mockTransaction = vi.mocked(prisma.$transaction)

const tx = {
  brief: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
}

const validInput: CreateBriefInput = {
  userId: 'user-1',
  title: 'Campaña MBA',
  objective: 'Captar leads',
  audience: 'Profesionales',
  channel: 'email',
  mode: 'produccion',
  valueProposition: 'Flexibilidad',
  cta: 'Solicitar info',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockTransaction.mockImplementation(async (callback) => callback(tx as never))
  tx.brief.create.mockResolvedValue({ id: 'brief-1' })
})

describe('createBrief', () => {
  it('asigna briefNumber 1 cuando el usuario no tiene briefings previos', async () => {
    tx.brief.findFirst.mockResolvedValue(null)

    await createBrief(validInput)

    expect(tx.brief.findFirst).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { briefNumber: 'desc' },
      select: { briefNumber: true },
    })
    expect(tx.brief.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ briefNumber: 1 }),
    })
  })

  it('asigna el siguiente briefNumber del mismo usuario', async () => {
    tx.brief.findFirst.mockResolvedValue({ briefNumber: 7 })

    await createBrief(validInput)

    expect(tx.brief.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ briefNumber: 8 }),
    })
  })
})
