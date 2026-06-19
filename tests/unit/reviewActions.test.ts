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
import { setReviewStatus } from '../../src/services/reviewService'
import { OVERALL_VERDICT } from '../../src/types/domain'

const mockAuth = vi.mocked(auth)
const mockGetBriefById = vi.mocked(getBriefById)
const mockListVersionsByBrief = vi.mocked(listVersionsByBrief)
const mockListValidationRunsByMessage = vi.mocked(listValidationRunsByMessage)
const mockSendToCrm = vi.mocked(sendToCrm)
const mockSetReviewStatus = vi.mocked(setReviewStatus)

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue({
    user: { id: 'pm-1', role: 'pm', email: 'pm@test.com' },
    expires: '2099-01-01',
  } as never)
  mockSetReviewStatus.mockResolvedValue({ success: true })
  mockGetBriefById.mockResolvedValue({
    id: 'brief-1',
    channel: 'whatsapp',
    crmStatus: null,
  } as never)
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
})

describe('approveBriefAction', () => {
  it('envía automáticamente a CRM un WhatsApp aprobado', async () => {
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

  it('no reenvía un WhatsApp que ya figura como enviado a CRM', async () => {
    mockGetBriefById.mockResolvedValue({
      id: 'brief-1',
      channel: 'whatsapp',
      crmStatus: 'sent_to_crm',
    } as never)

    await approveBriefAction('brief-1')

    expect(mockSendToCrm).not.toHaveBeenCalled()
  })
})
