import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/dao/briefDao', () => ({
  getBriefById: vi.fn(),
  updateBriefReview: vi.fn(),
}))
vi.mock('../../src/dao/userDao', () => ({
  getUserById: vi.fn(),
  getUsersByRole: vi.fn(),
}))
vi.mock('../../src/services/emailService', () => ({
  sendEmail: vi.fn(),
}))

import { submitBriefForReview, setReviewStatus } from '../../src/services/reviewService'
import { getBriefById, updateBriefReview } from '../../src/dao/briefDao'
import { getUserById, getUsersByRole } from '../../src/dao/userDao'
import { sendEmail } from '../../src/services/emailService'
import { USER_ROLE } from '../../src/types/domain'

const mockGetBrief = vi.mocked(getBriefById)
const mockUpdateBrief = vi.mocked(updateBriefReview)
const mockGetUser = vi.mocked(getUserById)
const mockGetUsersByRole = vi.mocked(getUsersByRole)
const mockSendEmail = vi.mocked(sendEmail)

const BRIEF_ID = 'brief-1'
const OWNER_ID = 'user-owner'
const OTHER_ID = 'user-other'

const baseBrief = {
  id: BRIEF_ID,
  userId: OWNER_ID,
  title: 'Brief de prueba',
  briefNumber: 1,
  programOrTitulation: null,
  objective: '',
  audience: '',
  channel: 'whatsapp',
  mode: 'produccion',
  valueProposition: '',
  cta: '',
  constraints: null,
  emailTemplate: null,
  reviewStatus: 'pending',
  reviewedBy: null,
  reviewedAt: null,
  reviewNote: null,
  crmStatus: null,
  crmSentAt: null,
  crmSentBy: null,
  crmEmailHtml: null,
  crmEmailPlainText: null,
  crmInternalSubject: null,
  crmNotes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetBrief.mockResolvedValue(baseBrief as never)
  mockUpdateBrief.mockResolvedValue(undefined as never)
  mockGetUser.mockResolvedValue({ id: OWNER_ID, email: 'autor@test.com', name: 'Autor', role: 'redactor' } as never)
  mockGetUsersByRole.mockResolvedValue([])
})

// ── submitBriefForReview ──────────────────────────────────────────────────────

describe('submitBriefForReview — permisos', () => {
  it.each([USER_ROLE.redactor, USER_ROLE.coordinador, USER_ROLE.admin])(
    'rol "%s" puede enviar su propio brief a revisión',
    async (role) => {
      const result = await submitBriefForReview(BRIEF_ID, OWNER_ID, role)
      expect(result.success).toBe(true)
    },
  )

  it('pm NO puede enviar un brief a revisión', async () => {
    const result = await submitBriefForReview(BRIEF_ID, OWNER_ID, USER_ROLE.pm)
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it.each(['reviewer', 'author', '', 'guest'])(
    'rol inválido/legacy "%s" no puede enviar a revisión',
    async (role) => {
      const result = await submitBriefForReview(BRIEF_ID, OWNER_ID, role)
      expect(result.success).toBe(false)
    },
  )

  it('redactor NO puede enviar el brief de otro usuario', async () => {
    const result = await submitBriefForReview(BRIEF_ID, OTHER_ID, USER_ROLE.redactor)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/autor/i)
  })

  it('coordinador NO puede enviar el brief de otro usuario', async () => {
    const result = await submitBriefForReview(BRIEF_ID, OTHER_ID, USER_ROLE.coordinador)
    expect(result.success).toBe(false)
  })

  it('admin SÍ puede enviar el brief de otro usuario', async () => {
    const result = await submitBriefForReview(BRIEF_ID, OTHER_ID, USER_ROLE.admin)
    expect(result.success).toBe(true)
  })

  it('falla si el brief no existe', async () => {
    mockGetBrief.mockResolvedValue(null as never)
    const result = await submitBriefForReview(BRIEF_ID, OWNER_ID, USER_ROLE.redactor)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/no encontrado/i)
  })
})

describe('submitBriefForReview — notificaciones', () => {
  it('notifica tanto a los PM como a los administradores', async () => {
    mockGetUsersByRole.mockImplementation(async (role) => {
      if (role === USER_ROLE.pm) {
        return [{ id: 'pm-1', email: 'pm@test.com', name: 'PM' }] as never
      }
      if (role === USER_ROLE.admin) {
        return [{ id: 'admin-1', email: 'admin@test.com', name: 'Admin' }] as never
      }
      return []
    })

    await submitBriefForReview(BRIEF_ID, OWNER_ID, USER_ROLE.redactor)

    expect(mockGetUsersByRole).toHaveBeenCalledWith(USER_ROLE.pm)
    expect(mockGetUsersByRole).toHaveBeenCalledWith(USER_ROLE.admin)
    expect(mockSendEmail).toHaveBeenCalledTimes(2)
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'pm@test.com' }))
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'admin@test.com' }))
  })

  it('no envía dos correos cuando PM y admin comparten dirección', async () => {
    mockGetUsersByRole.mockImplementation(async (role) => {
      if (role === USER_ROLE.pm) {
        return [{ id: 'pm-1', email: 'review@test.com', name: 'PM' }] as never
      }
      if (role === USER_ROLE.admin) {
        return [{ id: 'admin-1', email: 'REVIEW@test.com', name: 'Admin' }] as never
      }
      return []
    })

    await submitBriefForReview(BRIEF_ID, OWNER_ID, USER_ROLE.redactor)

    expect(mockSendEmail).toHaveBeenCalledTimes(1)
  })
})

// ── setReviewStatus ───────────────────────────────────────────────────────────

describe('setReviewStatus — permisos', () => {
  it.each([USER_ROLE.pm, USER_ROLE.admin])(
    'rol "%s" puede aprobar un brief',
    async (role) => {
      const result = await setReviewStatus(BRIEF_ID, 'reviewer-id', role, 'approved')
      expect(result.success).toBe(true)
    },
  )

  it.each([USER_ROLE.pm, USER_ROLE.admin])(
    'rol "%s" puede rechazar un brief',
    async (role) => {
      const result = await setReviewStatus(BRIEF_ID, 'reviewer-id', role, 'rejected', 'Revisar el tono')
      expect(result.success).toBe(true)
    },
  )

  it.each([USER_ROLE.redactor, USER_ROLE.coordinador])(
    'rol "%s" NO puede cambiar el estado de revisión',
    async (role) => {
      const result = await setReviewStatus(BRIEF_ID, 'reviewer-id', role, 'approved')
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    },
  )

  it('el rol legacy "reviewer" ya no puede revisar', async () => {
    const result = await setReviewStatus(BRIEF_ID, 'reviewer-id', 'reviewer', 'approved')
    expect(result.success).toBe(false)
  })

  it('falla si el brief no existe', async () => {
    mockGetBrief.mockResolvedValue(null as never)
    const result = await setReviewStatus(BRIEF_ID, 'reviewer-id', USER_ROLE.pm, 'approved')
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/no encontrado/i)
  })

  it('guarda la nota del revisor al rechazar', async () => {
    await setReviewStatus(BRIEF_ID, 'reviewer-id', USER_ROLE.pm, 'rejected', 'Cambiar el CTA')
    expect(mockUpdateBrief).toHaveBeenCalledWith(
      BRIEF_ID,
      expect.objectContaining({ reviewNote: 'Cambiar el CTA' }),
    )
  })
})
