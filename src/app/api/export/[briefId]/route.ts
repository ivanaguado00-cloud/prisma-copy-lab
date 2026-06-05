import { NextResponse } from 'next/server'
import { buildExportText } from '../../../../services/exportService'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ briefId: string }> },
) {
  const { briefId } = await params
  const text = await buildExportText(briefId)

  return new NextResponse(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="prisma-export-${briefId}.txt"`,
    },
  })
}
