// ── Enums ────────────────────────────────────────────────────────────────────

export const CHANNEL = {
  whatsapp: 'whatsapp',
  email: 'email',
} as const
export type Channel = (typeof CHANNEL)[keyof typeof CHANNEL]

export const MODE = {
  produccion: 'produccion',
  exploracion: 'exploracion',
} as const
export type Mode = (typeof MODE)[keyof typeof MODE]

export const USER_ROLE = {
  author:   'author',
  reviewer: 'reviewer',
} as const
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE]

export const REVIEW_STATUS = {
  pending:  'pending',
  approved: 'approved',
  rejected: 'rejected',
} as const
export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS]

export const CRM_STATUS = {
  ready_for_crm: 'ready_for_crm',
  sent_to_crm: 'sent_to_crm',
} as const
export type CrmStatus = (typeof CRM_STATUS)[keyof typeof CRM_STATUS]

export const OVERALL_VERDICT = {
  aprobada: 'aprobada',
  aprobada_con_ajustes: 'aprobada_con_ajustes',
  no_aprobada: 'no_aprobada',
} as const
export type OverallVerdict = (typeof OVERALL_VERDICT)[keyof typeof OVERALL_VERDICT]

export const SCORE_STATUS = {
  bien: 'bien',
  mejorable: 'mejorable',
  critico: 'critico',
} as const
export type ScoreStatus = (typeof SCORE_STATUS)[keyof typeof SCORE_STATUS]

export const CRITERION_KEY = {
  alineacion_estrategica: 'alineacion_estrategica',
  claridad_estructura: 'claridad_estructura',
  tono_coherencia_marca: 'tono_coherencia_marca',
  calidad_argumental: 'calidad_argumental',
  adaptacion_canal: 'adaptacion_canal',
  precision_fiabilidad: 'precision_fiabilidad',
  calidad_ejecucion: 'calidad_ejecucion',
} as const
export type CriterionKey = (typeof CRITERION_KEY)[keyof typeof CRITERION_KEY]

// ── DTOs de entrada (usados por los DAOs) ────────────────────────────────────

export interface CreateBriefInput {
  userId: string
  title: string
  programOrTitulation?: string
  objective: string
  audience: string
  channel: Channel
  mode: Mode
  valueProposition: string
  cta: string
  constraints?: string
}

export interface CreateMessageVersionInput {
  briefId: string
  versionNumber: number
  content: string
  llmProvider: string
  llmModel: string
  generationPromptVersion: string
  userInstruction?: string
  parentVersionId?: string
}

export interface CreateValidationRunInput {
  messageVersionId: string
  overallVerdict: OverallVerdict
  summary: string
  suggestedRewrite?: string
  validatorModel: string
  validatorPromptVersion: string
  criteriaVersion: string
}

export interface CreateValidationScoreInput {
  validationRunId: string
  criterionKey: CriterionKey
  criterionName: string
  status: ScoreStatus
  comment: string
  suggestedFix?: string
}
