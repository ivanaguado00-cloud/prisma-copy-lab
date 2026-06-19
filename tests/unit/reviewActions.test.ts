import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))
vi.mock('../../src/auth', () => ({
  auth: vi.fn(),
}))
vi.mock('../../src/services/reviewService', () => ({
  setReviewStatus: vi.fn(),
  submitBriefForReview: vi.fn(),
  notifyBriefApproval: vi.fn(),
}))
vi.mock('../../src/dao/briefDao', () => ({
  getBriefById: vi.fn(),
}))
vi.mock('../../src/dao/messageVersionDao', () => ({
  listVersionsByBrief: vi.fn(),
}))
vi.mock('../../src/dao/validationRunDao', () => ({
  listValidationRunsByMessage: vi.fn(),
}))
vi.mock('../../src/services/crmService', () => ({
  sendToCrm: vi.fn(),
}))

import { approveBriefAction } from '../../src/app/actions/reviewActions'
import { auth } from '../../src/auth'
import { getBriefById } from '../../src/dao/briefDao'
import { listVersionsByBrief } from '../../src/dao/messageVersionDao'
import { listValidationRunsByMessage } from '../../src/dao/validationRunDao'
import { sendToCrm } from '../../src/services/crmService'
import { setReviewStatus, notifyBriefApproval } from '../../src/services/reviewService'
import { OVERALL_VERDICT } from '../../src/types/domain'

const mockAuth = vi.mocked(auth)
const mockGetBriefById = vi.mocked(getBriefById)
const mockListVersionsByBrief = vi.mocked(listVersionsByBrief)
const mockListValidationRunsByMessage = vi.mocked(listValidationRunsByMessage)
const mockSendToCrm = vi.mocked(sendToCrm)
const mockSetReviewStatus = vi.mocked(setReviewStatus)
const mockNotifyBriefApproval = vi.mocked(notifyBriefApproval)

const BASE_BRIEF = {
  id: 'brief-1',
  channel: 'whatsapp',
  crmStatus: null,
  userId: 'user-author',
  title: 'Brief de prueba',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue({
    user: { id: 'pm-1', role: 'pm', email: 'pm@test.com' },
    expires: '2099-01-01',
  } as never)
  mockSetReviewStatus.mockResolvedValue({ success: true })
  mockGetBriefById.mockResolvedValue(BASE_BRIEF as never)
  mockListVersionsByBrief.mockResolvedValue([
    {
      id: 'version-1',
      content: 'WhatsApp aprobado',
      emailSubject: null,
      emailPreheader: null,
    },
  ] as never)
  mockListValidationRunsByMessage.mockResolvedValue([
    { overallVerdict: OVERALL_VERDICT.aprobada },
  ] as never)
  mockSendToCrm.mockResolvedValue({ success: true, mock: true })
  mockNotifyBriefApproval.mockResolvedValue(undefined)
})

describe('approveBriefAction — flujo feliz', () => {
  it('envía automáticamente a CRM un WhatsApp con veredicto aprobada', async () => {
    const result = await approveBriefAction('brief-1', 'Listo para campaña')

    expect(result.success).toBe(true)
    expect(mockSendToCrm).toHaveBeenCalledWith(
      expect.objectContaining({
        messageContent: 'WhatsApp aprobado',
        crmNotes: 'Listo para campaña',
        sentByUserId: 'pm-1',
      }),
    )
  })

  it('envía automáticamente a CRM un WhatsApp con veredicto aprobada_con_ajustes', async () => {
    mockListValidationRunsByMessage.mockResolvedValue([
      { overallVerdict: OVERALL_VERDICT.aprobada_con_ajustes },
    ] as never)

    const result = await approveBriefAction('brief-1')

    expect(result.success).toBe(true)
    expect(mockSendToCrm).toHaveBeenCalledOnce()
  })

  it('envía automáticamente a CRM un email aprobado', async () => {
    mockGetBriefById.mockResolvedValue({
      ...BASE_BRIEF,
      channel: 'email',
      emailTemplate: 'standard',
    } as never)
    mockListVersionsByBrief.mockResolvedValue([
      {
        id: 'version-1',
        content: 'Email aprobado',
        emailSubject: 'Asunto del email',
        emailPreheader: 'Preheader',
      },
    ] as never)

    const result = await approveBriefAction('brief-1', 'Listo para campaña')

    expect(result.success).toBe(true)
    expect(mockSendToCrm).toHaveBeenCalledWith(
      expect.objectContaining({
        messageContent: 'Email aprobado',
        emailSubject: 'Asunto del email',
        crmNotes: 'Listo para campaña',
      }),
    )
  })

  it('no reenvía un brief que ya figura como enviado a CRM', async () => {
    mockGetBriefById.mockResolvedValue({
      ...BASE_BRIEF,
      crmStatus: 'sent_to_crm',
    } as never)

    await approveBriefAction('brief-1')

    expect(mockSendToCrm).not.toHaveBeenCalled()
  })

  it('notifica al autor con crmSent=true tras envío exitoso', async () => {
    await approveBriefAction('brief-1', 'Nota del PM')

    expect(mockNotifyBriefApproval).toHaveBeenCalledWith(
      BASE_BRIEF.userId,
      BASE_BRIEF.title,
      'brief-1',
      true,
      'Nota del PM',
    )
  })
})

