import type { GenerationClient, ValidationClient } from '../../types/llm'
import { OpenAIGenerationClient, OpenAIValidationClient } from './client'
import { MockGenerationClient, MockValidationClient } from './mockClient'

export function getGenerationClient(): GenerationClient {
  if (process.env.LLM_MOCK === 'true') {
    return new MockGenerationClient()
  }
  return new OpenAIGenerationClient()
}

export function getValidationClient(): ValidationClient {
  if (process.env.LLM_MOCK === 'true') {
    return new MockValidationClient()
  }
  return new OpenAIValidationClient()
}
