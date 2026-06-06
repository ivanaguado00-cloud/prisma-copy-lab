import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocking briefDao before the service import to avoid Prisma initialization
vi.mock('../../src/dao/briefDao', () => ({
  createBrief: vi.fn(),
}))

import { createBriefService } from '../../src/services/briefService'
import { createBrief } from '../../src/dao/briefDao'

const mockCreateBrief = vi.mocked(createBrief)

const validInput = {
  title: 'Campaña Máster MBA',
  programOrTitulation: 'Máster en Business Administration',
  objective: 'Captar leads interesados en el programa MBA',
  audience: 'Profesionales con 3-5 años de experiencia',
  channel: 'email' as const,
  mode: 'produccion' as const,
  valueProposition: 'Acceso a red de alumni y empleabilidad garantizada',
  cta: 'Solicitar información',
  constraints: 'Tono formal, sin anglicismos',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockCreateBrief.mockResolvedValue({ id: 'generated-id' } as never)
})

describe('createBriefService — campos obligatorios', () => {
  it('devuelve error cuando falta title', async () => {
    const result = await createBriefService({ ...validInput, title: '' }, 'user-test-id')
    expect(result.success).toBe(false)
    expect(result.errors?.some((e) => e.field === 'title')).toBe(true)
  })

  it('devuelve error cuando falta objective', async () => {
    const result = await createBriefService({ ...validInput, objective: '' }, 'user-test-id')
    expect(result.success).toBe(false)
    expect(result.errors?.some((e) => e.field === 'objective')).toBe(true)
  })

  it('devuelve error cuando falta audience', async () => {
    const result = await createBriefService({ ...validInput, audience: '' }, 'user-test-id')
    expect(result.success).toBe(false)
    expect(result.errors?.some((e) => e.field === 'audience')).toBe(true)
  })

  it('devuelve error cuando falta channel', async () => {
    const result = await createBriefService({ ...validInput, channel: undefined as never }, 'user-test-id')
    expect(result.success).toBe(false)
    expect(result.errors?.some((e) => e.field === 'channel')).toBe(true)
  })

  it('devuelve error cuando falta mode', async () => {
    const result = await createBriefService({ ...validInput, mode: undefined as never }, 'user-test-id')
    expect(result.success).toBe(false)
    expect(result.errors?.some((e) => e.field === 'mode')).toBe(true)
  })

  it('devuelve error cuando falta valueProposition', async () => {
    const result = await createBriefService({ ...validInput, valueProposition: '' }, 'user-test-id')
    expect(result.success).toBe(false)
    expect(result.errors?.some((e) => e.field === 'valueProposition')).toBe(true)
  })

  it('devuelve error cuando falta cta', async () => {
    const result = await createBriefService({ ...validInput, cta: '' }, 'user-test-id')
    expect(result.success).toBe(false)
    expect(result.errors?.some((e) => e.field === 'cta')).toBe(true)
  })
})

describe('createBriefService — valores de enum', () => {
  it('devuelve error cuando channel no es un valor válido', async () => {
    const result = await createBriefService({ ...validInput, channel: 'telegram' as never }, 'user-test-id')
    expect(result.success).toBe(false)
    expect(result.errors?.some((e) => e.field === 'channel')).toBe(true)
  })

  it('devuelve error cuando mode no es un valor válido', async () => {
    const result = await createBriefService({ ...validInput, mode: 'borrador' as never }, 'user-test-id')
    expect(result.success).toBe(false)
    expect(result.errors?.some((e) => e.field === 'mode')).toBe(true)
  })
})

describe('createBriefService — normalización de espacios', () => {
  it('persiste los campos de texto sin espacios al inicio ni al final', async () => {
    const inputWithSpaces = {
      ...validInput,
      title: '  Campaña con espacios  ',
      objective: '\tObjetivo con tabulador\t',
      audience: ' Audiencia con espacio inicial',
      valueProposition: 'Propuesta con espacio final ',
      cta: '  CTA con espacios  ',
    }

    const result = await createBriefService(inputWithSpaces, 'user-test-id')

    expect(result.success).toBe(true)
    expect(mockCreateBrief).toHaveBeenCalledOnce()

    const calledWith = mockCreateBrief.mock.calls[0]![0]!
    expect(calledWith.title).toBe('Campaña con espacios')
    expect(calledWith.objective).toBe('Objetivo con tabulador')
    expect(calledWith.audience).toBe('Audiencia con espacio inicial')
    expect(calledWith.valueProposition).toBe('Propuesta con espacio final')
    expect(calledWith.cta).toBe('CTA con espacios')
  })

  it('convierte campos opcionales vacíos a undefined antes de persistir', async () => {
    const inputWithEmpty = {
      ...validInput,
      programOrTitulation: '   ',
      constraints: '',
    }

    await createBriefService(inputWithEmpty, 'user-test-id')

    const calledWith = mockCreateBrief.mock.calls[0]![0]!
    expect(calledWith.programOrTitulation).toBeUndefined()
    expect(calledWith.constraints).toBeUndefined()
  })
})

describe('createBriefService — caso feliz', () => {
  it('delega en briefDao y devuelve el id del briefing creado', async () => {
    const result = await createBriefService(validInput, 'user-test-id')

    expect(result.success).toBe(true)
    expect(result.briefId).toBe('generated-id')
    expect(result.errors).toBeUndefined()
    expect(mockCreateBrief).toHaveBeenCalledOnce()
  })

  it('los campos opcionales ausentes no se incluyen en la llamada al DAO', async () => {
    const inputWithoutOptionals = {
      title: validInput.title,
      objective: validInput.objective,
      audience: validInput.audience,
      channel: validInput.channel,
      mode: validInput.mode,
      valueProposition: validInput.valueProposition,
      cta: validInput.cta,
    }

    await createBriefService(inputWithoutOptionals, 'user-test-id')

    const calledWith = mockCreateBrief.mock.calls[0]![0]!
    expect(calledWith.programOrTitulation).toBeUndefined()
    expect(calledWith.constraints).toBeUndefined()
  })
})
