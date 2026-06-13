import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/dao/briefDao', () => ({
  getBriefById: vi.fn(),
}))

vi.mock('../../src/dao/messageVersionDao', () => ({
  listVersionsByBrief: vi.fn(),
}))

vi.mock('../../src/dao/validationRunDao', () => ({
  listValidationRunsByMessage: vi.fn(),
}))

import { buildExportText } from '../../src/services/exportService'
import { getBriefById } from '../../src/dao/briefDao'
import { listVersionsByBrief } from '../../src/dao/messageVersionDao'
import { listValidationRunsByMessage } from '../../src/dao/validationRunDao'
import type { Brief, MessageVersion } from '../../src/generated/prisma/client'

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockGetBrief = vi.mocked(getBriefById)
const mockListVersions = vi.mocked(listVersionsByBrief)
const mockListRuns = vi.mocked(listValidationRunsByMessage)

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
  valueProposition: 'Red de alumni',
  cta: 'Solicitar info',
  constraints: null,
  reviewStatus: 'pending',
  reviewedBy: null,
  reviewedAt: null,
  reviewNote: null,
  crmStatus: null,
  emailTemplate: null,
  crmSentAt: null,
  crmSentBy: null,
  crmEmailHtml: null,
  crmEmailPlainText: null,
  crmInternalSubject: null,
  crmNotes: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
}

function makeVersion(id: string, num: number, userInstruction: string | null = null): MessageVersion {
  return {
    id,
    briefId: 'brief-1',
    versionNumber: num,
    content: `Contenido de la versión ${num}.`,
    emailSubject: null,
    emailPreheader: null,
    llmProvider: 'openai',
    llmModel: 'gpt-4o-mini',
    generationPromptVersion: 'v1.0',
    userInstruction,
    parentVersionId: null,
    createdAt: new Date('2026-06-01T10:00:00'),
  }
}

function makeRun(scores: Array<{ criterionKey: string; criterionName: string; status: string; comment: string; suggestedFix: string | null }> = []) {
  return {
    id: 'run-1',
    messageVersionId: 'mv-1',
    overallVerdict: 'aprobada',
    summary: 'El mensaje cumple los criterios.',
    suggestedRewrite: null,
    validatorModel: 'mock',
    validatorPromptVersion: 'v1.0',
    criteriaVersion: 'v1.0',
    createdAt: new Date('2026-06-01'),
    scores,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetBrief.mockResolvedValue(baseBrief)
  mockListVersions.mockResolvedValue([])
  mockListRuns.mockResolvedValue([] as never)
})

// ── Error: briefing no encontrado ─────────────────────────────────────────────

describe('buildExportText — briefing no encontrado', () => {
  it('lanza error si el brief no existe', async () => {
    mockGetBrief.mockResolvedValue(null)
    await expect(buildExportText('brief-inexistente')).rejects.toThrow(/no encontrado/i)
  })
})

// ── Cabecera y datos del briefing ─────────────────────────────────────────────

describe('buildExportText — cabecera y datos del briefing', () => {
  it('incluye el título del briefing en la cabecera', async () => {
    const text = await buildExportText('brief-1')
    expect(text).toContain('Campaña MBA')
  })

  it('incluye el número estable del briefing en la cabecera', async () => {
    const text = await buildExportText('brief-1')
    expect(text).toContain('Briefing: BR-001')
  })

  it('incluye todos los campos del briefing', async () => {
    const text = await buildExportText('brief-1')
    expect(text).toContain('Captar leads')
    expect(text).toContain('Profesionales 30-45')
    expect(text).toContain('email')
    expect(text).toContain('Red de alumni')
    expect(text).toContain('Solicitar info')
  })

  it('muestra "—" para campos opcionales ausentes', async () => {
    const text = await buildExportText('brief-1')
    expect(text).toContain('—')
  })

  it('incluye separadores visuales con ═ y ─', async () => {
    const text = await buildExportText('brief-1')
    expect(text).toContain('═')
    expect(text).toContain('─')
  })
})

// ── Briefing sin versiones ────────────────────────────────────────────────────

describe('buildExportText — briefing sin versiones', () => {
  it('indica que no hay versiones generadas', async () => {
    const text = await buildExportText('brief-1')
    expect(text).toContain('VERSIONES (0)')
    expect(text).toContain('Sin versiones generadas.')
  })

  it('no llama a listValidationRunsByMessage si no hay versiones', async () => {
    await buildExportText('brief-1')
    expect(mockListRuns).not.toHaveBeenCalled()
  })
})

