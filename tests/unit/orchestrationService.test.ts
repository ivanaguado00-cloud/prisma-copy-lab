import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/services/generationService', () => ({
  generateMessage: vi.fn(),
}))

vi.mock('../../src/services/validationService', () => ({
  validateMessage: vi.fn(),
}))

import { generateAndApprove, generateSingle } from '../../src/services/orchestrationService'
import { generateMessage } from '../../src/services/generationService'
import { validateMessage } from '../../src/services/validationService'
import type { Brief, MessageVersion } from '../../src/generated/prisma/client'

const mockGenerateMessage = vi.mocked(generateMessage)
const mockValidateMessage = vi.mocked(validateMessage)

const baseBrief: Brief = {
  id: 'brief-1',
  userId: 'user-1',
  briefNumber: 1,
  title: 'Test',
  programOrTitulation: 'MBA',
  objective: 'Captar leads',
  audience: 'Profesionales',
  channel: 'email',
  mode: 'produccion',
  valueProposition: 'Flexibilidad',
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
  createdAt: new Date(),
  updatedAt: new Date(),
}

const generatedVersion: MessageVersion = {
  id: 'mv-1',
  briefId: 'brief-1',
  versionNumber: 1,
  content: 'Contenido',
  llmProvider: 'openai',
  llmModel: 'gpt-4o-mini',
  generationPromptVersion: 'v1.1',
  userInstruction: null,
  parentVersionId: null,
  createdAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGenerateMessage.mockResolvedValue(generatedVersion)
  mockValidateMessage.mockResolvedValue({ id: 'run-1' } as never)
})

describe('generateSingle', () => {
  it('genera y valida una sola version por peticion de usuario', async () => {
    const result = await generateSingle(baseBrief)

    expect(result).toBe(generatedVersion)
    expect(mockGenerateMessage).toHaveBeenCalledOnce()
    expect(mockGenerateMessage).toHaveBeenCalledWith(baseBrief, {})
    expect(mockValidateMessage).toHaveBeenCalledOnce()
    expect(mockValidateMessage).toHaveBeenCalledWith('mv-1')
  })

  it('mantiene la instruccion y la version padre en refinados explicitos', async () => {
    await generateSingle(baseBrief, {
      userInstruction: 'Hazlo mas directo.',
      parentVersionId: 'mv-parent',
    })

    expect(mockGenerateMessage).toHaveBeenCalledOnce()
    expect(mockGenerateMessage).toHaveBeenCalledWith(baseBrief, {
      userInstruction: 'Hazlo mas directo.',
      parentVersionId: 'mv-parent',
    })
  })
})

describe('generateAndApprove', () => {
  it('es compatible con llamadas antiguas, pero ya no reintenta ni crea versiones intermedias', async () => {
    const result = await generateAndApprove(baseBrief)

    expect(result).toBe(generatedVersion)
    expect(mockGenerateMessage).toHaveBeenCalledOnce()
    expect(mockValidateMessage).toHaveBeenCalledOnce()
  })
})
