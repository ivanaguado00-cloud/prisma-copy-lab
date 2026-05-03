export interface GenerationClient {
  generate(systemPrompt: string, userPrompt: string): Promise<string>
}

export const GENERATION_PROMPT_VERSION = 'v1.0'
