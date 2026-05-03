import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBriefById } from '../../../dao/briefDao'
import { listVersionsByBrief } from '../../../dao/messageVersionDao'
import { generateMessageAction } from '../../actions/messageActions'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Separator } from '../../../components/ui/separator'
import { buttonVariants } from '../../../components/ui/button'
import { MessageVersionView } from '../../../components/messaging/MessageVersionView'

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
  const [brief, versions] = await Promise.all([
    getBriefById(id),
    listVersionsByBrief(id),
  ])

  if (!brief) {
    notFound()
  }

  const generateWithId = generateMessageAction.bind(null, id)

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/briefs" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          ← Volver al listado
        </Link>
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

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-800">
            Mensajes generados
            {versions.length > 0 && (
              <span className="ml-2 text-sm font-normal text-zinc-500">
                ({versions.length})
              </span>
            )}
          </h2>

          <form action={generateWithId}>
            <button
              type="submit"
              className={buttonVariants({
                variant: versions.length === 0 ? 'default' : 'outline',
                size: 'sm',
              })}
            >
              {versions.length === 0 ? 'Generar mensaje' : '+ Nueva versión'}
            </button>
          </form>
        </div>

        {versions.length === 0 ? (
          <p className="text-sm text-zinc-400 py-6 text-center border border-dashed border-zinc-200 rounded-lg">
            Aún no hay mensajes generados para este briefing.
          </p>
        ) : (
          <div className="space-y-4">
            {versions.map((version) => (
              <MessageVersionView key={version.id} version={version} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