describe('approveBriefAction — bloqueo por veredicto inválido', () => {
  it('bloquea la aprobación si la versión tiene veredicto no_aprobada', async () => {
    mockListValidationRunsByMessage.mockResolvedValue([
      { overallVerdict: OVERALL_VERDICT.no_aprobada },
    ] as never)

    const result = await approveBriefAction('brief-1')

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
    expect(mockSetReviewStatus).not.toHaveBeenCalled()
  })

  it('bloquea la aprobación si no hay versiones del mensaje', async () => {
    mockListVersionsByBrief.mockResolvedValue([] as never)

    const result = await approveBriefAction('brief-1')

    expect(result.success).toBe(false)
    expect(mockSetReviewStatus).not.toHaveBeenCalled()
  })

  it('bloquea la aprobación si no hay validaciones en ninguna versión', async () => {
    mockListValidationRunsByMessage.mockResolvedValue([] as never)

    const result = await approveBriefAction('brief-1')

    expect(result.success).toBe(false)
    expect(mockSetReviewStatus).not.toHaveBeenCalled()
  })

  it('no envía al CRM ni notifica si el veredicto no es válido', async () => {
    mockListValidationRunsByMessage.mockResolvedValue([
      { overallVerdict: OVERALL_VERDICT.no_aprobada },
    ] as never)

    await approveBriefAction('brief-1')

    expect(mockSendToCrm).not.toHaveBeenCalled()
    expect(mockNotifyBriefApproval).not.toHaveBeenCalled()
  })
})

describe('approveBriefAction — aprobación duplicada', () => {
  it('rechaza la aprobación duplicada cuando setReviewStatus devuelve error', async () => {
    mockSetReviewStatus.mockResolvedValue({
      success: false,
      error: 'Este brief ya fue aprobado anteriormente.',
    })

    const result = await approveBriefAction('brief-1')

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/aprobado/i)
  })

  it('no envía al CRM si setReviewStatus rechaza la aprobación duplicada', async () => {
    mockSetReviewStatus.mockResolvedValue({
      success: false,
      error: 'Este brief ya fue aprobado anteriormente.',
    })

    await approveBriefAction('brief-1')

    expect(mockSendToCrm).not.toHaveBeenCalled()
  })

  it('no envía notificación si setReviewStatus rechaza la aprobación duplicada', async () => {
    mockSetReviewStatus.mockResolvedValue({
      success: false,
      error: 'Este brief ya fue aprobado anteriormente.',
    })

    await approveBriefAction('brief-1')

    expect(mockNotifyBriefApproval).not.toHaveBeenCalled()
  })
})

describe('approveBriefAction — fallo en el envío al CRM', () => {
  it('la aprobación tiene éxito aunque el envío al CRM falle', async () => {
    mockSendToCrm.mockResolvedValue({ success: false, error: 'Error SMTP' })

    const result = await approveBriefAction('brief-1')

    expect(result.success).toBe(true)
  })

  it('notifica al autor con crmSent=false si el envío CRM falló', async () => {
    mockSendToCrm.mockResolvedValue({ success: false, error: 'Error SMTP' })

    await approveBriefAction('brief-1', 'nota')

    expect(mockNotifyBriefApproval).toHaveBeenCalledWith(
      BASE_BRIEF.userId,
      BASE_BRIEF.title,
      'brief-1',
      false,
      'nota',
    )
  })

  it('sí llama a setReviewStatus aunque el CRM falle', async () => {
    mockSendToCrm.mockResolvedValue({ success: false, error: 'Error SMTP' })

    await approveBriefAction('brief-1')

    expect(mockSetReviewStatus).toHaveBeenCalledOnce()
  })
})
