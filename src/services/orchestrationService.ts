import type { Brief, MessageVersion } from '../generated/prisma/client'
import { generateMessage, generateABVariant } from './generationService'
import { validateMessage } from './validationService'

interface GenerateSingleOptions {
  userInstruction?: string
  parentVersionId?: string
}

export async function generateSingle(
  brief: Brief,
  options: GenerateSingleOptions = {},
): Promise<MessageVersion> {
  const version = await generateMessage(brief, options)
  await validateMessage(version.id)
  return version
}

// Deprecated compatibility wrapper: public UI actions must expose one version per
// user request, so this no longer performs autonomous retry/refinement loops.
export async function generateAndApprove(
  brief: Brief,
  options: GenerateSingleOptions = {},
): Promise<MessageVersion> {
  return generateSingle(brief, options)
}

/** Generates Variant A and Variant B in parallel, validates each independently. */
export async function generateAB(brief: Brief): Promise<[MessageVersion, MessageVersion]> {
  // Generate A then B sequentially to avoid a versionNumber race on the unique constraint
  const versionA = await generateABVariant(brief, 'A')
  await validateMessage(versionA.id)
  const versionB = await generateABVariant(brief, 'B')
  await validateMessage(versionB.id)
  return [versionA, versionB]
}
