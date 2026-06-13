import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/dao/messageVersionDao', () => ({
  listVersionsByBrief: vi.fn(),
  createMessageVersion: vi.fn(),
  getMessageVersionById: vi.fn(),
}))

vi.mock('../../src/services/llm/factory', () => ({
  getGenerationClient: vi.fn(),
}))

vi.mock('../../src/services/llm/client', () => ({
  getModel: vi.fn(() => 'gpt-4o-mini'),
}))

import {
  generateMessage,
  buildIterationUserPrompt,
  buildUserPrompt,
  GENERATION_SYSTEM_PROMPT,
} from '../../src/services/generationService'
import {
  listVersionsByBrief,
  createMessageVersion,
  getMessageVersionById,
} from '../../src/dao/messageVersionDao'
import { getGenerationClient } from '../../src/services/llm/factory'
import type { Brief, MessageVersion } from '../../src/generated/prisma/client'

const mockListVersions = vi.mocked(listVersionsByBrief)
const mockCreateVersion = vi.mocked(createMessageVersion)
const mockGetMessageVersion = vi.mocked(getMessageVersionById)
const mockGetClient = vi.mocked(getGenerationClient)

const baseBrief: Brief = {
  id: 'brief-1',
  userId: 'user-1',
  briefNumber: 1,
  title: 'Campaña MBA',
  programOrTitulation: 'Máster MBA',
  objective: 'Captar leads',
  audience: 'Profesionales 30-45',
  channel: 'email',
  mode: 'produccion',
  valueProposition: 'Red de alumni y empleabilidad',
  cta: 'Solicitar info',
  constraints: null,
  reviewStatus: 'pending',
  reviewedBy: null,
  reviewedAt: null,
  reviewNote: null,
  crmStatus: null,
  selectedTemplateId: null,
  crmSentAt: null,
  crmSentBy: null,
  crmEmailHtml: null,
  crmEmailPlainText: null,
  crmInternalSubject: null,
  crmNotes: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
}

const mockClient = {
  generate: vi.fn(),
}

const parentVersion: MessageVersion = {
  id: 'mv-parent',
  briefId: 'brief-1',
  versionNumber: 1,
  content: 'Asunto: Version previa\n\nContenido anterior.',
  llmProvider: 'openai',
  llmModel: 'gpt-4o-mini',
  generationPromptVersion: 'v1.0',
  userInstruction: null,
  parentVersionId: null,
  createdAt: new Date('2026-01-01'),
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetClient.mockReturnValue(mockClient)
  mockClient.generate.mockResolvedValue('Mensaje generado de prueba')
  mockListVersions.mockResolvedValue([])
  mockGetMessageVersion.mockResolvedValue(parentVersion)
  mockCreateVersion.mockResolvedValue({ id: 'mv-1' } as never)
})

describe('buildUserPrompt', () => {
  it('incluye todos los campos del briefing en el prompt', () => {
    const prompt = buildUserPrompt(baseBrief)

    expect(prompt).toContain('Campaña MBA')
    expect(prompt).toContain('Máster MBA')
    expect(prompt).toContain('Captar leads')
    expect(prompt).toContain('Profesionales 30-45')
    expect(prompt).toContain('canal: email')
    expect(prompt).toContain('Red de alumni y empleabilidad')
    expect(prompt).toContain('Solicitar info')
  })

  it('usa "no especificado" cuando programOrTitulation es null', () => {
    const brief = { ...baseBrief, programOrTitulation: null }
    const prompt = buildUserPrompt(brief)
    expect(prompt).toContain('no especificado')
  })

  it('usa "ninguna" cuando constraints es null', () => {
    const prompt = buildUserPrompt(baseBrief)
    expect(prompt).toContain('ninguna')
  })

  it('incluye indicación PRODUCCIÓN para modo produccion', () => {
    const prompt = buildUserPrompt(baseBrief)
    expect(prompt).toContain('PRODUCCIÓN')
  })

  it('incluye indicación EXPLORACIÓN para modo exploracion', () => {
    const brief = { ...baseBrief, mode: 'exploracion' }
    const prompt = buildUserPrompt(brief as Brief)
    expect(prompt).toContain('EXPLORACIÓN')
  })
})

