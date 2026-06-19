import { NextResponse } from 'next/server'
import { auth } from '../../../../auth'
import { buildExportText } from '../../../../services/exportService'
import { canSeeAllBriefs } from '../../../../types/domain'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ briefId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { briefId } = await params
  let text: string

  try {
    const userIdFilter = canSeeAllBriefs(session.user.role) ? undefined : session.user.id
    text = await buildExportText(briefId, userIdFilter)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Briefing no encontrado')) {
      return NextResponse.json({ error: 'Briefing no encontrado' }, { status: 404 })
    }

    throw error
  }

  return new NextResponse(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="prisma-export-${briefId}.txt"`,
    },
  })
}
