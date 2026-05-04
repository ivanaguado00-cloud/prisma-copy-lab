'use server'

import { redirect } from 'next/navigation'
import { getMessageVersionById } from '../../dao/messageVersionDao'
import { validateMessage } from '../../services/validationService'

export async function validateMessageAction(messageVersionId: string): Promise<void> {
  const version = await getMessageVersionById(messageVersionId)

  if (!version) {
    throw new Error('Versión de mensaje no encontrada')
  }

  await validateMessage(messageVersionId)

  redirect(`/briefs/${version.briefId}`)
}
