'use server'

import { redirect } from 'next/navigation'
import { auth } from '../../auth'
import { createBriefService } from '../../services/briefService'
import type { Channel, Mode } from '../../types/domain'

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
      title:              formData.get('title')              as string,
      programOrTitulation: formData.get('programOrTitulation') as string,
      objective:          formData.get('objective')          as string,
      audience:           formData.get('audience')           as string,
      channel:            formData.get('channel')            as Channel,
      mode:               formData.get('mode')               as Mode,
      valueProposition:   formData.get('valueProposition')   as string,
      cta:                formData.get('cta')                as string,
      constraints:        formData.get('constraints')        as string,
      emailSubject:       formData.get('emailSubject')       as string | null ?? undefined,
      emailPreheader:     formData.get('emailPreheader')     as string | null ?? undefined,
      emailTemplate:      formData.get('emailTemplate')      as string | null ?? undefined,
    },
    session.user.id,
  )

  if (!result.success) {
    return { errors: result.errors }
  }

  redirect(`/briefs/${result.briefId}`)
}
