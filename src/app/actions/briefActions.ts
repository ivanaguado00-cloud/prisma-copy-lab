'use server'

import { redirect } from 'next/navigation'
import { auth } from '../../auth'
import { createBriefService } from '../../services/briefService'
import { getBriefById } from '../../dao/briefDao'
import { generateSingle, generateAB } from '../../services/orchestrationService'
import type { Channel, Mode } from '../../types/domain'
import { GENERATION_MODE } from '../../types/domain'

export interface BriefActionState {
  errors?: { field: string; message: string }[]
}

export async function createBriefAction(
  _prevState: BriefActionState | null,
  formData: FormData,
): Promise<BriefActionState> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autenticado')
  }

  const result = await createBriefService(
    {
      title:               formData.get('title')               as string,
      programOrTitulation: formData.get('programOrTitulation') as string,
      programId:           (formData.get('programId') as string | null) ?? undefined,
      objective:           formData.get('objective')           as string,
      audience:           formData.get('audience')           as string,
      channel:            formData.get('channel')            as Channel,
      mode:               formData.get('mode')               as Mode,
      generationMode:     formData.get('generationMode')     as string | null ?? undefined,
      valueProposition:   formData.get('valueProposition')   as string,
      cta:                formData.get('cta')                as string,
      constraints:   formData.get('constraints')   as string,
      emailTemplate: formData.get('emailTemplate') as string | null ?? undefined,
    },
    session.user.id,
  )

  if (!result.success) {
    return { errors: result.errors }
  }

  const brief = await getBriefById(result.briefId!, session.user.id)
  if (brief) {
    if (brief.generationMode === GENERATION_MODE.ab_test) {
      await generateAB(brief)
    } else {
      await generateSingle(brief)
    }
  }

  redirect(`/briefs/${result.briefId}`)
}
