import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    validationRun: { count: vi.fn() },
    brief: { count: vi.fn(), groupBy: vi.fn() },
    messageVersion: { count: vi.fn() },
  },
}))

import { getValidationStats } from '../../src/dao/validationRunDao'
import { prisma } from '../../src/lib/prisma'

const mockValidationCount = vi.mocked(prisma.validationRun.count)
const mockBriefCount = vi.mocked(prisma.brief.count)
const mockBriefGroupBy = vi.mocked(prisma.brief.groupBy)
const mockVersionCount = vi.mocked(prisma.messageVersion.count)

beforeEach(() => {
  vi.clearAllMocks()
  mockBriefGroupBy.mockResolvedValue([])
})

describe('getValidationStats — totales y veredictos', () => {
  it('devuelve todos los campos correctamente cuando hay datos', async () => {
    mockValidationCount
      .mockResolvedValueOnce(10) // totalValidations
      .mockResolvedValueOnce(5)  // aprobada
      .mockResolvedValueOnce(3)  // aprobada_con_ajustes
      .mockResolvedValueOnce(2)  // no_aprobada
    mockBriefCount.mockResolvedValue(4)
    mockBriefGroupBy.mockResolvedValue([
      { channel: 'email', _count: { channel: 3 } },
      { channel: 'whatsapp', _count: { channel: 1 } },
    ])
    mockVersionCount.mockResolvedValue(12)

    const stats = await getValidationStats()

    expect(stats.totalValidations).toBe(10)
    expect(stats.verdicts.aprobada).toBe(5)
    expect(stats.verdicts.aprobada_con_ajustes).toBe(3)
    expect(stats.verdicts.no_aprobada).toBe(2)
    expect(stats.totalBriefs).toBe(4)
    expect(stats.totalVersions).toBe(12)
    expect(stats.avgVersionsPerBrief).toBe(3)
    expect(stats.mostUsedChannel).toBe('email')
  })

  it('devuelve ceros cuando la base de datos está vacía', async () => {
    mockValidationCount.mockResolvedValue(0)
    mockBriefCount.mockResolvedValue(0)
    mockVersionCount.mockResolvedValue(0)

    const stats = await getValidationStats()

    expect(stats.totalValidations).toBe(0)
    expect(stats.verdicts.aprobada).toBe(0)
    expect(stats.verdicts.aprobada_con_ajustes).toBe(0)
    expect(stats.verdicts.no_aprobada).toBe(0)
    expect(stats.totalBriefs).toBe(0)
    expect(stats.totalVersions).toBe(0)
    expect(stats.mostUsedChannel).toBeNull()
  })
})

describe('getValidationStats — avgVersionsPerBrief', () => {
  it('calcula la media correctamente con datos', async () => {
    mockValidationCount.mockResolvedValue(0)
    mockBriefCount.mockResolvedValue(3)
    mockVersionCount.mockResolvedValue(9)

    const stats = await getValidationStats()

    expect(stats.avgVersionsPerBrief).toBe(3)
  })

  it('devuelve 0 cuando no hay briefings para evitar división por cero', async () => {
    mockValidationCount.mockResolvedValue(0)
    mockBriefCount.mockResolvedValue(0)
    mockVersionCount.mockResolvedValue(0)

    const stats = await getValidationStats()

    expect(stats.avgVersionsPerBrief).toBe(0)
  })

  it('devuelve media decimal cuando las versiones no se reparten exactamente', async () => {
    mockValidationCount.mockResolvedValue(0)
    mockBriefCount.mockResolvedValue(2)
    mockVersionCount.mockResolvedValue(5)

    const stats = await getValidationStats()

    expect(stats.avgVersionsPerBrief).toBe(2.5)
  })
})

describe('getValidationStats — literales de veredicto en español', () => {
  it('consulta prisma con los tres literales exactos en español', async () => {
    mockValidationCount.mockResolvedValue(0)
    mockBriefCount.mockResolvedValue(0)
    mockVersionCount.mockResolvedValue(0)

    await getValidationStats()

    expect(prisma.validationRun.count).toHaveBeenCalledWith({
      where: { overallVerdict: 'aprobada' },
    })
    expect(prisma.validationRun.count).toHaveBeenCalledWith({
      where: { overallVerdict: 'aprobada_con_ajustes' },
    })
    expect(prisma.validationRun.count).toHaveBeenCalledWith({
      where: { overallVerdict: 'no_aprobada' },
    })
  })

  it('lanza todas las consultas en paralelo (Promise.all — 4 llamadas a validationRun.count)', async () => {
    mockValidationCount.mockResolvedValue(0)
    mockBriefCount.mockResolvedValue(0)
    mockVersionCount.mockResolvedValue(0)

    await getValidationStats()

    expect(prisma.validationRun.count).toHaveBeenCalledTimes(4)
    expect(prisma.brief.count).toHaveBeenCalledTimes(1)
    expect(prisma.brief.groupBy).toHaveBeenCalledTimes(1)
    expect(prisma.messageVersion.count).toHaveBeenCalledTimes(1)
  })
})
