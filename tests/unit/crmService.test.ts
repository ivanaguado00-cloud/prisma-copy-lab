import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/lib/emailTemplates', () => ({
  EMAIL_TEMPLATES: [
    {
      templateId: 'informative',
      name: 'Email informativo',
      description: 'Test template',
      recommendedUse: 'Comunicaciones explicativas.',
      layout: 'informative',
    },
  ],
  PRISMA_BRAND_KIT: {
    brandId: 'test',
    brandName: 'Universidad Prisma',
    claim: 'Claim',
    logoUrl: '',
    primaryColor: '#c3f400',
    secondaryColor: '#abd600',
    backgroundColor: '#ffffff',
    surfaceColor: '#f8f9fa',
    textColor: '#1a1a1a',
    mutedTextColor: '#6b7280',
    fontFamily: 'Arial',
    footerText: 'Footer',
    websiteUrl: 'https://universidadprisma.es',
  },
  renderEmailHtml: vi.fn(() => '<html>mock-html</html>'),
  renderEmailPlainText: vi.fn(() => 'mock plain text'),
}))

vi.mock('../../src/services/emailService', () => ({
  sendEmail: vi.fn(),
}))

vi.mock('../../src/dao/briefDao', () => ({
  updateBriefCrm: vi.fn(),
}))

import { buildCrmPreview, sendToCrm } from '../../src/services/crmService'
import { renderEmailHtml, renderEmailPlainText } from '../../src/lib/emailTemplates'
import { sendEmail } from '../../src/services/emailService'
import { updateBriefCrm } from '../../src/dao/briefDao'
import type { Brief } from '../../src/generated/prisma/client'

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockRenderHtml = vi.mocked(renderEmailHtml)
const mockRenderPlain = vi.mocked(renderEmailPlainText)
const mockSendEmail = vi.mocked(sendEmail)
const mockUpdateBriefCrm = vi.mocked(updateBriefCrm)

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

beforeEach(() => {
  vi.clearAllMocks()
  mockRenderHtml.mockReturnValue('<html>mock-html</html>')
  mockRenderPlain.mockReturnValue('mock plain text')
  mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-1', mock: true })
  mockUpdateBriefCrm.mockResolvedValue(undefined as never)
})

// ── buildCrmPreview ───────────────────────────────────────────────────────────

describe('buildCrmPreview — validación de plantilla', () => {
  it('lanza error cuando la plantilla no existe', () => {
    expect(() => buildCrmPreview(baseBrief, 'plantilla_inexistente', 'Cuerpo.')).toThrow(
      /Plantilla no encontrada/,
    )
  })

  it('no lanza error cuando la plantilla existe', () => {
    expect(() => buildCrmPreview(baseBrief, 'informative', 'Cuerpo.')).not.toThrow()
  })
})

describe('buildCrmPreview — contenido generado', () => {
  it('devuelve el html renderizado por renderEmailHtml', () => {
    const preview = buildCrmPreview(baseBrief, 'informative', 'Cuerpo.')
    expect(preview.html).toBe('<html>mock-html</html>')
  })

  it('devuelve el plainText renderizado por renderEmailPlainText', () => {
    const preview = buildCrmPreview(baseBrief, 'informative', 'Cuerpo.')
    expect(preview.plainText).toBe('mock plain text')
  })

  it('el internalSubject incluye el prefijo de solicitud CRM', () => {
    const preview = buildCrmPreview(baseBrief, 'informative', 'Cuerpo.')
    expect(preview.internalSubject).toContain('Solicitud CRM')
  })

  it('el internalSubject incluye el nombre de la plantilla', () => {
    const preview = buildCrmPreview(baseBrief, 'informative', 'Cuerpo.')
    expect(preview.internalSubject).toContain('Email informativo')
  })

  it('el internalSubject incluye el programa cuando existe', () => {
    const preview = buildCrmPreview(baseBrief, 'informative', 'Cuerpo.')
    expect(preview.internalSubject).toContain('Máster MBA')
  })

  it('el internalSubject no incluye el programa cuando es null', () => {
    const brief = { ...baseBrief, programOrTitulation: null }
    const preview = buildCrmPreview(brief, 'informative', 'Cuerpo.')
    expect(preview.internalSubject).not.toContain('null')
  })

  it('usa el título del brief como subject del contenido', () => {
    buildCrmPreview(baseBrief, 'informative', 'Cuerpo.')
    const [content] = mockRenderHtml.mock.calls[0]!
    expect(content.subject).toBe('Campaña MBA')
  })

  it('devuelve la plantilla seleccionada en el campo template', () => {
    const preview = buildCrmPreview(baseBrief, 'informative', 'Cuerpo.')
    expect(preview.template.templateId).toBe('informative')
  })

  it('devuelve el recipientEmail por defecto cuando la env var no está configurada', () => {
    const preview = buildCrmPreview(baseBrief, 'informative', 'Cuerpo.')
    expect(preview.recipientEmail).toBe('ivan.aguado00@gmail.com')
  })

  it('llama a renderEmailHtml y renderEmailPlainText exactamente una vez', () => {
    buildCrmPreview(baseBrief, 'informative', 'Cuerpo.')
    expect(mockRenderHtml).toHaveBeenCalledOnce()
    expect(mockRenderPlain).toHaveBeenCalledOnce()
  })

  it('pasa la plantilla correcta a renderEmailHtml', () => {
    buildCrmPreview(baseBrief, 'informative', 'Cuerpo.')
    const [, template] = mockRenderHtml.mock.calls[0]!
    expect(template.templateId).toBe('informative')
    expect(template.layout).toBe('informative')
  })
})

