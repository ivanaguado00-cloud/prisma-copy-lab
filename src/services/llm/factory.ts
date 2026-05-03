import type { GenerationClient } from '../../types/llm'
import { OpenAIGenerationClient } from './client'
import { MockGenerationClient } from './mockClient'

export function getGenerationClient(): GenerationClient {
  if (process.env.LLM_MOCK === 'true') {
    return new MockGenerationClient()
  }
  return new OpenAIGenerationClient()
}
