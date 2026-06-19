import { describe, it, expect } from 'vitest'
import {
  USER_ROLE,
  isAdmin,
  canCreateBriefs,
  canSeeAllBriefs,
  canAccessDashboard,
  canReview,
  canSendToCrm,
} from '../../src/types/domain'

// ── Matriz de permisos esperada ───────────────────────────────────────────────
//
//              createBriefs  seeAllBriefs  dashboard  review  sendToCrm
// redactor         ✅            ❌           ❌        ❌        ❌
// coordinador      ✅            ✅           ✅        ❌        ❌
// pm               ❌            ✅           ❌        ✅        ✅
// admin            ✅            ✅           ✅        ✅        ✅
// sin rol          ❌            ❌           ❌        ❌        ❌

const ALL_ROLES = [USER_ROLE.redactor, USER_ROLE.coordinador, USER_ROLE.pm, USER_ROLE.admin]
const EDGE_CASES = [undefined, null, '', 'reviewer', 'author', 'superadmin']

// ── isAdmin ───────────────────────────────────────────────────────────────────

describe('isAdmin', () => {
  it('solo admin devuelve true', () => {
    expect(isAdmin(USER_ROLE.admin)).toBe(true)
  })

  it.each([USER_ROLE.redactor, USER_ROLE.coordinador, USER_ROLE.pm])(
    'rol "%s" no es admin',
    (role) => expect(isAdmin(role)).toBe(false),
  )

  it.each(EDGE_CASES)('valor "%s" no es admin', (v) => expect(isAdmin(v)).toBe(false))
})

// ── canCreateBriefs ───────────────────────────────────────────────────────────

describe('canCreateBriefs', () => {
  it.each([USER_ROLE.redactor, USER_ROLE.coordinador, USER_ROLE.admin])(
    '"%s" puede crear briefs',
    (role) => expect(canCreateBriefs(role)).toBe(true),
  )

  it('pm NO puede crear briefs', () => {
    expect(canCreateBriefs(USER_ROLE.pm)).toBe(false)
  })

  it.each(EDGE_CASES)('valor "%s" no puede crear briefs', (v) => {
    expect(canCreateBriefs(v)).toBe(false)
  })
})

// ── canSeeAllBriefs ───────────────────────────────────────────────────────────

describe('canSeeAllBriefs', () => {
  it.each([USER_ROLE.pm, USER_ROLE.coordinador, USER_ROLE.admin])(
    '"%s" puede ver todos los briefs',
    (role) => expect(canSeeAllBriefs(role)).toBe(true),
  )

  it('redactor NO puede ver todos los briefs', () => {
    expect(canSeeAllBriefs(USER_ROLE.redactor)).toBe(false)
  })

  it.each(EDGE_CASES)('valor "%s" no puede ver todos los briefs', (v) => {
    expect(canSeeAllBriefs(v)).toBe(false)
  })
})

// ── canAccessDashboard ────────────────────────────────────────────────────────

describe('canAccessDashboard', () => {
  it.each([USER_ROLE.coordinador, USER_ROLE.admin])(
    '"%s" puede acceder al dashboard',
    (role) => expect(canAccessDashboard(role)).toBe(true),
  )

  it.each([USER_ROLE.redactor, USER_ROLE.pm])(
    '"%s" NO puede acceder al dashboard',
    (role) => expect(canAccessDashboard(role)).toBe(false),
  )

  it.each(EDGE_CASES)('valor "%s" no puede acceder al dashboard', (v) => {
    expect(canAccessDashboard(v)).toBe(false)
  })
})

// ── canReview ─────────────────────────────────────────────────────────────────

describe('canReview', () => {
  it.each([USER_ROLE.pm, USER_ROLE.admin])(
    '"%s" puede revisar',
    (role) => expect(canReview(role)).toBe(true),
  )

  it.each([USER_ROLE.redactor, USER_ROLE.coordinador])(
    '"%s" NO puede revisar',
    (role) => expect(canReview(role)).toBe(false),
  )

  it('el rol legacy "reviewer" ya no existe y no puede revisar', () => {
    expect(canReview('reviewer')).toBe(false)
  })

  it.each(EDGE_CASES)('valor "%s" no puede revisar', (v) => {
    expect(canReview(v)).toBe(false)
  })
})

// ── canSendToCrm ──────────────────────────────────────────────────────────────

describe('canSendToCrm', () => {
  it.each([USER_ROLE.pm, USER_ROLE.admin])(
    '"%s" puede enviar al CRM',
    (role) => expect(canSendToCrm(role)).toBe(true),
  )

  it.each([USER_ROLE.redactor, USER_ROLE.coordinador])(
    '"%s" NO puede enviar al CRM',
    (role) => expect(canSendToCrm(role)).toBe(false),
  )

  it.each(EDGE_CASES)('valor "%s" no puede enviar al CRM', (v) => {
    expect(canSendToCrm(v)).toBe(false)
  })
})

// ── Consistencia del enum ─────────────────────────────────────────────────────

describe('USER_ROLE', () => {
  it('contiene exactamente los 4 roles definidos', () => {
    expect(Object.keys(USER_ROLE)).toEqual(['redactor', 'coordinador', 'pm', 'admin'])
  })

  it('reviewer no existe en USER_ROLE', () => {
    expect('reviewer' in USER_ROLE).toBe(false)
  })

  it('author no existe en USER_ROLE', () => {
    expect('author' in USER_ROLE).toBe(false)
  })
})
