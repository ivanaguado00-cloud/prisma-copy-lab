export interface GenerationClient {
  generate(systemPrompt: string, userPrompt: string): Promise<string>
}

export interface ValidationClient {
  validate(systemPrompt: string, userPrompt: string): Promise<string>
}

export const GENERATION_PROMPT_VERSION = 'v1.1'
export const VALIDATOR_PROMPT_VERSION = 'v1.0'
