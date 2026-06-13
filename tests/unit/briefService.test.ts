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
  channel: 'whatsapp' as const,
  mode: 'produccion' as const,
  valueProposition: 'Acceso a red de alumni y empleabilidad garantizada',
  cta: 'Solicitar información',
  constraints: 'Tono formal, sin anglicismos',
}

const validEmailInput = {
  ...validInput,
  channel: 'email' as const,
  emailSubject: 'Descubre el Máster MBA que transformará tu carrera',
  emailPreheader: 'Plazas limitadas para la próxima convocatoria',
  emailTemplate: 'promotional' as const,
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

describe('createBriefService — campos obligatorios email', () => {
  it('devuelve error cuando channel=email y falta emailSubject', async () => {
    const result = await createBriefService({ ...validEmailInput, emailSubject: '' }, 'user-test-id')
    expect(result.success).toBe(false)
    expect(result.errors?.some((e) => e.field === 'emailSubject')).toBe(true)
  })

  it('devuelve error cuando channel=email y falta emailPreheader', async () => {
    const result = await createBriefService({ ...validEmailInput, emailPreheader: '' }, 'user-test-id')
    expect(result.success).toBe(false)
    expect(result.errors?.some((e) => e.field === 'emailPreheader')).toBe(true)
  })

  it('devuelve error cuando channel=email y emailTemplate no es válido', async () => {
    const result = await createBriefService({ ...validEmailInput, emailTemplate: 'fantasma' as never }, 'user-test-id')
    expect(result.success).toBe(false)
    expect(result.errors?.some((e) => e.field === 'emailTemplate')).toBe(true)
  })

  it('devuelve error cuando channel=email y falta emailTemplate', async () => {
    const result = await createBriefService({ ...validEmailInput, emailTemplate: undefined }, 'user-test-id')
    expect(result.success).toBe(false)
    expect(result.errors?.some((e) => e.field === 'emailTemplate')).toBe(true)
  })

  it('NO devuelve errores de email cuando channel=whatsapp y los campos email están ausentes', async () => {
    const result = await createBriefService(validInput, 'user-test-id')
    expect(result.success).toBe(true)
    expect(result.errors?.some((e) => e.field === 'emailSubject')).toBeFalsy()
    expect(result.errors?.some((e) => e.field === 'emailPreheader')).toBeFalsy()
    expect(result.errors?.some((e) => e.field === 'emailTemplate')).toBeFalsy()
  })

  it('persiste correctamente un brief de email con todos los campos', async () => {
    const result = await createBriefService(validEmailInput, 'user-test-id')
    expect(result.success).toBe(true)
    const calledWith = mockCreateBrief.mock.calls[0]![0]!
    expect(calledWith.emailSubject).toBe('Descubre el Máster MBA que transformará tu carrera')
    expect(calledWith.emailPreheader).toBe('Plazas limitadas para la próxima convocatoria')
    expect(calledWith.emailTemplate).toBe('promotional')
  })

  it('los campos email quedan como undefined cuando channel=whatsapp', async () => {
    await createBriefService(validInput, 'user-test-id')
    const calledWith = mockCreateBrief.mock.calls[0]![0]!
    expect(calledWith.emailSubject).toBeUndefined()
    expect(calledWith.emailPreheader).toBeUndefined()
    expect(calledWith.emailTemplate).toBeUndefined()
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
