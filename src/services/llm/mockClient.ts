import type { GenerationClient, ValidationClient } from '../../types/llm'
import type { GeneratedMessage } from '../../types/domain'

const MOCK_RESPONSES: Record<string, GeneratedMessage> = {
  whatsapp: {
    body: 'Hola {{nombre}}, ¿sabías que puedes especializarte en {{titulacion}} sin pausar tu carrera? En Prisma lo hacemos posible. 👉 {{cta_url}}',
  },
  email: {
    body: 'Hola {{nombre}},\n\nSabemos que compaginar trabajo y formación no siempre es fácil. Por eso en Universidad Prisma hemos diseñado {{titulacion}}, un programa 100% online que se adapta a tu ritmo.\n\nAccede a contenido actualizado, tutores especializados y una red de alumni que ya están transformando su carrera.\n\n¿Listo para dar el siguiente paso? Solicita información sin compromiso en {{cta_url}}.\n\nUn saludo,\nEl equipo de Universidad Prisma',
    emailSubject: 'Tu próximo paso en {{titulacion}} empieza aquí',
    emailPreheader: 'Formación online que se adapta a ti, sin pausar tu carrera.',
  },
}

const DEFAULT_MOCK: GeneratedMessage = {
  body: 'Este es un mensaje de prueba generado por el cliente mock de Universidad Prisma. Activa LLM_MOCK=false para usar el modelo real.',
}

export class MockGenerationClient implements GenerationClient {
  async generate(_systemPrompt: string, userPrompt: string): Promise<GeneratedMessage> {
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
  async validate(): Promise<string> {
    return MOCK_VALIDATION_RESPONSE
  }
}
