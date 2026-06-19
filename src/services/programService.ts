import {
  CreateProgramInput,
  UpdateProgramInput,
} from '../types/domain'
import {
  createProgram,
  getProgramById,
  listPrograms,
  listProgramsBySchool,
  updateProgram,
  deleteProgramById,
} from '../dao/programDao'

// ── Validation ────────────────────────────────────────────────────────────────

export interface ProgramValidationErrors {
  name?: string
  school?: string
}

function validateProgramInput(input: { name?: string; school?: string }): ProgramValidationErrors {
  const errors: ProgramValidationErrors = {}
  if (!input.name?.trim()) errors.name = 'El nombre del título es obligatorio.'
  if (!input.school?.trim()) errors.school = 'La escuela o vertical es obligatoria.'
  return errors
}

function normalizeOptionalString(value: string | undefined | null): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

// ── Public service API ────────────────────────────────────────────────────────

export type CreateProgramResult =
  | { success: true; programId: string }
  | { success: false; errors: ProgramValidationErrors }

export async function createProgramRecord(raw: {
  name?: string
  school?: string
  officialPrice?: string
  currentPromoPrice?: string
  activeDiscount?: string
  discountValidFrom?: string
  discountValidTo?: string
  enrollmentsTotal?: string
  revenueTotal?: string
  associatedCampaigns?: string
  conversionRate?: string
  bestChannel?: string
  lastCampaign?: string
  duration?: string
  credits?: string
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
}): Promise<CreateProgramResult> {
  const errors = validateProgramInput(raw)
  if (Object.keys(errors).length > 0) return { success: false, errors }

  const input: CreateProgramInput = {
    name:   raw.name!.trim(),
    school: raw.school!.trim(),
    officialPrice:     parseOptionalFloat(raw.officialPrice),
    currentPromoPrice: parseOptionalFloat(raw.currentPromoPrice),
    activeDiscount:    parseOptionalFloat(raw.activeDiscount),
    discountValidFrom: parseOptionalDate(raw.discountValidFrom),
    discountValidTo:   parseOptionalDate(raw.discountValidTo),
    enrollmentsTotal:  parseOptionalInt(raw.enrollmentsTotal) ?? 0,
    revenueTotal:      parseOptionalFloat(raw.revenueTotal) ?? 0,
    conversionRate:    parseOptionalFloat(raw.conversionRate),
    credits:           parseOptionalInt(raw.credits),
    associatedCampaigns:   normalizeOptionalString(raw.associatedCampaigns),
    bestChannel:           normalizeOptionalString(raw.bestChannel),
    lastCampaign:          normalizeOptionalString(raw.lastCampaign),
    duration:              normalizeOptionalString(raw.duration),
    modality:              normalizeOptionalString(raw.modality),
    convocationStart:      normalizeOptionalString(raw.convocationStart),
    subjectsOrModules:     normalizeOptionalString(raw.subjectsOrModules),
    mainFocuses:           normalizeOptionalString(raw.mainFocuses),
    careerOutcomes:        normalizeOptionalString(raw.careerOutcomes),
    targetProfile:         normalizeOptionalString(raw.targetProfile),
    valueProposition:      normalizeOptionalString(raw.valueProposition),
    mainCommercialArgs:    normalizeOptionalString(raw.mainCommercialArgs),
    validatedClaims:       normalizeOptionalString(raw.validatedClaims),
    restrictions:          normalizeOptionalString(raw.restrictions),
    bestMessages:          normalizeOptionalString(raw.bestMessages),
    bestCtas:              normalizeOptionalString(raw.bestCtas),
    winningApproaches:     normalizeOptionalString(raw.winningApproaches),
    successCasesAi:        normalizeOptionalString(raw.successCasesAi),
    futureRecommendations: normalizeOptionalString(raw.futureRecommendations),
    teamObservations:      normalizeOptionalString(raw.teamObservations),
  }

  const program = await createProgram(input)
  return { success: true, programId: program.id }
}

export type UpdateProgramResult =
  | { success: true }
  | { success: false; errors: ProgramValidationErrors }

export async function updateProgramRecord(
  id: string,
  raw: Parameters<typeof createProgramRecord>[0],
): Promise<UpdateProgramResult> {
  const errors = validateProgramInput(raw)
  if (Object.keys(errors).length > 0) return { success: false, errors }

  const input: UpdateProgramInput = {
    name:   raw.name!.trim(),
    school: raw.school!.trim(),
    officialPrice:     parseOptionalFloat(raw.officialPrice),
    currentPromoPrice: parseOptionalFloat(raw.currentPromoPrice),
    activeDiscount:    parseOptionalFloat(raw.activeDiscount),
    discountValidFrom: parseOptionalDate(raw.discountValidFrom),
    discountValidTo:   parseOptionalDate(raw.discountValidTo),
    enrollmentsTotal:  parseOptionalInt(raw.enrollmentsTotal) ?? 0,
    revenueTotal:      parseOptionalFloat(raw.revenueTotal) ?? 0,
    conversionRate:    parseOptionalFloat(raw.conversionRate),
    credits:           parseOptionalInt(raw.credits),
    associatedCampaigns:   normalizeOptionalString(raw.associatedCampaigns),
    bestChannel:           normalizeOptionalString(raw.bestChannel),
    lastCampaign:          normalizeOptionalString(raw.lastCampaign),
    duration:              normalizeOptionalString(raw.duration),
    modality:              normalizeOptionalString(raw.modality),
    convocationStart:      normalizeOptionalString(raw.convocationStart),
    subjectsOrModules:     normalizeOptionalString(raw.subjectsOrModules),
    mainFocuses:           normalizeOptionalString(raw.mainFocuses),
    careerOutcomes:        normalizeOptionalString(raw.careerOutcomes),
    targetProfile:         normalizeOptionalString(raw.targetProfile),
    valueProposition:      normalizeOptionalString(raw.valueProposition),
    mainCommercialArgs:    normalizeOptionalString(raw.mainCommercialArgs),
    validatedClaims:       normalizeOptionalString(raw.validatedClaims),
    restrictions:          normalizeOptionalString(raw.restrictions),
    bestMessages:          normalizeOptionalString(raw.bestMessages),
    bestCtas:              normalizeOptionalString(raw.bestCtas),
    winningApproaches:     normalizeOptionalString(raw.winningApproaches),
    successCasesAi:        normalizeOptionalString(raw.successCasesAi),
    futureRecommendations: normalizeOptionalString(raw.futureRecommendations),
    teamObservations:      normalizeOptionalString(raw.teamObservations),
  }

  await updateProgram(id, input)
  return { success: true }
}

export { getProgramById, listPrograms, listProgramsBySchool, deleteProgramById }

// ── Parse helpers ─────────────────────────────────────────────────────────────

function parseOptionalFloat(value: string | undefined): number | undefined {
  if (!value || value.trim() === '') return undefined
  const n = parseFloat(value.replace(',', '.'))
  return isNaN(n) ? undefined : n
}

function parseOptionalInt(value: string | undefined): number | undefined {
  if (!value || value.trim() === '') return undefined
  const n = parseInt(value, 10)
  return isNaN(n) ? undefined : n
}

function parseOptionalDate(value: string | undefined): Date | undefined {
  if (!value || value.trim() === '') return undefined
  const d = new Date(value)
  return isNaN(d.getTime()) ? undefined : d
}
