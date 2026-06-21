'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { auth } from '../../auth'
import { canManagePrograms, canEditDiscount } from '../../types/domain'
import {
  createProgramRecord,
  updateProgramRecord,
  updateProgramDiscount,
  deleteProgramById,
} from '../../services/programService'

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractRawFields(formData: FormData) {
  return {
    name:                  formData.get('name') as string | undefined,
    school:                formData.get('school') as string | undefined,
    officialPrice:         formData.get('officialPrice') as string | undefined,
    currentPromoPrice:     formData.get('currentPromoPrice') as string | undefined,
    activeDiscount:        formData.get('activeDiscount') as string | undefined,
    discountValidFrom:     formData.get('discountValidFrom') as string | undefined,
    discountValidTo:       formData.get('discountValidTo') as string | undefined,
    enrollmentsTotal:      formData.get('enrollmentsTotal') as string | undefined,
    revenueTotal:          formData.get('revenueTotal') as string | undefined,
    associatedCampaigns:   formData.get('associatedCampaigns') as string | undefined,
    conversionRate:        formData.get('conversionRate') as string | undefined,
    bestChannel:           formData.get('bestChannel') as string | undefined,
    lastCampaign:          formData.get('lastCampaign') as string | undefined,
    duration:              formData.get('duration') as string | undefined,
    credits:               formData.get('credits') as string | undefined,
    modality:              formData.get('modality') as string | undefined,
    convocationStart:      formData.get('convocationStart') as string | undefined,
    subjectsOrModules:     formData.get('subjectsOrModules') as string | undefined,
    mainFocuses:           formData.get('mainFocuses') as string | undefined,
    careerOutcomes:        formData.get('careerOutcomes') as string | undefined,
    targetProfile:         formData.get('targetProfile') as string | undefined,
    valueProposition:      formData.get('valueProposition') as string | undefined,
    mainCommercialArgs:    formData.get('mainCommercialArgs') as string | undefined,
    validatedClaims:       formData.get('validatedClaims') as string | undefined,
    restrictions:          formData.get('restrictions') as string | undefined,
    bestMessages:          formData.get('bestMessages') as string | undefined,
    bestCtas:              formData.get('bestCtas') as string | undefined,
    winningApproaches:     formData.get('winningApproaches') as string | undefined,
    successCasesAi:        formData.get('successCasesAi') as string | undefined,
    futureRecommendations: formData.get('futureRecommendations') as string | undefined,
    teamObservations:      formData.get('teamObservations') as string | undefined,
  }
}

// ── Actions ───────────────────────────────────────────────────────────────────

export interface ProgramActionState {
  errors?: { name?: string; school?: string; _form?: string }
}

export async function createProgramAction(
  _prev: ProgramActionState,
  formData: FormData,
): Promise<ProgramActionState> {
  const session = await auth()
  if (!session?.user?.id || !canManagePrograms(session.user.role)) {
    return { errors: { _form: 'Sin permisos para crear títulos.' } }
  }

  const result = await createProgramRecord(extractRawFields(formData))

  if (!result.success) return { errors: result.errors }

  redirect(`/titulos/${result.programId}`)
}

export async function updateProgramAction(
  id: string,
  _prev: ProgramActionState,
  formData: FormData,
): Promise<ProgramActionState> {
  const session = await auth()
  if (!session?.user?.id || !canManagePrograms(session.user.role)) {
    return { errors: { _form: 'Sin permisos para editar títulos.' } }
  }

  const result = await updateProgramRecord(id, extractRawFields(formData))

  if (!result.success) return { errors: result.errors }

  revalidatePath(`/titulos/${id}`)
  revalidatePath('/titulos')
  redirect(`/titulos/${id}`)
}

export interface DiscountActionState {
  errors?: { _form?: string }
  success?: boolean
}

/**
 * Permite al PM actualizar únicamente el descuento y su fecha de inicio de vigencia.
 * El coordinador y el admin pueden usar esta acción además del updateProgramAction completo.
 */
export async function updateDiscountAction(
  id: string,
  _prev: DiscountActionState,
  formData: FormData,
): Promise<DiscountActionState> {
  const session = await auth()
  if (!session?.user?.id || !canEditDiscount(session.user.role)) {
    return { errors: { _form: 'Sin permisos para editar el descuento.' } }
  }

  const activeDiscount = formData.get('activeDiscount') as string | null
  const discountValidFrom = formData.get('discountValidFrom') as string | null

  const result = await updateProgramDiscount(id, {
    activeDiscount: activeDiscount ? parseFloat(activeDiscount) : null,
    discountValidFrom: discountValidFrom ? new Date(discountValidFrom) : null,
  })

  if (!result.success) return { errors: { _form: result.error } }

  revalidatePath(`/titulos/${id}`)
  revalidatePath('/titulos')
  redirect(`/titulos/${id}`)
}

export async function deleteProgramAction(id: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id || !canManagePrograms(session.user.role)) return

  await deleteProgramById(id)
  revalidatePath('/titulos')
  redirect('/titulos')
}
