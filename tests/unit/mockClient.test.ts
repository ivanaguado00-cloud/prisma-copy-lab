import { describe, expect, it } from 'vitest'
import { MockGenerationClient } from '../../src/services/llm/mockClient'

describe('MockGenerationClient', () => {
  it('devuelve email estructurado cuando se solicita salida JSON', async () => {
    const client = new MockGenerationClient()

    const result = await client.generate(
      'Genera emails comerciales.',
      'Genera un email comercial para una campaña de MBA.',
      { jsonOutput: true },
    )

    expect(result.body).toContain('{{titulacion}}')
    expect(result.emailSubject).toBeTruthy()
    expect(result.emailPreheader).toBeTruthy()
  })

  it('mantiene la detección de email por canal para compatibilidad', async () => {
    const client = new MockGenerationClient()

    const result = await client.generate('Sistema', 'canal: email')

    expect(result.emailSubject).toBeTruthy()
    expect(result.emailPreheader).toBeTruthy()
  })

  it('mantiene la respuesta específica de WhatsApp', async () => {
    const client = new MockGenerationClient()

    const result = await client.generate('Sistema', 'canal: whatsapp')

    expect(result.body).toContain('{{cta_url}}')
    expect(result.emailSubject).toBeUndefined()
    expect(result.emailPreheader).toBeUndefined()
  })
})
