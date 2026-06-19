import { describe, it, expect } from 'vitest'
import { getBriefListStatusMeta } from '../../src/lib/briefStatusDisplay'

describe('getBriefListStatusMeta — brief aprobado', () => {
  it('muestra "Equipo CRM" cuando crmStatus es sent_to_crm', () => {
    const meta = getBriefListStatusMeta('approved', 'sent_to_crm')
    expect(meta.responsable).toBe('Equipo CRM')
  })

  it('NO muestra "Equipo CRM" cuando crmStatus es null (aprobado pero no enviado)', () => {
    const meta = getBriefListStatusMeta('approved', null)
    expect(meta.responsable).not.toBe('Equipo CRM')
  })

  it('NO muestra "Equipo CRM" cuando crmStatus es undefined', () => {
    const meta = getBriefListStatusMeta('approved', undefined)
    expect(meta.responsable).not.toBe('Equipo CRM')
  })

  it('NO muestra "Equipo CRM" cuando crmStatus es ready_for_crm', () => {
    const meta = getBriefListStatusMeta('approved', 'ready_for_crm')
    expect(meta.responsable).not.toBe('Equipo CRM')
  })

  it('la etiqueta es "Aprobado" con crmStatus sent_to_crm', () => {
    expect(getBriefListStatusMeta('approved', 'sent_to_crm').label).toBe('Aprobado')
  })

  it('la etiqueta es "Aprobado" aunque crmStatus sea null', () => {
    expect(getBriefListStatusMeta('approved', null).label).toBe('Aprobado')
  })
})

describe('getBriefListStatusMeta — otros estados', () => {
  it('pending devuelve "Redactor" como responsable', () => {
    expect(getBriefListStatusMeta('pending', null).responsable).toBe('Redactor')
  })

  it('submitted devuelve "Product Manager" como responsable', () => {
    expect(getBriefListStatusMeta('submitted', null).responsable).toBe('Product Manager')
  })

  it('rejected devuelve "Redactor" como responsable', () => {
    expect(getBriefListStatusMeta('rejected', null).responsable).toBe('Redactor')
  })

  it('estado desconocido devuelve el fallback (pending)', () => {
    const meta = getBriefListStatusMeta('unknown_state', null)
    expect(meta.responsable).toBe('Redactor')
    expect(meta.label).toBe('Borrador')
  })
})
