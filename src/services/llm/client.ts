import OpenAI from 'openai'
import type { GenerationClient } from '../../types/llm'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

export class OpenAIGenerationClient implements GenerationClient {
  async generate(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('El modelo no devolvió contenido')
    }
    return content
  }
}

export function getModel(): string {
  return model
}
