import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBriefById } from '../../../dao/briefDao'
import { listVersionsByBrief } from '../../../dao/messageVersionDao'
import { listValidationRunsByMessage } from '../../../dao/validationRunDao'
import { generateMessageAction, refineMessageAction } from '../../actions/messageActions'
import { validateMessageAction } from '../../actions/validationActions'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Separator } from '../../../components/ui/separator'
import { buttonVariants } from '../../../components/ui/button'
import { MessageVersionView } from '../../../components/messaging/MessageVersionView'
import { ValidationView } from '../../../components/validation/ValidationView'

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

  const validationRunsByVersion = Object.fromEntries(
    await Promise.all(
      versions.map(async (v) => {
        const runs = await listValidationRunsByMessage(v.id)
        return [v.id, runs[0] ?? null] as const
      }),
    ),
  )

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
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-zinc-800">
              Mensajes generados
              {versions.length > 0 && (
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  ({versions.length})
                </span>
              )}
            </h2>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                brief.mode === 'exploracion'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-50 text-blue-700'
              }`}
            >
              {MODE_LABELS[brief.mode]}
            </span>
          </div>

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
          <div className="space-y-6">
            {versions.map((version) => {
              const latestRun = validationRunsByVersion[version.id] ?? null
              const validateWithId = validateMessageAction.bind(null, version.id)
              const refineWithIds = refineMessageAction.bind(null, brief.id, version.id)
              return (
                <div key={version.id} className="space-y-3">
                  <MessageVersionView version={version} />
                  {latestRun ? (
                    <ValidationView run={latestRun} />
                  ) : (
                    <form action={validateWithId}>
                      <button
                        type="submit"
                        className={buttonVariants({ variant: 'outline', size: 'sm' })}
                      >
                        Validar mensaje
                      </button>
                    </form>
                  )}
                  <form action={refineWithIds} className="flex gap-2 items-end pt-1">
                    <textarea
                      name="userInstruction"
                      placeholder="Instrucción de ajuste: ej. 'hazlo más directo', 'reduce el tono promocional'…"
                      rows={2}
                      className="flex-1 text-sm rounded-md border border-zinc-200 px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400"
                    />
                    <button
                      type="submit"
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      Refinar
                    </button>
                  </form>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
