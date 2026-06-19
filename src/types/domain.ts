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

export const GENERATION_MODE = {
  standard: 'standard',
  ab_test:  'ab_test',
} as const
export type GenerationMode = (typeof GENERATION_MODE)[keyof typeof GENERATION_MODE]

export const USER_ROLE = {
  redactor:     'redactor',     // Redactor: crea y trabaja sus propios briefs
  coordinador:  'coordinador',  // Jefe de redacción: igual que redactor + dashboard global
  pm:           'pm',           // PM: revisa, valida/rechaza y envía a CRM. No crea briefs.
  admin:        'admin',        // Admin: todos los permisos
} as const
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE]

// ── Helpers de permisos ───────────────────────────────────────────────────────

export function isAdmin(role: string | undefined | null): boolean {
  return role === USER_ROLE.admin
}

/** Puede crear briefs y generar/refinar mensajes. */
export function canCreateBriefs(role: string | undefined | null): boolean {
  return role === USER_ROLE.redactor || role === USER_ROLE.coordinador || isAdmin(role)
}

/** Puede ver todos los briefs (no solo los propios). */
export function canSeeAllBriefs(role: string | undefined | null): boolean {
  return role === USER_ROLE.pm || role === USER_ROLE.coordinador || isAdmin(role)
}

/** Puede acceder al dashboard global. */
export function canAccessDashboard(role: string | undefined | null): boolean {
  return role === USER_ROLE.coordinador || isAdmin(role)
}

/** Puede usar el panel de revisión (validar/rechazar/notas). */
export function canReview(role: string | undefined | null): boolean {
  return role === USER_ROLE.pm || isAdmin(role)
}

/** Puede enviar a CRM. */
export function canSendToCrm(role: string | undefined | null): boolean {
  return role === USER_ROLE.pm || isAdmin(role)
}

/** Puede acceder al módulo de análisis y rendimiento comercial. */
export function canAccessAnalytics(role: string | undefined | null): boolean {
  return role === USER_ROLE.coordinador || isAdmin(role)
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface SendMetricsTotals {
  sentCount: number
  deliveredCount: number
  bouncedCount: number
  opensCount: number
  clicksCount: number
  leadsReactivated: number
  enrollments: number
  revenueReal: number
  revenueOfficial: number
}

export interface WeeklyDataPoint {
  label: string
  opens: number
  clicks: number
  enrollments: number
  revenue: number
}

export interface ChannelBreakdown {
  channel: string
  sentCount: number
  opensCount: number
  clicksCount: number
  enrollments: number
}

export interface ProgramBreakdown {
  program: string
  enrollments: number
  revenueReal: number
  revenueOfficial: number
}

export const REVIEW_STATUS = {
  pending:   'pending',    // Borrador — autor trabajando
  submitted: 'submitted',  // Enviado a revisión por el autor
  approved:  'approved',   // Aprobado por PM
  rejected:  'rejected',   // Rechazado por PM
} as const
export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS]

export const EMAIL_TEMPLATE = {
  standard:    'standard',
  palancas:    'palancas',
  descuentos:  'descuentos',
  reminder:    'reminder',
  newsletter:  'newsletter',
} as const
export type EmailTemplate = (typeof EMAIL_TEMPLATE)[keyof typeof EMAIL_TEMPLATE]

export const EMAIL_TEMPLATE_LABELS: Record<string, string> = {
  standard:    'Email informativo',
  palancas:    'Email de palancas',
  descuentos:  'Email de descuentos',
  reminder:    'Email recordatorio',
  newsletter:  'Newsletter de sector',
}

export const EMAIL_TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  standard:    'Presentación de programa, novedades o comunicados.',
  palancas:    'Beneficio no económico como argumento central.',
  descuentos:  'Oferta económica: beca, precio especial o plazo.',
  reminder:    'Seguimiento, fechas límite o reactivación.',
  newsletter:  'Noticias y tendencias del sector del lead.',
}

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

/** Puede ver y usar la base de datos de títulos. */
export function canViewPrograms(role: string | undefined | null): boolean {
  return role != null && Object.values(USER_ROLE).includes(role as UserRole)
}

/** Puede crear, editar y eliminar títulos. */
export function canManagePrograms(role: string | undefined | null): boolean {
  return role === USER_ROLE.coordinador || isAdmin(role)
}

// ── Program ───────────────────────────────────────────────────────────────────

export interface Program {
  id: string
  // Información comercial
  name: string
  school: string
  officialPrice: number | null
  currentPromoPrice: number | null
  activeDiscount: number | null
  discountValidFrom: Date | null
  discountValidTo: Date | null
  enrollmentsTotal: number
  revenueTotal: number
  associatedCampaigns: string | null
  conversionRate: number | null
  bestChannel: string | null
  lastCampaign: string | null
  // Información académica
  duration: string | null
  credits: number | null
  modality: string | null
  convocationStart: string | null
  subjectsOrModules: string | null
  mainFocuses: string | null
  careerOutcomes: string | null
  targetProfile: string | null
  valueProposition: string | null
  mainCommercialArgs: string | null
  validatedClaims: string | null
  restrictions: string | null
  // Información para IA
  bestMessages: string | null
  bestCtas: string | null
  winningApproaches: string | null
  successCasesAi: string | null
  futureRecommendations: string | null
  teamObservations: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateProgramInput {
  name: string
  school: string
  officialPrice?: number
  currentPromoPrice?: number
  activeDiscount?: number
  discountValidFrom?: Date
  discountValidTo?: Date
  enrollmentsTotal?: number
  revenueTotal?: number
  associatedCampaigns?: string
  conversionRate?: number
  bestChannel?: string
  lastCampaign?: string
  duration?: string
  credits?: number
  modality?: string
  convocationStart?: string
  subjectsOrModules?: string
  mainFocuses?: string
  careerOutcomes?: string
  targetProfile?: string
  valueProposition?: string
  mainCommercialArgs?: string
  validatedClaims?: string
  restrictions?: string
  bestMessages?: string
  bestCtas?: string
  winningApproaches?: string
  successCasesAi?: string
  futureRecommendations?: string
  teamObservations?: string
}

export type UpdateProgramInput = Partial<CreateProgramInput>

// ── DTOs de salida del LLM ────────────────────────────────────────────────────

export interface GeneratedMessage {
  body: string
  emailSubject?: string
  emailPreheader?: string
}

// ── DTOs de entrada (usados por los DAOs) ────────────────────────────────────

export interface CreateBriefInput {
  userId: string
  title: string
  programOrTitulation?: string
  programId?: string
  objective: string
  audience: string
  channel: Channel
  mode: Mode
  generationMode?: GenerationMode
  valueProposition: string
  cta: string
  constraints?: string
  emailTemplate?: EmailTemplate
}

export interface CreateMessageVersionInput {
  briefId: string
  versionNumber: number
  content: string
  emailSubject?: string
  emailPreheader?: string
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