// ── sendToCrm — validaciones de entrada ──────────────────────────────────────

describe('sendToCrm — validaciones de entrada', () => {
  it('rechaza briefs de canal distinto a email', async () => {
    const brief = { ...baseBrief, channel: 'linkedin' }
    const result = await sendToCrm({
      brief: brief as Brief,
      templateId: 'informative',
      emailContent: 'Cuerpo.',
      sentByUserId: 'user-1',
    })
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/canal email/i)
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('rechaza emailContent vacío', async () => {
    const result = await sendToCrm({
      brief: baseBrief,
      templateId: 'informative',
      emailContent: '   ',
      sentByUserId: 'user-1',
    })
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/contenido/i)
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('rechaza templateId vacío', async () => {
    const result = await sendToCrm({
      brief: baseBrief,
      templateId: '',
      emailContent: 'Cuerpo.',
      sentByUserId: 'user-1',
    })
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/plantilla/i)
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('rechaza un templateId que no existe en EMAIL_TEMPLATES', async () => {
    const result = await sendToCrm({
      brief: baseBrief,
      templateId: 'no_existe',
      emailContent: 'Cuerpo.',
      sentByUserId: 'user-1',
    })
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/Plantilla no encontrada/i)
    expect(mockSendEmail).not.toHaveBeenCalled()
  })
})

// ── sendToCrm — flujo de envío ────────────────────────────────────────────────

describe('sendToCrm — envío', () => {
  it('llama a sendEmail una vez con el destinatario CRM configurado', async () => {
    await sendToCrm({
      brief: baseBrief,
      templateId: 'informative',
      emailContent: 'Cuerpo.',
      sentByUserId: 'user-1',
    })
    expect(mockSendEmail).toHaveBeenCalledOnce()
    const [payload] = mockSendEmail.mock.calls[0]!
    expect(payload.to).toBe('ivan.aguado00@gmail.com')
  })

  it('el asunto del email enviado incluye el prefijo de solicitud CRM', async () => {
    await sendToCrm({
      brief: baseBrief,
      templateId: 'informative',
      emailContent: 'Cuerpo.',
      sentByUserId: 'user-1',
    })
    const [payload] = mockSendEmail.mock.calls[0]!
    expect(payload.subject).toContain('Solicitud CRM')
  })

  it('el email enviado incluye html y texto plano', async () => {
    await sendToCrm({
      brief: baseBrief,
      templateId: 'informative',
      emailContent: 'Cuerpo.',
      sentByUserId: 'user-1',
    })
    const [payload] = mockSendEmail.mock.calls[0]!
    expect(payload.html).toBeTruthy()
    expect(payload.text).toBeTruthy()
  })
})

// ── sendToCrm — persistencia ──────────────────────────────────────────────────

describe('sendToCrm — persistencia', () => {
  it('no llama a updateBriefCrm si sendEmail falla', async () => {
    mockSendEmail.mockResolvedValueOnce({ success: false, error: 'SMTP timeout' })
    const result = await sendToCrm({
      brief: baseBrief,
      templateId: 'informative',
      emailContent: 'Cuerpo.',
      sentByUserId: 'user-1',
    })
    expect(result.success).toBe(false)
    expect(result.error).toBe('SMTP timeout')
    expect(mockUpdateBriefCrm).not.toHaveBeenCalled()
  })

  it('llama a updateBriefCrm con crmStatus sent_to_crm tras envío exitoso', async () => {
    await sendToCrm({
      brief: baseBrief,
      templateId: 'informative',
      emailContent: 'Cuerpo.',
      sentByUserId: 'user-1',
    })
    expect(mockUpdateBriefCrm).toHaveBeenCalledOnce()
    const [briefId, data] = mockUpdateBriefCrm.mock.calls[0]!
    expect(briefId).toBe('brief-1')
    expect(data.crmStatus).toBe('sent_to_crm')
  })

  it('persiste el templateId seleccionado', async () => {
    await sendToCrm({
      brief: baseBrief,
      templateId: 'informative',
      emailContent: 'Cuerpo.',
      sentByUserId: 'user-1',
    })
    const [, data] = mockUpdateBriefCrm.mock.calls[0]!
    expect(data.selectedTemplateId).toBe('informative')
  })

  it('persiste el userId del remitente', async () => {
    await sendToCrm({
      brief: baseBrief,
      templateId: 'informative',
      emailContent: 'Cuerpo.',
      sentByUserId: 'user-42',
    })
    const [, data] = mockUpdateBriefCrm.mock.calls[0]!
    expect(data.crmSentBy).toBe('user-42')
  })

  it('persiste las notas CRM cuando se pasan', async () => {
    await sendToCrm({
      brief: baseBrief,
      templateId: 'informative',
      emailContent: 'Cuerpo.',
      crmNotes: 'Prioridad alta.',
      sentByUserId: 'user-1',
    })
    const [, data] = mockUpdateBriefCrm.mock.calls[0]!
    expect(data.crmNotes).toBe('Prioridad alta.')
  })

  it('persiste null en crmNotes cuando no se pasan notas', async () => {
    await sendToCrm({
      brief: baseBrief,
      templateId: 'informative',
      emailContent: 'Cuerpo.',
      sentByUserId: 'user-1',
    })
    const [, data] = mockUpdateBriefCrm.mock.calls[0]!
    expect(data.crmNotes).toBeNull()
  })

  it('persiste crmSentAt como fecha válida', async () => {
    await sendToCrm({
      brief: baseBrief,
      templateId: 'informative',
      emailContent: 'Cuerpo.',
      sentByUserId: 'user-1',
    })
    const [, data] = mockUpdateBriefCrm.mock.calls[0]!
    expect(data.crmSentAt).toBeInstanceOf(Date)
  })
})

// ── sendToCrm — resultado devuelto ────────────────────────────────────────────

describe('sendToCrm — resultado', () => {
  it('devuelve success: true y mock: true cuando el email se envía en modo mock', async () => {
    mockSendEmail.mockResolvedValueOnce({ success: true, mock: true })
    const result = await sendToCrm({
      brief: baseBrief,
      templateId: 'informative',
      emailContent: 'Cuerpo.',
      sentByUserId: 'user-1',
    })
    expect(result.success).toBe(true)
    expect(result.mock).toBe(true)
  })

  it('devuelve success: true sin mock cuando el email se envía por SMTP real', async () => {
    mockSendEmail.mockResolvedValueOnce({ success: true, messageId: 'real-abc' })
    const result = await sendToCrm({
      brief: baseBrief,
      templateId: 'informative',
      emailContent: 'Cuerpo.',
      sentByUserId: 'user-1',
    })
    expect(result.success).toBe(true)
    expect(result.mock).toBeUndefined()
  })

  it('devuelve el error de sendEmail cuando falla', async () => {
    mockSendEmail.mockResolvedValueOnce({ success: false, error: 'Credenciales inválidas' })
    const result = await sendToCrm({
      brief: baseBrief,
      templateId: 'informative',
      emailContent: 'Cuerpo.',
      sentByUserId: 'user-1',
    })
    expect(result.success).toBe(false)
    expect(result.error).toBe('Credenciales inválidas')
  })
})
