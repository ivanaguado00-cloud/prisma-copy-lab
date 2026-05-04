import type { GenerationClient, ValidationClient } from '../../types/llm'

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

const MOCK_VALIDATION_RESPONSE = JSON.stringify({
  scores: [
    {
      criterionKey: 'alineacion_estrategica',
      status: 'bien',
      comment: 'El mensaje responde con claridad al objetivo declarado y está correctamente enfocado al segmento.',
      suggestedFix: null,
    },
    {
      criterionKey: 'claridad_estructura',
      status: 'mejorable',
      comment: 'La idea principal se comprende, pero hay una frase larga en el cuerpo que podría simplificarse.',
      suggestedFix: 'Dividir la frase larga en dos oraciones más cortas para facilitar la lectura.',
    },
    {
      criterionKey: 'tono_coherencia_marca',
      status: 'bien',
      comment: 'El tono es cercano, profesional e institucional. Reconocible como Universidad Prisma.',
      suggestedFix: null,
    },
    {
      criterionKey: 'calidad_argumental',
      status: 'bien',
      comment: 'La propuesta de valor es visible y el beneficio principal está priorizado.',
      suggestedFix: null,
    },
    {
      criterionKey: 'adaptacion_canal',
      status: 'mejorable',
      comment: 'La longitud es adecuada pero la CTA podría ser más directa para el canal.',
      suggestedFix: 'Reformular la CTA para que sea más concisa y accionable en este canal.',
    },
    {
      criterionKey: 'precision_fiabilidad',
      status: 'bien',
      comment: 'No se detectan datos dudosos, promesas no verificables ni información inventada.',
      suggestedFix: null,
    },
    {
      criterionKey: 'calidad_ejecucion',
      status: 'bien',
      comment: 'El texto fluye con naturalidad. Sin errores ortográficos ni gramaticales detectables.',
      suggestedFix: null,
    },
  ],
  summary:
    'La pieza es sólida en estrategia, tono y ejecución. Hay mejoras menores en claridad de estructura y formulación de la CTA que conviene atender antes de activar.',
  suggestedRewrite:
    'Versión ajustada sugerida: [El mock no genera reescritura real. Activa LLM_MOCK=false para obtener una reescritura del modelo.]',
})

export class MockValidationClient implements ValidationClient {
  async validate(_systemPrompt: string, _userPrompt: string): Promise<string> {
    return MOCK_VALIDATION_RESPONSE
  }
}