// ── Versión sin validación ────────────────────────────────────────────────────

describe('buildExportText — versión sin validación', () => {
  it('muestra "SIN VALIDAR" para la versión sin ValidationRun', async () => {
    mockListVersions.mockResolvedValue([makeVersion('mv-1', 1)])
    mockListRuns.mockResolvedValue([] as never)

    const text = await buildExportText('brief-1')
    expect(text).toContain('Versión 1')
    expect(text).toContain('SIN VALIDAR')
    expect(text).toContain('Contenido de la versión 1.')
  })
})

// ── Versión con validación completa ──────────────────────────────────────────

describe('buildExportText — versión con validación completa', () => {
  it('muestra el veredicto en mayúsculas', async () => {
    mockListVersions.mockResolvedValue([makeVersion('mv-1', 1)])
    mockListRuns.mockResolvedValue([makeRun()] as never)

    const text = await buildExportText('brief-1')
    expect(text).toContain('APROBADA')
  })

  it('muestra el resumen de la validación', async () => {
    mockListVersions.mockResolvedValue([makeVersion('mv-1', 1)])
    mockListRuns.mockResolvedValue([makeRun()] as never)

    const text = await buildExportText('brief-1')
    expect(text).toContain('El mensaje cumple los criterios.')
  })

  it('muestra los bloques de validación con su status y comentario', async () => {
    const scores = [
      { criterionKey: 'claridad_estructura', criterionName: 'Claridad y estructura', status: 'mejorable', comment: 'La estructura podría mejorar.', suggestedFix: 'Reorganiza los párrafos.' },
    ]
    mockListVersions.mockResolvedValue([makeVersion('mv-1', 1)])
    mockListRuns.mockResolvedValue([makeRun(scores)] as never)

    const text = await buildExportText('brief-1')
    expect(text).toContain('Claridad y estructura')
    expect(text).toContain('[mejorable]')
    expect(text).toContain('La estructura podría mejorar.')
    expect(text).toContain('Reorganiza los párrafos.')
  })

  it('muestra el veredicto correcto para no_aprobada', async () => {
    const run = { ...makeRun(), overallVerdict: 'no_aprobada' }
    mockListVersions.mockResolvedValue([makeVersion('mv-1', 1)])
    mockListRuns.mockResolvedValue([run] as never)

    const text = await buildExportText('brief-1')
    expect(text).toContain('NO APROBADA')
  })

  it('muestra el veredicto correcto para aprobada_con_ajustes', async () => {
    const run = { ...makeRun(), overallVerdict: 'aprobada_con_ajustes' }
    mockListVersions.mockResolvedValue([makeVersion('mv-1', 1)])
    mockListRuns.mockResolvedValue([run] as never)

    const text = await buildExportText('brief-1')
    expect(text).toContain('APROBADA CON AJUSTES')
  })
})

// ── Instrucción aplicada ──────────────────────────────────────────────────────

describe('buildExportText — instrucción aplicada', () => {
  it('incluye la instrucción aplicada cuando existe', async () => {
    mockListVersions.mockResolvedValue([makeVersion('mv-1', 1, 'Hazlo más directo y breve.')])
    mockListRuns.mockResolvedValue([] as never)

    const text = await buildExportText('brief-1')
    expect(text).toContain('Instrucción aplicada:')
    expect(text).toContain('Hazlo más directo y breve.')
  })

  it('no incluye la sección de instrucción si no hay userInstruction', async () => {
    mockListVersions.mockResolvedValue([makeVersion('mv-1', 1, null)])
    mockListRuns.mockResolvedValue([] as never)

    const text = await buildExportText('brief-1')
    expect(text).not.toContain('Instrucción aplicada:')
  })
})

// ── Múltiples versiones ───────────────────────────────────────────────────────

describe('buildExportText — múltiples versiones', () => {
  it('exporta todas las versiones en el output', async () => {
    mockListVersions.mockResolvedValue([
      makeVersion('mv-1', 1),
      makeVersion('mv-2', 2),
    ])
    mockListRuns.mockResolvedValue([] as never)

    const text = await buildExportText('brief-1')
    expect(text).toContain('VERSIONES (2)')
    expect(text).toContain('Versión 1')
    expect(text).toContain('Versión 2')
  })
})
