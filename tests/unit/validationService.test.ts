import { describe, it, expect } from 'vitest'
import { calculateOverallVerdict, parseValidatorResponse } from '../../src/services/validationService'
import type { CriterionKey, ScoreStatus } from '../../src/types/domain'

// ── Helpers ───────────────────────────────────────────────────────────────────

type ScoreStub = { criterionKey: CriterionKey; status: ScoreStatus }

const CRITERION_KEYS: CriterionKey[] = [
  'alineacion_estrategica',
  'claridad_estructura',
  'tono_coherencia_marca',
  'calidad_argumental',
  'adaptacion_canal',
  'precision_fiabilidad',
  'calidad_ejecucion',
]

function makeScores(statuses: ScoreStatus[]): ScoreStub[] {
  return CRITERION_KEYS.map((key, i) => ({
    criterionKey: key,
    status: statuses[i] ?? 'bien',
  }))
}

function allBien(): ScoreStub[] {
  return makeScores(['bien', 'bien', 'bien', 'bien', 'bien', 'bien', 'bien'])
}

function makeValidJson(overrides: Partial<Record<CriterionKey, Partial<{ status: string; comment: string; suggestedFix: string | null }>>> = {}): string {
  const scores = CRITERION_KEYS.map((key) => ({
    criterionKey: key,
    status: overrides[key]?.status ?? 'bien',
    comment: overrides[key]?.comment ?? `Comentario para ${key}.`,
    suggestedFix: overrides[key]?.suggestedFix !== undefined ? overrides[key]!.suggestedFix : null,
  }))
  return JSON.stringify({
    scores,
    summary: 'Resumen de prueba.',
    suggestedRewrite: null,
  })
}

// ── calculateOverallVerdict ───────────────────────────────────────────────────

describe('calculateOverallVerdict — rama aprobada', () => {
  it('todos bien → aprobada', () => {
    expect(calculateOverallVerdict(allBien())).toBe('aprobada')
  })

  it('1 mejorable, 0 critico → aprobada', () => {
    const scores = makeScores(['mejorable', 'bien', 'bien', 'bien', 'bien', 'bien', 'bien'])
    expect(calculateOverallVerdict(scores)).toBe('aprobada')
  })

  it('0 scores (vacío) → aprobada por defecto', () => {
    expect(calculateOverallVerdict([])).toBe('aprobada')
  })
})

describe('calculateOverallVerdict — rama aprobada_con_ajustes', () => {
  it('2 mejorables, 0 critico → aprobada_con_ajustes', () => {
    const scores = makeScores(['mejorable', 'mejorable', 'bien', 'bien', 'bien', 'bien', 'bien'])
    expect(calculateOverallVerdict(scores)).toBe('aprobada_con_ajustes')
  })

  it('3 mejorables, 0 critico → aprobada_con_ajustes', () => {
    const scores = makeScores(['mejorable', 'mejorable', 'mejorable', 'bien', 'bien', 'bien', 'bien'])
    expect(calculateOverallVerdict(scores)).toBe('aprobada_con_ajustes')
  })

  it('7 mejorables, 0 critico → aprobada_con_ajustes', () => {
    const scores = makeScores(['mejorable', 'mejorable', 'mejorable', 'mejorable', 'mejorable', 'mejorable', 'mejorable'])
    expect(calculateOverallVerdict(scores)).toBe('aprobada_con_ajustes')
  })
})

describe('calculateOverallVerdict — rama no_aprobada', () => {
  it('1 critico, resto bien → no_aprobada', () => {
    const scores = makeScores(['critico', 'bien', 'bien', 'bien', 'bien', 'bien', 'bien'])
    expect(calculateOverallVerdict(scores)).toBe('no_aprobada')
  })

  it('1 critico, 1 mejorable, resto bien → no_aprobada', () => {
    const scores = makeScores(['critico', 'mejorable', 'bien', 'bien', 'bien', 'bien', 'bien'])
    expect(calculateOverallVerdict(scores)).toBe('no_aprobada')
  })

  it('1 critico aunque el resto sean mejorables → no_aprobada', () => {
    const scores = makeScores(['critico', 'mejorable', 'mejorable', 'mejorable', 'mejorable', 'mejorable', 'mejorable'])
    expect(calculateOverallVerdict(scores)).toBe('no_aprobada')
  })

  it('7 criticos → no_aprobada', () => {
    const scores = makeScores(['critico', 'critico', 'critico', 'critico', 'critico', 'critico', 'critico'])
    expect(calculateOverallVerdict(scores)).toBe('no_aprobada')
  })
})

// ── parseValidatorResponse — respuesta válida ─────────────────────────────────

