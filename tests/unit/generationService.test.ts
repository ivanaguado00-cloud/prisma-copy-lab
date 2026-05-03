import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/dao/messageVersionDao', () => ({
  listVersionsByBrief: vi.fn(),
  createMessageVersion: vi.fn(),
}))

vi.mock('../../src/services/llm/factory', () => ({
  getGenerationClient: vi.fn(),
}))

vi.mock('../../src/services/llm/client', () => ({
  getModel: vi.fn(() => 'gpt-4o-mini'),
}))

import { generateMessage, buildUserPrompt, GENERATION_SYSTEM_PROMPT } from '../../src/services/generationService'
import { listVersionsByBrief, createMessageVersion } from '../../src/dao/messageVersionDao'
import { getGenerationClient } from '../../src/services/llm/factory'
import type { Brief } from '../../src/generated/prisma/client'

const mockListVersions = vi.mocked(listVersionsByBrief)
const mockCreateVersion = vi.mocked(createMessageVersion)
const mockGetClient = vi.mocked(getGenerationClient)

const baseBrief: Brief = {
  id: 'brief-1',
  title: 'Campaña MBA',
  programOrTitulation: 'Máster MBA',
  objective: 'Captar leads',
  audience: 'Profesionales 30-45',
  channel: 'email',
  mode: 'produccion',
  valueProposition: 'Red de alumni y empleabilidad',
  cta: 'Solicitar info',
  constraints: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
}

const mockClient = {
  generate: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetClient.mockReturnValue(mockClient)
  mockClient.generate.mockResolvedValue('Mensaje generado de prueba')
  mockListVersions.mockResolvedValue([])
  mockCreateVersion.mockResolvedValue({ id: 'mv-1', ...baseBrief } as never)
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
        generationPromptVersion: 'v1.0',
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
