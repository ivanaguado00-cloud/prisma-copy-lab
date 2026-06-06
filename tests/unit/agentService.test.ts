import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/dao/validationRunDao', () => ({
  listValidationRunsByMessage: vi.fn(),
}))

vi.mock('../../src/services/generationService', () => ({
  generateMessage: vi.fn(),
}))

vi.mock('../../src/services/llm/factory', () => ({
  getGenerationClient: vi.fn(),
}))

import { autoRefine } from '../../src/services/agentService'
import { listValidationRunsByMessage } from '../../src/dao/validationRunDao'
import { generateMessage } from '../../src/services/generationService'
import { getGenerationClient } from '../../src/services/llm/factory'
import type { Brief } from '../../src/generated/prisma/client'

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockListRuns = vi.mocked(listValidationRunsByMessage)
const mockGenerateMessage = vi.mocked(generateMessage)
const mockGetClient = vi.mocked(getGenerationClient)

const mockClient = { generate: vi.fn() }

const baseBrief: Brief = {
  id: 'brief-1',
  userId: 'user-1',
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

function makeRun(overallVerdict: string, scores: Array<{ criterionKey: string; status: string; comment: string; suggestedFix: string | null }> = []) {
  return {
    id: 'run-1',
    messageVersionId: 'mv-1',
    overallVerdict,
    summary: 'Resumen de validación.',
    suggestedRewrite: null,
    validatorModel: 'mock',
    validatorPromptVersion: 'v1.0',
    criteriaVersion: 'v1.0',
    createdAt: new Date('2026-01-01'),
    scores,
  }
}

function makeScore(criterionKey: string, status: string, comment = 'Comentario.', suggestedFix: string | null = null) {
  return { id: `score-${criterionKey}`, validationRunId: 'run-1', criterionKey, criterionName: criterionKey, status, comment, suggestedFix, createdAt: new Date() }
}

const allBienScores = [
  makeScore('alineacion_estrategica', 'bien'),
  makeScore('claridad_estructura', 'bien'),
  makeScore('tono_coherencia_marca', 'bien'),
  makeScore('calidad_argumental', 'bien'),
  makeScore('adaptacion_canal', 'bien'),
  makeScore('precision_fiabilidad', 'bien'),
  makeScore('calidad_ejecucion', 'bien'),
]

const failingScores = [
  makeScore('alineacion_estrategica', 'bien'),
  makeScore('claridad_estructura', 'critico', 'Estructura confusa.', 'Reorganiza los párrafos.'),
  makeScore('tono_coherencia_marca', 'mejorable', 'Tono demasiado frío.'),
  makeScore('calidad_argumental', 'bien'),
  makeScore('adaptacion_canal', 'bien'),
  makeScore('precision_fiabilidad', 'bien'),
  makeScore('calidad_ejecucion', 'bien'),
]

beforeEach(() => {
  vi.clearAllMocks()
  mockGetClient.mockReturnValue(mockClient)
  mockClient.generate.mockResolvedValue('Mejora la estructura y suaviza el tono.')
  mockGenerateMessage.mockResolvedValue({ id: 'mv-2' } as never)
})

// ── Error: veredicto aprobada ─────────────────────────────────────────────────

describe('autoRefine — veredicto aprobada', () => {
  it('lanza error si el veredicto es aprobada', async () => {
    mockListRuns.mockResolvedValue([makeRun('aprobada', allBienScores)] as never)

    await expect(autoRefine('mv-1', baseBrief)).rejects.toThrow(/aprobado/i)
  })

  it('no llama a generateMessage si el veredicto es aprobada', async () => {
    mockListRuns.mockResolvedValue([makeRun('aprobada', allBienScores)] as never)

    await expect(autoRefine('mv-1', baseBrief)).rejects.toThrow()
    expect(mockGenerateMessage).not.toHaveBeenCalled()
  })
})

// ── Error: sin validación previa ──────────────────────────────────────────────

describe('autoRefine — sin validación previa', () => {
  it('lanza error si no hay ningún ValidationRun para la versión', async () => {
    mockListRuns.mockResolvedValue([] as never)

    await expect(autoRefine('mv-1', baseBrief)).rejects.toThrow(/validación/i)
  })
})

// ── Flujo no_aprobada ─────────────────────────────────────────────────────────

describe('autoRefine — veredicto no_aprobada', () => {
  it('llama al cliente LLM con los bloques fallidos en el prompt', async () => {
    mockListRuns.mockResolvedValue([makeRun('no_aprobada', failingScores)] as never)

    await autoRefine('mv-1', baseBrief)

    expect(mockClient.generate).toHaveBeenCalledOnce()
    const [, userPrompt] = mockClient.generate.mock.calls[0]!
    expect(userPrompt).toContain('critico')
    expect(userPrompt).toContain('mejorable')
    expect(userPrompt).toContain('Estructura confusa.')
  })

  it('no incluye bloques con status bien en el prompt', async () => {
    mockListRuns.mockResolvedValue([makeRun('no_aprobada', failingScores)] as never)

    await autoRefine('mv-1', baseBrief)

    const [, userPrompt] = mockClient.generate.mock.calls[0]!
    expect(userPrompt).not.toContain('alineacion_estrategica')
  })

  it('llama a generateMessage con la instrucción generada y parentVersionId', async () => {
    mockListRuns.mockResolvedValue([makeRun('no_aprobada', failingScores)] as never)
    mockClient.generate.mockResolvedValue('  Reorganiza la estructura y ajusta el tono.  ')

    await autoRefine('mv-1', baseBrief)

    expect(mockGenerateMessage).toHaveBeenCalledWith(baseBrief, {
      userInstruction: 'Reorganiza la estructura y ajusta el tono.',
      parentVersionId: 'mv-1',
    })
  })

  it('devuelve la nueva MessageVersion creada por generateMessage', async () => {
    mockListRuns.mockResolvedValue([makeRun('no_aprobada', failingScores)] as never)
    mockGenerateMessage.mockResolvedValue({ id: 'mv-2', versionNumber: 2 } as never)

    const result = await autoRefine('mv-1', baseBrief)

    expect(result).toMatchObject({ id: 'mv-2', versionNumber: 2 })
  })
})

// ── Flujo aprobada_con_ajustes ────────────────────────────────────────────────

describe('autoRefine — veredicto aprobada_con_ajustes', () => {
  it('genera instrucción y llama a generateMessage igual que con no_aprobada', async () => {
    mockListRuns.mockResolvedValue([makeRun('aprobada_con_ajustes', failingScores)] as never)

    await autoRefine('mv-1', baseBrief)

    expect(mockClient.generate).toHaveBeenCalledOnce()
    expect(mockGenerateMessage).toHaveBeenCalledOnce()
  })
})

// ── Mock LLM ──────────────────────────────────────────────────────────────────

describe('autoRefine — compatibilidad con LLM mock', () => {
  it('usa el GenerationClient devuelto por getGenerationClient (real o mock)', async () => {
    mockListRuns.mockResolvedValue([makeRun('no_aprobada', failingScores)] as never)

    await autoRefine('mv-1', baseBrief)

    expect(mockGetClient).toHaveBeenCalledOnce()
    expect(mockClient.generate).toHaveBeenCalledOnce()
  })

  it('trimea espacios en la instrucción antes de pasarla a generateMessage', async () => {
    mockListRuns.mockResolvedValue([makeRun('no_aprobada', failingScores)] as never)
    mockClient.generate.mockResolvedValue('\n  Instrucción con espacios.  \n')

    await autoRefine('mv-1', baseBrief)

    expect(mockGenerateMessage).toHaveBeenCalledWith(baseBrief, {
      userInstruction: 'Instrucción con espacios.',
      parentVersionId: 'mv-1',
    })
  })
})
