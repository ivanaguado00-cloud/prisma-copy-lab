import OpenAI from 'openai'
import type { GenerationClient, ValidationClient } from '../../types/llm'
import type { GeneratedMessage } from '../../types/domain'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

export class OpenAIGenerationClient implements GenerationClient {
  async generate(
    systemPrompt: string,
    userPrompt: string,
    options?: { jsonOutput?: boolean },
  ): Promise<GeneratedMessage> {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      ...(options?.jsonOutput ? { response_format: { type: 'json_object' as const } } : {}),
    })

    const raw = response.choices[0]?.message?.content
    if (!raw) {
      throw new Error('El modelo no devolvió contenido')
    }

    if (options?.jsonOutput) {
      const parsed = JSON.parse(raw)
      return {
        body: typeof parsed.body === 'string' ? parsed.body.trim() : '',
        emailSubject: typeof parsed.emailSubject === 'string' ? parsed.emailSubject.trim() || undefined : undefined,
        emailPreheader: typeof parsed.emailPreheader === 'string' ? parsed.emailPreheader.trim() || undefined : undefined,
      }
    }

    return { body: raw }
  }
}

export class OpenAIValidationClient implements ValidationClient {
  async validate(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await openai.chat.completions.create({
      model,
      temperature: 0.0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('El modelo no devolvió contenido en la validación')
    }
    return content
  }
}

export function getModel(): string {
  return model
}
