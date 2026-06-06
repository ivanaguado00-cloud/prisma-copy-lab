import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/services/generationService', () => ({
  generateMessage: vi.fn(),
}))

vi.mock('../../src/services/validationService', () => ({
  validateMessage: vi.fn(),
}))

vi.mock('../../src/dao/validationRunDao', () => ({
  listValidationRunsByMessage: vi.fn(),
}))

vi.mock('../../src/services/llm/factory', () => ({
  getGenerationClient: vi.fn(),
}))

import { generateAndApprove } from '../../src/services/orchestrationService'
import { generateMessage } from '../../src/services/generationService'
import { validateMessage } from '../../src/services/validationService'
import { listValidationRunsByMessage } from '../../src/dao/validationRunDao'
import { getGenerationClient } from '../../src/services/llm/factory'
import type { Brief, MessageVersion } from '../../src/generated/prisma/client'

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockGenerateMessage = vi.mocked(generateMessage)
const mockValidateMessage = vi.mocked(validateMessage)
const mockListRuns = vi.mocked(listValidationRunsByMessage)
const mockGetGenerationClient = vi.mocked(getGenerationClient)

const baseBrief: Brief = {
  id: 'brief-1',
  userId: 'user-1',
  title: 'Test',
  programOrTitulation: 'MBA',
  objective: 'Captar leads',
  audience: 'Profesionales',
  channel: 'email',
  mode: 'produccion',
  valueProposition: 'Flexibilidad',
  cta: 'Solicitar info',
  constraints: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

function makeVersion(id: string): MessageVersion {
  return {
    id,
    briefId: 'brief-1',
    versionNumber: 1,
    content: `Contenido ${id}`,
    llmProvider: 'openai',
    llmModel: 'gpt-4o-mini',
    generationPromptVersion: 'v1.0',
    userInstruction: null,
    parentVersionId: null,
    createdAt: new Date(),
  }
}

function makeRunWithVerdict(verdict: string, criticalCount = 0) {
  const scores = Array.from({ length: 7 }, (_, i) => ({
    id: `score-${i}`,
    validationRunId: 'run-1',
    criterionKey: `criterion_${i}`,
    criterionName: `Criterio ${i}`,
    status: i < criticalCount ? 'critico' : 'bien',
    comment: 'Comentario.',
    suggestedFix: null,
    createdAt: new Date(),
  }))
  return [{
    id: 'run-1',
    messageVersionId: 'mv-1',
    overallVerdict: verdict,
    summary: 'Resumen.',
    suggestedRewrite: null,
    validatorModel: 'mock',
    validatorPromptVersion: 'v1.0',
    criteriaVersion: 'v1.0',
    createdAt: new Date(),
    scores,
  }]
}

const mockLlmClient = { generate: vi.fn().mockResolvedValue('Instrucción de mejora generada.') }

beforeEach(() => {
  vi.clearAllMocks()
  mockGetGenerationClient.mockReturnValue(mockLlmClient as never)
  mockValidateMessage.mockResolvedValue({ id: 'run-1' } as never)
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('generateAndApprove — aprobada en primer intento', () => {
  it('devuelve la versión sin reintentos si el veredicto es aprobada', async () => {
    const v1 = makeVersion('mv-1')
    mockGenerateMessage.mockResolvedValueOnce(v1)
    mockListRuns.mockResolvedValueOnce(makeRunWithVerdict('aprobada') as never)

    const result = await generateAndApprove(baseBrief)

    expect(result).toBe(v1)
    expect(mockGenerateMessage).toHaveBeenCalledTimes(1)
    expect(mockValidateMessage).toHaveBeenCalledTimes(1)
  })

  it('pasa userInstruction correctamente en el primer intento', async () => {
    const v1 = makeVersion('mv-1')
    mockGenerateMessage.mockResolvedValueOnce(v1)
    mockListRuns.mockResolvedValueOnce(makeRunWithVerdict('aprobada') as never)

    await generateAndApprove(baseBrief, { userInstruction: 'Hazlo más directo.', parentVersionId: 'pv-0' })

    expect(mockGenerateMessage).toHaveBeenCalledWith(baseBrief, {
      userInstruction: 'Hazlo más directo.',
      parentVersionId: 'pv-0',
    })
  })
})

describe('generateAndApprove — aprobada en segundo intento', () => {
  it('reintenta y devuelve la versión del segundo intento si el primero no es aprobado', async () => {
    const v1 = makeVersion('mv-1')
    const v2 = makeVersion('mv-2')

    mockGenerateMessage
      .mockResolvedValueOnce(v1)
      .mockResolvedValueOnce(v2)

    mockListRuns
      .mockResolvedValueOnce(makeRunWithVerdict('no_aprobada', 1) as never)
      .mockResolvedValueOnce(makeRunWithVerdict('aprobada') as never)

    const result = await generateAndApprove(baseBrief)

    expect(result).toBe(v2)
    expect(mockGenerateMessage).toHaveBeenCalledTimes(2)
    expect(mockValidateMessage).toHaveBeenCalledTimes(2)
  })

  it('usa la versión anterior como parentVersionId en el reintento', async () => {
    const v1 = makeVersion('mv-1')
    const v2 = makeVersion('mv-2')

    mockGenerateMessage
      .mockResolvedValueOnce(v1)
      .mockResolvedValueOnce(v2)

    mockListRuns
      .mockResolvedValueOnce(makeRunWithVerdict('no_aprobada', 1) as never)
      .mockResolvedValueOnce(makeRunWithVerdict('aprobada') as never)

    await generateAndApprove(baseBrief)

    expect(mockGenerateMessage).toHaveBeenNthCalledWith(2, baseBrief, expect.objectContaining({
      parentVersionId: 'mv-1',
    }))
  })

  it('genera una instrucción de mejora para el reintento', async () => {
    const v1 = makeVersion('mv-1')
    const v2 = makeVersion('mv-2')

    mockGenerateMessage
      .mockResolvedValueOnce(v1)
      .mockResolvedValueOnce(v2)

    mockListRuns
      .mockResolvedValueOnce(makeRunWithVerdict('no_aprobada', 1) as never)
      .mockResolvedValueOnce(makeRunWithVerdict('aprobada') as never)

    await generateAndApprove(baseBrief)

    expect(mockLlmClient.generate).toHaveBeenCalledOnce()
    expect(mockGenerateMessage).toHaveBeenNthCalledWith(2, baseBrief, expect.objectContaining({
      userInstruction: 'Instrucción de mejora generada.',
    }))
  })
})

describe('generateAndApprove — 3 intentos sin aprobada', () => {
  it('devuelve la versión con menos críticos tras 3 intentos fallidos', async () => {
    const v1 = makeVersion('mv-1')
    const v2 = makeVersion('mv-2')
    const v3 = makeVersion('mv-3')

    mockGenerateMessage
      .mockResolvedValueOnce(v1)
      .mockResolvedValueOnce(v2)
      .mockResolvedValueOnce(v3)

    mockListRuns
      .mockResolvedValueOnce(makeRunWithVerdict('no_aprobada', 2) as never)
      .mockResolvedValueOnce(makeRunWithVerdict('aprobada_con_ajustes', 0) as never)
      .mockResolvedValueOnce(makeRunWithVerdict('no_aprobada', 1) as never)

    const result = await generateAndApprove(baseBrief)

    // v2 tiene 0 críticos — es la mejor
    expect(result).toBe(v2)
    expect(mockGenerateMessage).toHaveBeenCalledTimes(3)
  })

  it('no genera instrucción de mejora en el tercer intento', async () => {
    const v1 = makeVersion('mv-1')
    const v2 = makeVersion('mv-2')
    const v3 = makeVersion('mv-3')

    mockGenerateMessage
      .mockResolvedValueOnce(v1)
      .mockResolvedValueOnce(v2)
      .mockResolvedValueOnce(v3)

    mockListRuns
      .mockResolvedValueOnce(makeRunWithVerdict('no_aprobada', 1) as never)
      .mockResolvedValueOnce(makeRunWithVerdict('no_aprobada', 1) as never)
      .mockResolvedValueOnce(makeRunWithVerdict('no_aprobada', 1) as never)

    await generateAndApprove(baseBrief)

    // Solo 2 instrucciones: entre intento 1→2 y entre intento 2→3
    expect(mockLlmClient.generate).toHaveBeenCalledTimes(2)
  })

  it('devuelve la primera versión si todas tienen el mismo número de críticos', async () => {
    const v1 = makeVersion('mv-1')
    const v2 = makeVersion('mv-2')
    const v3 = makeVersion('mv-3')

    mockGenerateMessage
      .mockResolvedValueOnce(v1)
      .mockResolvedValueOnce(v2)
      .mockResolvedValueOnce(v3)

    mockListRuns
      .mockResolvedValueOnce(makeRunWithVerdict('no_aprobada', 1) as never)
      .mockResolvedValueOnce(makeRunWithVerdict('no_aprobada', 1) as never)
      .mockResolvedValueOnce(makeRunWithVerdict('no_aprobada', 1) as never)

    const result = await generateAndApprove(baseBrief)

    // Con el mismo número de críticos, el reduce devuelve el primero
    expect(result).toBe(v1)
  })
})
