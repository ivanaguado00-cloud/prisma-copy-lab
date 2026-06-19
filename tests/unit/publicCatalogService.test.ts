import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../src/dao/programDao', () => ({
  listActivePrograms: vi.fn(),
  getActiveProgramById: vi.fn(),
}))

import { getActiveProgramById, listActivePrograms } from '../../src/dao/programDao'
import { getPublicProgramDetail, listPublicPrograms } from '../../src/services/publicCatalogService'

const mockListActivePrograms = vi.mocked(listActivePrograms)
const mockGetActiveProgramById = vi.mocked(getActiveProgramById)

const baseProgram = {
  id: 'program-1',
  name: 'Máster en Inteligencia Artificial Aplicada',
  school: 'Tecnología e Innovación',
  officialPrice: 7000,
  currentPromoPrice: null,
  activeDiscount: null,
  discountValidFrom: null,
  discountValidTo: null,
  enrollmentsTotal: 0,
  revenueTotal: 0,
  associatedCampaigns: null,
  conversionRate: null,
  bestChannel: null,
  lastCampaign: null,
  duration: '12 meses',
  credits: 60,
  modality: 'Online',
  convocationStart: 'Octubre 2026',
  subjectsOrModules: null,
  mainFocuses: 'IA aplicada, automatización y analítica.',
  careerOutcomes: 'AI Engineer, Machine Learning Engineer.',
  targetProfile: 'Profesionales técnicos que quieren aplicar IA en negocio.',
  valueProposition: 'Formación en IA con aplicación directa a casos de negocio reales.',
  mainCommercialArgs: 'Proyecto con empresa real.',
  validatedClaims: null,
  restrictions: null,
  bestMessages: null,
  bestCtas: null,
  winningApproaches: null,
  successCasesAi: null,
  futureRecommendations: null,
  teamObservations: null,
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('listPublicPrograms', () => {
  it('devuelve solo los programas activos recibidos del DAO con formato comercial', async () => {
    mockListActivePrograms.mockResolvedValue([baseProgram] as never)

    const programs = await listPublicPrograms()

    expect(mockListActivePrograms).toHaveBeenCalledOnce()
    expect(programs).toEqual([
      expect.objectContaining({
        id: 'program-1',
        name: 'Máster en Inteligencia Artificial Aplicada',
        programType: 'Máster',
        market: 'Europa, Colombia, Ecuador y Perú',
      }),
    ])
  })

  it('usa valores públicos por defecto cuando faltan campos comerciales opcionales', async () => {
    mockListActivePrograms.mockResolvedValue([
      {
        ...baseProgram,
        name: 'Programa Ejecutivo en Diseño Estratégico',
        modality: null,
        valueProposition: null,
      },
    ] as never)

    const programs = await listPublicPrograms()
    const program = programs[0]!

    expect(program).toBeDefined()
    expect(program.programType).toBe('Título propio')
    expect(program.modality).toBe('Online')
    expect(program.valueProposition).toContain('Programa online de Universidad Prisma')
  })
})

describe('getPublicProgramDetail', () => {
  it('devuelve null cuando el DAO no encuentra un programa activo', async () => {
    mockGetActiveProgramById.mockResolvedValue(null)

    await expect(getPublicProgramDetail('missing-id')).resolves.toBeNull()
  })

  it('incluye la URL de admisión y campos de detalle', async () => {
    mockGetActiveProgramById.mockResolvedValue(baseProgram as never)

    const detail = await getPublicProgramDetail('program-1')

    expect(detail).toEqual(expect.objectContaining({
      enrollmentUrl: '/universidad-prisma/solicita-informacion?programa=master-en-inteligencia-artificial-aplicada',
      targetProfile: baseProgram.targetProfile,
      mainCommercialArgs: baseProgram.mainCommercialArgs,
    }))
  })
})
