import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBriefById } from '../../../dao/briefDao'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Separator } from '../../../components/ui/separator'
import { Button } from '../../../components/ui/button'

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
}

const MODE_LABELS: Record<string, string> = {
  produccion: 'Producción',
  exploracion: 'Exploración',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="py-4">
      <dt className="text-sm font-medium text-zinc-500 mb-1">{label}</dt>
      <dd className="text-sm text-zinc-900 whitespace-pre-wrap">{value}</dd>
    </div>
  )
}

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const brief = await getBriefById(id)
  return {
    title: brief ? `${brief.title} — PRISMA Copy Lab` : 'Briefing no encontrado',
  }
}

export default async function BriefDetailPage({ params }: Props) {
  const { id } = await params
  const brief = await getBriefById(id)

  if (!brief) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/briefs">← Volver al listado</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{brief.title}</CardTitle>
          <p className="text-sm text-zinc-500">Creado el {formatDate(brief.createdAt)}</p>
        </CardHeader>

        <Separator />

        <CardContent className="pt-2">
          <dl className="divide-y divide-zinc-100">
            <DetailRow label="Titulación o programa" value={brief.programOrTitulation} />
            <DetailRow label="Objetivo" value={brief.objective} />
            <DetailRow label="Audiencia" value={brief.audience} />
            <DetailRow
              label="Canal"
              value={CHANNEL_LABELS[brief.channel] ?? brief.channel}
            />
            <DetailRow
              label="Modo"
              value={MODE_LABELS[brief.mode] ?? brief.mode}
            />
            <DetailRow label="Propuesta de valor" value={brief.valueProposition} />
            <DetailRow label="CTA" value={brief.cta} />
            <DetailRow label="Restricciones" value={brief.constraints} />
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