describe('parseValidatorResponse — respuesta válida', () => {
  it('parsea correctamente un JSON válido con 7 scores', () => {
    const json = makeValidJson()
    const result = parseValidatorResponse(json)
    expect(result.scores).toHaveLength(7)
    expect(result.scores[0]!.criterionKey).toBe('alineacion_estrategica')
    expect(result.scores[0]!.status).toBe('bien')
    expect(result.summary).toBe('Resumen de prueba.')
    expect(result.suggestedRewrite).toBeNull()
  })

  it('preserva suggestedFix cuando está presente', () => {
    const json = makeValidJson({
      claridad_estructura: { status: 'mejorable', suggestedFix: 'Acortar la frase central.' },
    })
    const result = parseValidatorResponse(json)
    const score = result.scores.find((s) => s.criterionKey === 'claridad_estructura')!
    expect(score.suggestedFix).toBe('Acortar la frase central.')
  })

  it('acepta suggestedRewrite cuando está presente', () => {
    const json = JSON.stringify({
      scores: CRITERION_KEYS.map((key) => ({
        criterionKey: key,
        status: 'bien',
        comment: 'Bien.',
        suggestedFix: null,
      })),
      summary: 'Ok.',
      suggestedRewrite: 'Hola, esta es la reescritura sugerida.',
    })
    const result = parseValidatorResponse(json)
    expect(result.suggestedRewrite).toBe('Hola, esta es la reescritura sugerida.')
  })

  it('acepta scores en orden distinto al canónico', () => {
    const shuffledKeys = [...CRITERION_KEYS].reverse()
    const json = JSON.stringify({
      scores: shuffledKeys.map((key) => ({
        criterionKey: key,
        status: 'bien',
        comment: `Comentario para ${key}.`,
        suggestedFix: null,
      })),
      summary: 'Ok.',
      suggestedRewrite: null,
    })
    const result = parseValidatorResponse(json)
    expect(result.scores).toHaveLength(7)
  })
})

// ── parseValidatorResponse — rechazos ─────────────────────────────────────────

describe('parseValidatorResponse — rechaza JSON inválido', () => {
  it('lanza error si no es JSON', () => {
    expect(() => parseValidatorResponse('esto no es json')).toThrow()
  })

  it('lanza error si el JSON es un array en lugar de objeto', () => {
    expect(() => parseValidatorResponse('[]')).toThrow()
  })

  it('lanza error si falta el campo scores', () => {
    expect(() => parseValidatorResponse(JSON.stringify({ summary: 'ok' }))).toThrow()
  })
})

describe('parseValidatorResponse — rechaza scores incompletos o incorrectos', () => {
  it('lanza error si hay menos de 7 scores', () => {
    const json = JSON.stringify({
      scores: CRITERION_KEYS.slice(0, 6).map((key) => ({
        criterionKey: key,
        status: 'bien',
        comment: 'ok',
        suggestedFix: null,
      })),
      summary: 'ok',
      suggestedRewrite: null,
    })
    expect(() => parseValidatorResponse(json)).toThrow(/6.*score|score.*6/i)
  })

  it('lanza error si hay más de 7 scores', () => {
    const extra = [
      ...CRITERION_KEYS,
      'alineacion_estrategica',
    ]
    const json = JSON.stringify({
      scores: extra.map((key) => ({
        criterionKey: key,
        status: 'bien',
        comment: 'ok',
        suggestedFix: null,
      })),
      summary: 'ok',
      suggestedRewrite: null,
    })
    expect(() => parseValidatorResponse(json)).toThrow(/8.*score|score.*8/i)
  })

  it('lanza error si hay un criterionKey renombrado ("alineacion" en vez de "alineacion_estrategica")', () => {
    const json = JSON.stringify({
      scores: [
        { criterionKey: 'alineacion', status: 'bien', comment: 'ok', suggestedFix: null },
        ...CRITERION_KEYS.slice(1).map((key) => ({
          criterionKey: key,
          status: 'bien',
          comment: 'ok',
          suggestedFix: null,
        })),
      ],
      summary: 'ok',
      suggestedRewrite: null,
    })
    expect(() => parseValidatorResponse(json)).toThrow(/criterionKey.*inválido|inválido.*criterionKey/i)
  })

  it('lanza error si hay un criterionKey duplicado', () => {
    const withDuplicate = [
      ...CRITERION_KEYS.slice(0, 6),
      CRITERION_KEYS[0]!,
    ]
    const json = JSON.stringify({
      scores: withDuplicate.map((key) => ({
        criterionKey: key,
        status: 'bien',
        comment: 'ok',
        suggestedFix: null,
      })),
      summary: 'ok',
      suggestedRewrite: null,
    })
    expect(() => parseValidatorResponse(json)).toThrow(/duplicado/i)
  })

  it('lanza error si un status está fuera de los permitidos ("bueno" en vez de "bien")', () => {
    const json = JSON.stringify({
      scores: CRITERION_KEYS.map((key, i) => ({
        criterionKey: key,
        status: i === 0 ? 'bueno' : 'bien',
        comment: 'ok',
        suggestedFix: null,
      })),
      summary: 'ok',
      suggestedRewrite: null,
    })
    expect(() => parseValidatorResponse(json)).toThrow(/status.*inválido|inválido.*status/i)
  })

  it('lanza error si un comment está vacío', () => {
    const json = JSON.stringify({
      scores: CRITERION_KEYS.map((key, i) => ({
        criterionKey: key,
        status: 'bien',
        comment: i === 0 ? '' : 'ok',
        suggestedFix: null,
      })),
      summary: 'ok',
      suggestedRewrite: null,
    })
    expect(() => parseValidatorResponse(json)).toThrow(/comment/i)
  })

  it('lanza error si suggestedFix no es string ni null', () => {
    const json = JSON.stringify({
      scores: CRITERION_KEYS.map((key, i) => ({
        criterionKey: key,
        status: 'bien',
        comment: 'ok',
        suggestedFix: i === 0 ? 42 : null,
      })),
      summary: 'ok',
      suggestedRewrite: null,
    })
    expect(() => parseValidatorResponse(json)).toThrow(/suggestedFix/i)
  })
})
