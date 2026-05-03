import type { GenerationClient } from '../../types/llm'

const MOCK_RESPONSES: Record<string, string> = {
  whatsapp:
    'Hola, ¿sabías que puedes especializarte sin pausar tu carrera? En Prisma lo hacemos posible. ¿Hablamos? 👉 prisma.edu/info',
  email: `Asunto: Tu próximo paso profesional empieza aquí

Hola,

Sabemos que compaginar trabajo y formación no siempre es fácil. Por eso en Universidad Prisma diseñamos programas 100% online que se adaptan a tu ritmo.

Accede a contenido actualizado, tutores especializados y una red de alumni que ya están transformando su carrera.

¿Listo para dar el siguiente paso? Solicita información sin compromiso.

Un saludo,
El equipo de Universidad Prisma`,
}

const DEFAULT_MOCK =
  'Este es un mensaje de prueba generado por el cliente mock de Universidad Prisma. Activa LLM_MOCK=false para usar el modelo real.'

export class MockGenerationClient implements GenerationClient {
  async generate(_systemPrompt: string, userPrompt: string): Promise<string> {
    if (userPrompt.includes('canal: whatsapp')) {
      return MOCK_RESPONSES.whatsapp!
    }
    if (userPrompt.includes('canal: email')) {
      return MOCK_RESPONSES.email!
    }
    return DEFAULT_MOCK
  }
}