describe('generateMessage — llamada al cliente LLM', () => {
  it('pasa el system prompt y el user prompt al cliente', async () => {
    await generateMessage(baseBrief)

    expect(mockClient.generate).toHaveBeenCalledOnce()
    const [systemPrompt, userPrompt] = mockClient.generate.mock.calls[0]!
    expect(systemPrompt).toBe(GENERATION_SYSTEM_PROMPT)
    expect(userPrompt).toContain('Campaña MBA')
  })

  it('el mock client devuelve la respuesta pregrabada', async () => {
    mockClient.generate.mockResolvedValue('Respuesta del mock')
    await generateMessage(baseBrief)
    expect(mockCreateVersion).toHaveBeenCalledWith(
      expect.objectContaining({ content: 'Respuesta del mock' }),
    )
  })

  it('usa la version anterior cuando genera una iteracion con instruccion del usuario', async () => {
    await generateMessage(baseBrief, {
      userInstruction: 'Hazlo mas directo.',
      parentVersionId: 'mv-parent',
    })

    const [, userPrompt] = mockClient.generate.mock.calls[0]!
    expect(userPrompt).toContain('VERSIÓN ANTERIOR:')
    expect(userPrompt).toContain(parentVersion.content)
    expect(userPrompt).toContain('Hazlo mas directo.')
    expect(mockCreateVersion).toHaveBeenCalledWith(
      expect.objectContaining({
        parentVersionId: 'mv-parent',
        userInstruction: 'Hazlo mas directo.',
      }),
    )
  })

  it('rechaza una instruccion de iteracion sin version de origen', async () => {
    await expect(
      generateMessage(baseBrief, { userInstruction: 'Hazlo mas directo.' }),
    ).rejects.toThrow(/versi.n de origen/i)

    expect(mockClient.generate).not.toHaveBeenCalled()
    expect(mockCreateVersion).not.toHaveBeenCalled()
  })

  it('rechaza una version de origen que pertenece a otro briefing', async () => {
    mockGetMessageVersion.mockResolvedValue({ ...parentVersion, briefId: 'brief-2' })

    await expect(
      generateMessage(baseBrief, {
        userInstruction: 'Hazlo mas directo.',
        parentVersionId: 'mv-parent',
      }),
    ).rejects.toThrow(/este briefing/i)
  })
})

describe('buildIterationUserPrompt', () => {
  it('incluye briefing, version anterior e instruccion sin pedir alternativas', () => {
    const prompt = buildIterationUserPrompt({
      brief: baseBrief,
      previousContent: parentVersion.content,
      userInstruction: 'Dame una opcion menos promocional.',
    })

    expect(prompt).toContain(parentVersion.content)
    expect(prompt).toContain('Campaña MBA')
    expect(prompt).toContain('Dame una opcion menos promocional.')
    expect(prompt).toContain('sin explicaciones ni alternativas')
  })
})

describe('generateMessage — versionNumber', () => {
  it('asigna versionNumber 1 cuando no hay versiones previas', async () => {
    mockListVersions.mockResolvedValue([])
    await generateMessage(baseBrief)

    expect(mockCreateVersion).toHaveBeenCalledWith(
      expect.objectContaining({ versionNumber: 1 }),
    )
  })

  it('incrementa versionNumber cuando ya existen versiones', async () => {
    mockListVersions.mockResolvedValue([{ id: 'mv-0' }, { id: 'mv-1' }] as never)
    await generateMessage(baseBrief)

    expect(mockCreateVersion).toHaveBeenCalledWith(
      expect.objectContaining({ versionNumber: 3 }),
    )
  })
})

describe('generateMessage — metadatos persistidos', () => {
  it('persiste briefId, llmProvider, llmModel y generationPromptVersion', async () => {
    await generateMessage(baseBrief)

    expect(mockCreateVersion).toHaveBeenCalledWith(
      expect.objectContaining({
        briefId: 'brief-1',
        llmProvider: 'openai',
        llmModel: 'gpt-4o-mini',
        generationPromptVersion: 'v1.1',
      }),
    )
  })

  it('usa "mock" como llmModel cuando LLM_MOCK está activo', async () => {
    vi.stubEnv('LLM_MOCK', 'true')
    await generateMessage(baseBrief)
    expect(mockCreateVersion).toHaveBeenCalledWith(
      expect.objectContaining({ llmModel: 'mock' }),
    )
    vi.unstubAllEnvs()
  })
})
